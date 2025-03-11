-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS vts;
USE vts;

-- Drop existing tables in correct order
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS departments;

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name) VALUES 
    ('admin'),
    ('employee');

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default departments
INSERT INTO departments (name) VALUES 
    ('Management'),
    ('Engineering'),
    ('HR'),
    ('Finance');

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(1024) NOT NULL,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    role_id INT NOT NULL,
    qr_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_employee_email ON employees(email);
CREATE INDEX idx_employee_department ON employees(department);
CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(check_in);

-- Insert default admin user (password: admin123)
INSERT INTO employees (name, email, password, department, position, role_id)
SELECT 'Admin', 'admin@example.com', '$2b$10$gROixMTCcGe/C0TuvJg9Hem6dXM1fd4r7H.sW5c7.Kj/vKmehfRxC', 'Management', 'Administrator', r.id
FROM roles r
WHERE r.name = 'admin'
AND NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'admin@example.com'
);

-- Insert sample employee (password: Jarvis@1234)
INSERT INTO employees (name, email, password, department, position, role_id)
SELECT 'Abhiram Reddy E', 'abhiramreddye@outlook.com', '$2b$10$gROixMTCcGe/C0TuvJg9Hem6dXM1fd4r7H.sW5c7.Kj/vKmehfRxC', 'Engineering', 'Developer', r.id
FROM roles r
WHERE r.name = 'employee'
AND NOT EXISTS (
    SELECT 1 FROM employees WHERE email = 'abhiramreddye@outlook.com'
);
