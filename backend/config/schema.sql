-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS vts;
USE vts;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS roles;

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Insert default roles
INSERT INTO roles (name) VALUES 
    ('admin'),
    ('employee')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    check_in DATETIME NOT NULL,
    check_out DATETIME,
    hours_worked DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Insert employee record
INSERT INTO employees (name, email, password, role_id)
SELECT 'Abhiram Reddy E', 'abhiramreddye@outlook.com', '$2a$10$wXPXxviIV0Ri9aB1oRFRPeY0LWJwHhh1ZO3WbGZ0HOxVJqJCGwVeO', r.id
FROM roles r
WHERE r.name = 'employee'
AND NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'abhiramreddye@outlook.com'
);

-- Create default admin user if not exists
INSERT INTO employees (name, email, password, role_id)
SELECT 'Admin', 'admin@example.com', '$2a$10$xkBqYV8IeHRwPUB.CjWJu.tYE9OtiVhAGrAkRtDEyXmt1qFTpBNZi', r.id
FROM roles r
WHERE r.name = 'admin'
AND NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'admin@example.com'
);

-- Create indexes for better performance
CREATE INDEX idx_employee_email ON employees(email);
CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(check_in);
