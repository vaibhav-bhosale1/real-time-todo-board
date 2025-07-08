const ActionLog = require('../models/ActionLog');

const logAction = async (userId, actionType, taskId = null, taskTitle = null, description) => {
  try {
    await ActionLog.create({
      user: userId,
      actionType,
      taskId,
      taskTitle,
      description,
    });
  } catch (error) {
    console.error('Error logging action:', error);
    // In a real application, you might want more robust error handling for logging
  }
};

module.exports = logAction;