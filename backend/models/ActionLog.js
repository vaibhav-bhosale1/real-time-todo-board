const mongoose = require('mongoose');

const actionLogSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // User who performed the action
    },
    actionType: {
      type: String,
      required: true,
      enum: ['created', 'updated', 'deleted', 'assigned', 'status_change', 'priority_change', 'drag_drop'],
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: false, // Not required for user-related actions, but for task actions
    },
    taskTitle: {
      type: String, // Store task title directly in log for easier display if task is deleted
      required: false,
    },
    description: {
      type: String, // A human-readable description of the action
      required: true,
    },
    // You might add 'oldValue' and 'newValue' fields for more detailed logging if needed
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

const ActionLog = mongoose.model('ActionLog', actionLogSchema);

module.exports = ActionLog;