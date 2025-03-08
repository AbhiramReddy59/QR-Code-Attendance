const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../controllers/authController');
const db = require('../config/database');

// GET /api/employees/profile - Get current employee's profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const [employees] = await db.execute(`
            SELECT 
                e.id,
                e.name,
                e.email,
                r.name as role
            FROM employees e
            JOIN roles r ON e.role_id = r.id
            WHERE e.id = ?
        `, [req.user.id]);

        if (employees.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            employee: employees[0]
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
});

// GET /api/employees - Get all employees (admin only)
router.get('/', [verifyToken, isAdmin], async (req, res) => {
    try {
        const [employees] = await db.execute(`
            SELECT 
                e.id,
                e.name,
                e.email,
                r.name as role
            FROM employees e
            JOIN roles r ON e.role_id = r.id
            ORDER BY e.name
        `);

        res.json({
            success: true,
            employees
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employees'
        });
    }
});

// PUT /api/employees/profile - Update current employee's profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }

        await db.execute(
            'UPDATE employees SET name = ?, email = ? WHERE id = ?',
            [name, email, req.user.id]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
});

module.exports = router;
