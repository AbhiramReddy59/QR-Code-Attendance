const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const { markAttendance, getPersonalAttendance } = require('../controllers/attendanceController');

// Mark attendance route
router.post('/mark', verifyToken, markAttendance);

// Get personal attendance history
router.get('/personal', verifyToken, getPersonalAttendance);

module.exports = router;