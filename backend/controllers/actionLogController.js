const asyncHandler = require('express-async-handler');
const ActionLog = require('../models/ActionLog');

// @desc    Get last 20 action logs
// @route   GET /api/actions
// @access  Private
const getRecentActions = asyncHandler(async (req, res) => {
  // Find recent actions, sort by createdAt descending, and limit to 20
  const actions = await ActionLog.find({})
    .sort({ createdAt: -1 }) // Sort by most recent first
    .limit(20) // Get only the last 20 actions
    .populate('user', 'username email'); // Populate user who performed the action

  res.status(200).json(actions);
});

module.exports = { getRecentActions };