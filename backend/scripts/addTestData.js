const db = require('../config/database');

const addTestData = async () => {
    try {
        // Get the employee ID
        const [employees] = await db.execute(
            'SELECT id FROM employees WHERE email = ?',
            ['abhiramreddye@outlook.com']
        );

        if (employees.length === 0) {
            console.error('Employee not found');
            process.exit(1);
        }

        const employeeId = employees[0].id;

        // Add some test attendance records for the past week
        const records = [
            // Today check-in
            {
                check_in: new Date(),
                check_out: null,
                hours_worked: null
            },
            // Yesterday
            {
                check_in: new Date(Date.now() - 24 * 60 * 60 * 1000),
                check_out: new Date(Date.now() - 16 * 60 * 60 * 1000),
                hours_worked: 8
            },
            // 2 days ago
            {
                check_in: new Date(Date.now() - 48 * 60 * 60 * 1000),
                check_out: new Date(Date.now() - 40 * 60 * 60 * 1000),
                hours_worked: 8
            },
            // 3 days ago
            {
                check_in: new Date(Date.now() - 72 * 60 * 60 * 1000),
                check_out: new Date(Date.now() - 64 * 60 * 60 * 1000),
                hours_worked: 8
            }
        ];

        // Insert records
        for (const record of records) {
            await db.execute(
                'INSERT INTO attendance (employee_id, check_in, check_out, hours_worked) VALUES (?, ?, ?, ?)',
                [employeeId, record.check_in, record.check_out, record.hours_worked]
            );
        }

        console.log('Test attendance records added successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error adding test data:', error);
        process.exit(1);
    }
};

addTestData();
