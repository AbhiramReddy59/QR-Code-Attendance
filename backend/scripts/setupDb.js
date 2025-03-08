const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function setupDatabase() {
    try {
        // Create connection without database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        console.log('Connected to MySQL server');

        // Create database
        await connection.query('CREATE DATABASE IF NOT EXISTS vts');
        await connection.query('USE vts');
        console.log('Database created/selected');

        // Drop existing tables in correct order
        await connection.query('DROP TABLE IF EXISTS attendance');
        await connection.query('DROP TABLE IF EXISTS employees');
        await connection.query('DROP TABLE IF EXISTS locations');
        await connection.query('DROP TABLE IF EXISTS roles');

        // Create roles table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Roles table created');

        // Insert default roles
        await connection.query(`
            INSERT INTO roles (name) VALUES 
            ('admin'),
            ('employee')
            ON DUPLICATE KEY UPDATE name = VALUES(name)
        `);
        console.log('Default roles inserted');

        // Create locations table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS locations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                address VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Locations table created');

        // Insert default location
        await connection.query(`
            INSERT INTO locations (id, name, address) VALUES 
            (1, 'Main Office', '123 Main Street')
            ON DUPLICATE KEY UPDATE name = VALUES(name), address = VALUES(address)
        `);
        console.log('Default location inserted');

        // Create employees table with role_id
        await connection.query(`
            CREATE TABLE IF NOT EXISTS employees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                department VARCHAR(100),
                position VARCHAR(100),
                role_id INT NOT NULL,
                qr_code TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (role_id) REFERENCES roles(id)
            )
        `);
        console.log('Employees table created');

        // Create attendance table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id INT NOT NULL,
                check_in DATETIME NOT NULL,
                check_out DATETIME,
                hours_worked DECIMAL(5,2),
                location_id INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(id),
                FOREIGN KEY (location_id) REFERENCES locations(id)
            )
        `);
        console.log('Attendance table created');

        // Hash password for test users
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('Jarvis@1234', salt);

        // Get role IDs
        const [roles] = await connection.query('SELECT id, name FROM roles');
        const adminRoleId = roles.find(r => r.name === 'admin').id;
        const employeeRoleId = roles.find(r => r.name === 'employee').id;

        // Insert test employees
        await connection.query(`
            INSERT INTO employees (name, email, password, department, position, role_id) VALUES 
            ('Admin', 'admin@example.com', ?, 'Management', 'Administrator', ?),
            ('Abhiram Reddy E', 'abhiramreddye@outlook.com', ?, 'Engineering', 'Developer', ?)
            ON DUPLICATE KEY UPDATE 
            password = VALUES(password),
            department = VALUES(department),
            position = VALUES(position),
            role_id = VALUES(role_id)
        `, [password, adminRoleId, password, employeeRoleId]);
        console.log('Test employees inserted');

        console.log('Database setup completed successfully');
        await connection.end();
    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
}

setupDatabase();
