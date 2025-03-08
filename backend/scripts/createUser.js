const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function createUser() {
    try {
        // Generate password hash
        const password = 'test123'; // We'll use this password for testing
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // First ensure we have the employee role
        const [roles] = await db.execute('SELECT id FROM roles WHERE name = ?', ['employee']);
        if (roles.length === 0) {
            console.error('Employee role not found');
            process.exit(1);
        }
        
        // Create test employee
        await db.execute(
            'INSERT INTO employees (name, email, password, role_id) VALUES (?, ?, ?, ?)',
            ['Test User', 'test@example.com', hashedPassword, roles[0].id]
        );
        
        console.log('Test user created successfully');
        console.log('Email: test@example.com');
        console.log('Password: test123');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating test user:', error);
        process.exit(1);
    }
}

createUser();
