const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../controllers/authController');
const db = require('../config/database');

// POST /api/attendance/mark - Mark attendance
router.post('/mark', verifyToken, async (req, res) => {
    try {
        const { type } = req.body; // type can be 'check-in' or 'check-out'
        const employeeId = req.user.id;
        const now = new Date();

        // Check if employee already has an attendance record for today
        const [existingRecords] = await db.execute(`
            SELECT id, check_in, check_out 
            FROM attendance 
            WHERE employee_id = ? 
            AND DATE(check_in) = DATE(?)
        `, [employeeId, now]);

        if (type === 'check-in') {
            if (existingRecords.length > 0 && existingRecords[0].check_in) {
                return res.status(400).json({
                    success: false,
                    message: 'Already checked in today'
                });
            }

            await db.execute(
                'INSERT INTO attendance (employee_id, check_in) VALUES (?, ?)',
                [employeeId, now]
            );

            res.json({
                success: true,
                message: 'Check-in successful',
                timestamp: now
            });
        } else if (type === 'check-out') {
            if (existingRecords.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No check-in record found for today'
                });
            }

            if (existingRecords[0].check_out) {
                return res.status(400).json({
                    success: false,
                    message: 'Already checked out today'
                });
            }

            const checkIn = new Date(existingRecords[0].check_in);
            const hoursWorked = (now - checkIn) / (1000 * 60 * 60); // Convert to hours

            await db.execute(
                'UPDATE attendance SET check_out = ?, hours_worked = ? WHERE id = ?',
                [now, hoursWorked, existingRecords[0].id]
            );

            res.json({
                success: true,
                message: 'Check-out successful',
                timestamp: now,
                hoursWorked: Math.round(hoursWorked * 100) / 100
            });
        }
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking attendance'
        });
    }
});

// GET /api/attendance/personal - Get personal attendance history
router.get('/personal', verifyToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const employeeId = req.user.id;

        const [records] = await db.execute(`
            SELECT 
                a.*,
                e.name as employee_name,
                e.email as employee_email
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE a.employee_id = ?
            AND DATE(a.check_in) BETWEEN DATE(?) AND DATE(?)
            ORDER BY a.check_in DESC
        `, [employeeId, startDate || new Date(), endDate || new Date()]);

        res.json({
            success: true,
            records
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance records'
        });
    }
});

// GET /api/attendance/report - Get attendance report (admin only)
router.get('/report', [verifyToken, isAdmin], async (req, res) => {
    try {
        const { startDate, endDate, employeeId } = req.query;

        let query = `
            SELECT 
                a.*,
                e.name as employee_name,
                e.email as employee_email
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE DATE(a.check_in) BETWEEN DATE(?) AND DATE(?)
        `;
        let params = [startDate || new Date(), endDate || new Date()];

        if (employeeId) {
            query += ' AND a.employee_id = ?';
            params.push(employeeId);
        }

        query += ' ORDER BY a.check_in DESC';

        const [records] = await db.execute(query, params);

        res.json({
            success: true,
            records
        });
    } catch (error) {
        console.error('Error fetching attendance report:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance report'
        });
    }
});

module.exports = router;
