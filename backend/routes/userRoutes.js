const express = require('express');
const { registerUser, authUser } = require('../controllers/userController');
const router = express.Router();

// Public routes for registration and login
router.post('/register', registerUser);
router.post('/login', authUser);

module.exports = router;