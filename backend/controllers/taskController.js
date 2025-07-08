const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const User = require('../models/User'); // Needed for Smart Assign and assignedTo validation

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

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, assignedTo } = req.body;

  if (!title || !status) {
    res.status(400);
    throw new Error('Please add a title and status for the task');
  }

  // Validation: Task titles must be unique per board [cite: 38]
  // For now, let's consider "per board" as unique for the creating user's tasks
  // In a truly shared board, this would require a 'board' ID.
  // For this assignment, we'll assume uniqueness among tasks the user has access to.
  const existingTask = await Task.findOne({ user: req.user.id, title: title });
  if (existingTask) {
    res.status(400);
    throw new Error('Task title must be unique.'); 
  }

  // Validation: Task titles must not match column names [cite: 38]
  if (COLUMN_NAMES.includes(title)) {
    res.status(400);
    throw new Error(`Task title cannot be "${title}", as it matches a column name.`); 
  }

  // Validate assignedTo if provided
  let assignedUser = null;
  if (assignedTo) {
    assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      res.status(400);
      throw new Error('Assigned user not found.');
    }
  }

  const task = await Task.create({
    user: req.user.id, // Creator of the task is the logged-in user
    title,
    description,
    status,
    priority,
    assignedTo: assignedUser ? assignedUser._id : undefined,
  });

  res.status(201).json(task);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, assignedTo } = req.body;
  const taskId = req.params.id;

  // Find the task
  const task = await Task.findById(taskId);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Ensure the logged-in user is the creator of the task OR is the assigned user
  // or if implementing a truly collaborative board, allow update if user has access.
  // For now, let's assume only the creator or assigned user can update.
  if (task.user.toString() !== req.user.id && (task.assignedTo && task.assignedTo.toString() !== req.user.id)) {
    res.status(401);
    throw new Error('Not authorized to update this task');
  }

  // Validation: Task titles must be unique per board (excluding current task's title) [cite: 38]
  if (title && title !== task.title) {
    const existingTask = await Task.findOne({ user: req.user.id, title: title });
    if (existingTask && existingTask._id.toString() !== taskId) {
      res.status(400);
      throw new Error('Task title must be unique.'); 
    }
  }

  // Validation: Task titles must not match column names [cite: 38]
  if (title && COLUMN_NAMES.includes(title)) {
    res.status(400);
    throw new Error(`Task title cannot be "${title}", as it matches a column name.`); 
  }

  // Validate assignedTo if provided
  let assignedUser = null;
  if (assignedTo) {
    assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      res.status(400);
      throw new Error('Assigned user not found.');
    }
  }

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    {
      title: title || task.title,
      description: description || task.description,
      status: status || task.status,
      priority: priority || task.priority,
      assignedTo: assignedUser ? assignedUser._id : undefined, // Allow setting to undefined for unassigning
    },
    { new: true } // Return the updated document
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

  // Ensure the logged-in user is the creator of the task
  if (task.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to delete this task');
  }

  await task.deleteOne(); // Mongoose 6+ uses deleteOne() or deleteMany()

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

  // We need to find all active users (users who have created or been assigned tasks)
  // And then count their active (Todo or In Progress) tasks
  const users = await User.find({}); // Get all users in the system

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

  // Sort by task count to find the user with the fewest tasks
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
  ).populate('assignedTo', 'username email'); // Populate to return assigned user details

  res.status(200).json(updatedTask);
});


module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  smartAssignTask,
};