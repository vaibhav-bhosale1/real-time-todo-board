const express = require('express');
const {
  getTasks,
  createTask,
  updateTask,
  getTask,
  deleteTask,
  smartAssignTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware
const router = express.Router();

// All task routes will be protected
router.route('/').get(protect, getTasks).post(protect, createTask);
router.route('/:id').get(protect,getTask).put(protect, updateTask).delete(protect, deleteTask);
router.route('/:id/smart-assign').put(protect, smartAssignTask);

module.exports = router;