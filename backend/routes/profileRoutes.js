const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const { getProfile, updateProfile } = require('../controllers/profileController');

// Get user profile - accessible by all authenticated users
router.get('/', verifyToken, getProfile);

// Update user profile - accessible by all authenticated users
router.put('/', verifyToken, updateProfile);

module.exports = router;
