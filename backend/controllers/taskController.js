const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
// REMOVE THIS LINE: const { io } = require('../server'); // This is the problematic line
const User = require('../models/User'); // Needed for Smart Assign and assignedTo validation
const logAction = require('../utils/logAction'); 

// Column names for validation (from assignment brief)
const COLUMN_NAMES = ['Todo', 'In Progress', 'Done']; 

// @desc    Get all tasks for a user
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
    // No need for io here, so no change required unless you plan to add real-time fetch events
    const tasks = await Task.find({
        $or: [
            { user: req.user.id },
            { assignedTo: req.user.id }
        ]
    })
    .populate('user', 'username email') // Populate creator details
    .populate('assignedTo', 'username email'); // Populate assigned user details
 
    res.status(200).json(tasks);
});




// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id)
                            .populate('user', 'username email')
                            .populate('assignedTo', 'username email');

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    res.status(200).json(task);
});


const createTask = asyncHandler(async (req, res) => {
    // Retrieve the Socket.IO instance from the app object
    const io = req.app.get('io'); // ADD THIS LINE

    if (!req.user) {
        res.status(401);
        throw new Error('User not authorized');
    }
    const { title, description, status, priority, assignedTo } = req.body;

    if (!title || !description || !status || !priority) {
        res.status(400);
        throw new Error('Please provide all required fields: title, description, status, and priority.');
    }

    // Validation: Task titles must be unique per board
    const existingTask = await Task.findOne({ user: req.user.id, title: title });
    if (existingTask) {
        res.status(400);
        throw new Error('Task title must be unique.');
    }

    // Validation: Task titles must not match column names
    if (COLUMN_NAMES.includes(title)) {
        res.status(400);
        throw new Error(`Task title cannot be "${title}", as it matches a column name.`);
    }

    let assignedUser = null;
    if (assignedTo) {
        assignedUser = await User.findById(assignedTo);
        if (!assignedUser) {
            res.status(400);
            throw new Error('Assigned user not found.');
        }
    }

    const task = await Task.create({
        user: req.user.id,
        title,
        description,
        status,
        priority,
        assignedTo: assignedUser ? assignedUser._id : undefined,
    });

    // Populate user and assignedTo details before emitting
    const populatedTask = await Task.findById(task._id)
                                  .populate('user', 'username email')
                                  .populate('assignedTo', 'username email');

    if (populatedTask) {
        // Emit 'taskCreated' event to all connected clients
        if (io) { // Defensive check: ensure io is available
            io.emit('taskCreated', populatedTask); // Use the retrieved io instance
        }
        await logAction(
            req.user.id,
            'created',
            populatedTask._id,
            populatedTask.title,
            `${req.user.username} created task "${populatedTask.title}"`
        );
        res.status(201).json(populatedTask);
    } else {
        res.status(400);
        throw new Error('Invalid task data');
    }
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
    // Retrieve the Socket.IO instance from the app object
    const io = req.app.get('io'); // ADD THIS LINE

    const { title, description, status, priority, assignedTo, version } = req.body;
    const taskId = req.params.id;

    if (version === undefined || version === null) {
        res.status(400);
        throw new Error('Task version is required for updates.');
    }

    const existingTaskForAuth = await Task.findById(taskId);

    if (!existingTaskForAuth) {
        res.status(404);
        throw new Error('Task not found');
    }

    if (existingTaskForAuth.user.toString() !== req.user.id && (existingTaskForAuth.assignedTo && existingTaskForAuth.assignedTo.toString() !== req.user.id)) {
        res.status(401);
        throw new Error('Not authorized to update this task');
    }

    if (title && title !== existingTaskForAuth.title) {
        const existingTaskWithSameTitle = await Task.findOne({ user: req.user.id, title: title });
        if (existingTaskWithSameTitle && existingTaskWithSameTitle._id.toString() !== taskId) {
            res.status(400);
            throw new Error('Task title must be unique.');
        }
    }

    if (title && COLUMN_NAMES.includes(title)) {
        res.status(400);
        throw new Error(`Task title cannot be "${title}", as it matches a column name.`);
    }

    let assignedUser = null;
    if (assignedTo) {
        assignedUser = await User.findById(assignedTo);
        if (!assignedUser) {
            res.status(400);
            throw new Error('Assigned user not found.');
        }
    }

    const updateFields = {
        title: title || existingTaskForAuth.title,
        description: description || existingTaskForAuth.description,
        status: status || existingTaskForAuth.status,
        priority: priority || existingTaskForAuth.priority,
        assignedTo: assignedUser ? assignedUser._id : null,
        $inc: { version: 1 }
    };

    const updatedTask = await Task.findOneAndUpdate(
        {
            _id: taskId,
            version: version,
        },
        updateFields,
        { new: true }
    ).populate('user', 'username email')
    .populate('assignedTo', 'username email');

    if (!updatedTask) {
        res.status(409);
        throw new Error('Conflict: Task has been updated by another user. Please refresh and try again.');
    }

    // Emit 'taskUpdated' event to all connected clients
    if (io) { // Defensive check
        io.emit('taskUpdated', updatedTask); // Use the retrieved io instance
    }

    let updateDescription = `${req.user.username} updated task "${updatedTask.title}"`;
    if (status && status !== existingTaskForAuth.status) {
        updateDescription += ` (status changed from ${existingTaskForAuth.status} to ${status})`;
    }
    if (assignedTo && assignedTo !== (existingTaskForAuth.assignedTo ? existingTaskForAuth.assignedTo.toString() : null)) {
        const assignedUsername = updatedTask.assignedTo ? updatedTask.assignedTo.username : 'unassigned';
        updateDescription += ` (assigned to ${assignedUsername})`;
    } else if (!assignedTo && (existingTaskForAuth.assignedTo)) {
        updateDescription += ` (unassigned)`;
    }

    await logAction(
        req.user.id,
        'updated',
        updatedTask._id,
        updatedTask.title,
        updateDescription
    );

    res.status(200).json(updatedTask);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
    // Retrieve the Socket.IO instance from the app object
    const io = req.app.get('io'); // ADD THIS LINE

    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    if (task.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to delete this task');
    }

    const deletedTaskTitle = task.title;
    await task.deleteOne();

    // Emit 'taskDeleted' event to all connected clients
    if (io) { // Defensive check
        io.emit('taskDeleted', req.params.id); // Use the retrieved io instance
    }
    await logAction(
        req.user.id,
        'deleted',
        null,
        deletedTaskTitle,
        `${req.user.username} deleted task "${deletedTaskTitle}"`
    );
    res.status(200).json({ id: req.params.id, message: 'Task removed' });
});

// @desc    Assign a task to the user with the fewest current active tasks
// @route   PUT /api/tasks/:id/smart-assign
// @access  Private
const smartAssignTask = asyncHandler(async (req, res) => {
    // Retrieve the Socket.IO instance from the app object
    const io = req.app.get('io'); // ADD THIS LINE

    const taskId = req.params.id;
    const { version } = req.body;
    if (version === undefined || version === null) {
        res.status(400);
        throw new Error('Task version is required for smart-assign.');
    }
    const task = await Task.findById(taskId);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const users = await User.find({});

    let userTaskCounts = [];

    for (const user of users) {
        const activeTasksCount = await Task.countDocuments({
            $or: [
                { user: user._id, status: { $in: ['Todo', 'In Progress'] } },
                { assignedTo: user._id, status: { $in: ['Todo', 'In Progress'] } }
            ]
        });
        userTaskCounts.push({ userId: user._id, username: user.username, count: activeTasksCount });
    }

    userTaskCounts.sort((a, b) => a.count - b.count);

    if (userTaskCounts.length === 0) {
        res.status(400);
        throw new Error('No users available to assign tasks.');
    }

    const userToAssign = userTaskCounts[0];

    const updatedTask = await Task.findOneAndUpdate(
        {
            _id: taskId,
            version: version,
        },
        {
            assignedTo: userToAssign.userId,
            $inc: { version: 1 }
        },
        { new: true }
    ).populate('assignedTo', 'username email')
    .populate('user', 'username email');

    if (!updatedTask) {
        res.status(409);
        throw new Error('Conflict: Task has been updated by another user. Please refresh and try again.');
    }

    // Emit 'taskUpdated' event for smart assign as well
    if (io) { // Defensive check
        io.emit('taskUpdated', updatedTask); // Use the retrieved io instance
    }

    await logAction(
        req.user.id,
        'assigned',
        updatedTask._id,
        updatedTask.title,
        `${req.user.username} smart-assigned task "${updatedTask.title}" to ${updatedTask.assignedTo.username}`
    );
    res.status(200).json(updatedTask);
});

module.exports = {
    getTasks,
    createTask,
    updateTask,
    getTask,
    deleteTask,
    smartAssignTask,
};