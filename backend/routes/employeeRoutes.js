const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createEmployee, getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { getProfile } = require('../controllers/profileController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Validation middleware
const employeeValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('position').trim().notEmpty().withMessage('Position is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// Get employee profile
router.get('/profile', verifyToken, getProfile);

// Admin routes
router.post('/', verifyToken, isAdmin, employeeValidation, createEmployee);
router.get('/', verifyToken, isAdmin, getAllEmployees);
router.get('/:id', verifyToken, isAdmin, getEmployeeById);
router.put('/:id', verifyToken, isAdmin, employeeValidation, updateEmployee);
router.delete('/:id', verifyToken, isAdmin, deleteEmployee);

module.exports = router;
