const express = require('express');
const router = express.Router();
const { login, logout, verifyToken } = require('../controllers/authController');

// Login route
router.post('/login', login);

// Logout route
router.post('/logout', verifyToken, logout);

// Verify token route (for frontend to check auth status)
router.get('/verify', verifyToken, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

module.exports = router;
