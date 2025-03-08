const db = require('../config/database');
require('dotenv').config();

async function addTestAttendance() {
    try {
        // Get employee ID
        const [employees] = await db.execute(
            'SELECT id FROM employees WHERE email = ?',
            ['abhiramreddye@outlook.com']
        );

        if (employees.length === 0) {
            console.error('Employee not found');
            return;
        }

        const employeeId = employees[0].id;

        // Add test attendance records for the past week
        const records = [
            // Today
            {
                check_in: new Date(new Date().setHours(9, 0, 0)),
                check_out: new Date(new Date().setHours(17, 30, 0))
            },
            // Yesterday
            {
                check_in: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(9, 15, 0),
                check_out: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(17, 45, 0)
            },
            // 2 days ago
            {
                check_in: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(9, 30, 0),
                check_out: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(18, 0, 0)
            },
            // 3 days ago
            {
                check_in: new Date(new Date().setDate(new Date().getDate() - 3)).setHours(9, 0, 0),
                check_out: new Date(new Date().setDate(new Date().getDate() - 3)).setHours(17, 0, 0)
            },
            // 4 days ago
            {
                check_in: new Date(new Date().setDate(new Date().getDate() - 4)).setHours(9, 45, 0),
                check_out: new Date(new Date().setDate(new Date().getDate() - 4)).setHours(18, 15, 0)
            }
        ];

        // Insert records
        for (const record of records) {
            await db.execute(
                'INSERT INTO attendance (employee_id, check_in, check_out) VALUES (?, ?, ?)',
                [employeeId, new Date(record.check_in), new Date(record.check_out)]
            );
        }

        console.log('Test attendance records added successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error adding test attendance:', error);
        process.exit(1);
    }
}

addTestAttendance();
