const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const { io } = require('../server');
const User = require('../models/User'); // Needed for Smart Assign and assignedTo validation
const logAction = require('../utils/logAction'); 

// Column names for validation (from assignment brief)
const COLUMN_NAMES = ['Todo', 'In Progress', 'Done']; 

// @desc    Get all tasks for a user
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  // Fetch tasks created by the logged-in user OR assigned to the logged-in user
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
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, assignedTo } = req.body;

  if (!title || !status) {
    res.status(400);
    throw new Error('Please add a title and status for the task');
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
    // Emit 'newTask' event to all connected clients
    io.emit('taskCreated', populatedTask); // Emitting the new task data
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
  const { title, description, status, priority, assignedTo } = req.body;
  const taskId = req.params.id;

  const task = await Task.findById(taskId);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.user.toString() !== req.user.id && (task.assignedTo && task.assignedTo.toString() !== req.user.id)) {
    res.status(401);
    throw new Error('Not authorized to update this task');
  }

  // Validation: Task titles must be unique per board (excluding current task's title)
  if (title && title !== task.title) {
    const existingTask = await Task.findOne({ user: req.user.id, title: title });
    if (existingTask && existingTask._id.toString() !== taskId) {
      res.status(400);
      throw new Error('Task title must be unique.');
    }
  }

  // Validation: Task titles must not match column names
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

const oldStatus = task.status;
  const oldAssignedTo = task.assignedTo ? task.assignedTo.toString() : null;

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    {
      title: title || task.title,
      description: description || task.description,
      status: status || task.status,
      priority: priority || task.priority,
      assignedTo: assignedUser ? assignedUser._id : null, // Set to null for unassigning, not undefined
    },
    { new: true }
  ).populate('user', 'username email') // Populate creator details
   .populate('assignedTo', 'username email'); // Populate assigned user details

  // Emit 'taskUpdated' event to all connected clients
  io.emit('taskUpdated', updatedTask); // Emitting the updated task data

  let updateDescription = `${req.user.username} updated task "${updatedTask.title}"`;
  if (status && status !== oldStatus) {
    updateDescription += ` (status changed from ${oldStatus} to ${status})`;
  }
  if (assignedTo && assignedTo !== oldAssignedTo) {
    const assignedUsername = updatedTask.assignedTo ? updatedTask.assignedTo.username : 'unassigned';
    updateDescription += ` (assigned to ${assignedUsername})`;
  } else if (!assignedTo && oldAssignedTo) { // Task was unassigned
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
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to delete this task');
  }

 

    const deletedTaskTitle = task.title; // Capture title before deletion
  await task.deleteOne();

  // Emit 'taskDeleted' event to all connected clients
  io.emit('taskDeleted', req.params.id); // Emitting the ID of the deleted task
  await logAction(
    req.user.id,
    'deleted',
    null, // No taskId reference as it's deleted
    deletedTaskTitle,
    `${req.user.username} deleted task "${deletedTaskTitle}"`
  );
  res.status(200).json({ id: req.params.id, message: 'Task removed' });
});

// @desc    Assign a task to the user with the fewest current active tasks
// @route   PUT /api/tasks/:id/smart-assign
// @access  Private
const smartAssignTask = asyncHandler(async (req, res) => {
  const taskId = req.params.id;

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

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { assignedTo: userToAssign.userId },
    { new: true }
  ).populate('assignedTo', 'username email')
   .populate('user', 'username email'); // Also populate creator for consistency in real-time updates

  // Emit 'taskUpdated' event for smart assign as well
  io.emit('taskUpdated', updatedTask);
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
  deleteTask,
  smartAssignTask,
};