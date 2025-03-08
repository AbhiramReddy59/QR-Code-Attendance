const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function setupEmployee() {
    try {
        // Create roles if they don't exist
        await db.execute(`
            INSERT INTO roles (name) VALUES 
                ('admin'),
                ('employee')
            ON DUPLICATE KEY UPDATE name = VALUES(name)
        `);

        // Get employee role ID
        const [roles] = await db.execute('SELECT id FROM roles WHERE name = ?', ['employee']);
        if (roles.length === 0) {
            throw new Error('Employee role not found');
        }
        const employeeRoleId = roles[0].id;

        // User credentials
        const employee = {
            name: 'Abhiram Reddy E',
            email: 'abhiramreddye@outlook.com',
            password: 'Jarvis@1234',
            role_id: employeeRoleId
        };

        // Hash password with higher security
        const hashedPassword = await bcrypt.hash(employee.password, 12);

        // Check if employee exists
        const [existingUsers] = await db.execute(
            'SELECT id FROM employees WHERE email = ?',
            [employee.email]
        );

        if (existingUsers.length > 0) {
            // Update existing employee
            await db.execute(
                'UPDATE employees SET name = ?, password = ?, role_id = ? WHERE email = ?',
                [employee.name, hashedPassword, employee.role_id, employee.email]
            );
            console.log('Employee updated successfully');
        } else {
            // Create new employee
            await db.execute(
                'INSERT INTO employees (name, email, password, role_id) VALUES (?, ?, ?, ?)',
                [employee.name, employee.email, hashedPassword, employee.role_id]
            );
            console.log('Employee created successfully');
        }

        console.log('Setup completed successfully');
        console.log('Email:', employee.email);
        console.log('Password:', employee.password);
        
        process.exit(0);
    } catch (error) {
        console.error('Setup error:', error);
        process.exit(1);
    }
}

setupEmployee();
