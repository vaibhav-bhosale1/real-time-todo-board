const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    status: {
      type: String,
      required: true,
      enum: ['Todo', 'In Progress', 'Done'],
      default: 'Todo',
    },
    priority: {
      type: String,
      required: false,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    version: { // New field for optimistic concurrency
      type: Number,
      default: 0, // Start at version 0
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false, // Disable Mongoose's default __v version key
  }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;