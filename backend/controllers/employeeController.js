const { validationResult } = require('express-validator');
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { generateEmployeeQRCode } = require('../utils/emailService');

const createEmployee = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, department, position, password } = req.body;
        
        // Check if employee already exists
        const [existingEmployee] = await db.execute(
            'SELECT * FROM employees WHERE email = ?',
            [email]
        );

        if (existingEmployee.length > 0) {
            return res.status(400).json({ message: 'Employee already exists' });
        }

        // Hash password for employee login
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new employee
        const [result] = await db.execute(
            'INSERT INTO employees (name, email, department, position) VALUES (?, ?, ?, ?)',
            [name, email, department, position]
        );

        const employeeId = result.insertId;
        
        // Create user account for employee
        await db.execute(
            'INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, false]
        );

        // Generate QR code
        const qrCode = await generateEmployeeQRCode({
            id: employeeId,
            email,
            name
        });

        // Update employee with QR code
        await db.execute(
            'UPDATE employees SET qr_code = ? WHERE id = ?',
            [qrCode, employeeId]
        );

        res.status(201).json({
            message: 'Employee created successfully',
            employee: {
                id: employeeId,
                name,
                email,
                department,
                position,
                qrCode
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllEmployees = async (req, res) => {
    try {
        const [employees] = await db.execute(
            'SELECT id, name, email, department, position, qr_code FROM employees'
        );
        res.json(employees);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getEmployeeById = async (req, res) => {
    try {
        const [employee] = await db.execute(
            'SELECT id, name, email, department, position, qr_code FROM employees WHERE id = ?',
            [req.params.id]
        );

        if (employee.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(employee[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateEmployee = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, department, position } = req.body;
        const employeeId = req.params.id;

        // Check if employee exists
        const [existingEmployee] = await db.execute(
            'SELECT * FROM employees WHERE id = ?',
            [employeeId]
        );

        if (existingEmployee.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Update employee
        await db.execute(
            'UPDATE employees SET name = ?, email = ?, department = ?, position = ? WHERE id = ?',
            [name, email, department, position, employeeId]
        );

        // Update user account
        await db.execute(
            'UPDATE users SET name = ?, email = ? WHERE email = ?',
            [name, email, existingEmployee[0].email]
        );

        // Generate new QR code
        const qrCode = await generateEmployeeQRCode({
            id: employeeId,
            email,
            name
        });

        // Update QR code
        await db.execute(
            'UPDATE employees SET qr_code = ? WHERE id = ?',
            [qrCode, employeeId]
        );

        res.json({
            message: 'Employee updated successfully',
            employee: {
                id: employeeId,
                name,
                email,
                department,
                position,
                qrCode
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const [employee] = await db.execute(
            'SELECT email FROM employees WHERE id = ?',
            [req.params.id]
        );

        if (employee.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Delete from users table first
        await db.execute(
            'DELETE FROM users WHERE email = ?',
            [employee[0].email]
        );

        // Delete from employees table
        await db.execute(
            'DELETE FROM employees WHERE id = ?',
            [req.params.id]
        );

        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};
