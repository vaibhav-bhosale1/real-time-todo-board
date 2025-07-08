const express = require('express');
const { getRecentActions } = require('../controllers/actionLogController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Protect this route as well
router.route('/').get(protect, getRecentActions);

module.exports = router;