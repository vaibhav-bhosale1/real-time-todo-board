const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
    title: {
      type: String,
      required: true,
      trim: true,
      // Validation for uniqueness per board and not matching column names will be handled in controller
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId, // User ID to whom the task is assigned
      ref: 'User',
      required: false, // Not required at creation, can be assigned later
    },
    status: {
      type: String,
      required: true,
      enum: ['Todo', 'In Progress', 'Done'], // Allowed statuses 
      default: 'Todo',
    },
    priority: {
      type: String,
      required: false,
      enum: ['Low', 'Medium', 'High'], // Allowed priorities 
      default: 'Medium',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;