const express = require('express');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  smartAssignTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware
const router = express.Router();

// All task routes will be protected
router.route('/').get(protect, getTasks).post(protect, createTask);
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);
router.put('/:id/smart-assign', protect, smartAssignTask); // Smart assign route [cite: 33]

module.exports = router;