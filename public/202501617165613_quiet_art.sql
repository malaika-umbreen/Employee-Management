-- Employee Management System Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS employee_management;
USE employee_management;

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(10) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(50) NOT NULL,
    position VARCHAR(100) NOT NULL,
    role ENUM('admin', 'hr', 'clerk', 'user') DEFAULT 'user',
    salary DECIMAL(10, 2) DEFAULT 0.00,
    join_date DATE NOT NULL,
    status ENUM('Active', 'Inactive', 'On Leave', 'Deleted') DEFAULT 'Active',
    avatar TEXT,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_employee_id (employee_id),
    INDEX idx_department (department),
    INDEX idx_status (status),
    INDEX idx_role (role)
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    manager_id INT,
    budget DECIMAL(12, 2) DEFAULT 0.00,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    break_duration INT DEFAULT 0, -- in minutes
    total_hours DECIMAL(4, 2) DEFAULT 0.00,
    status ENUM('Present', 'Absent', 'Late', 'Half Day', 'Holiday') DEFAULT 'Present',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_employee_date (employee_id, date),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_date (date),
    INDEX idx_employee_date (employee_id, date)
);

-- Create payroll table
CREATE TABLE IF NOT EXISTS payroll (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    basic_salary DECIMAL(10, 2) NOT NULL,
    overtime_hours DECIMAL(4, 2) DEFAULT 0.00,
    overtime_rate DECIMAL(6, 2) DEFAULT 0.00,
    overtime_amount DECIMAL(10, 2) DEFAULT 0.00,
    bonus DECIMAL(10, 2) DEFAULT 0.00,
    deductions DECIMAL(10, 2) DEFAULT 0.00,
    tax_deduction DECIMAL(10, 2) DEFAULT 0.00,
    net_salary DECIMAL(10, 2) NOT NULL,
    status ENUM('Draft', 'Processed', 'Paid') DEFAULT 'Draft',
    processed_by INT,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_employee_period (employee_id, pay_period_start, pay_period_end),
    INDEX idx_status (status)
);

-- Create leave_requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type ENUM('Vacation', 'Sick', 'Personal', 'Maternity', 'Paternity', 'Emergency') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INT NOT NULL,
    reason TEXT,
    status ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') DEFAULT 'Pending',
    approved_by INT,
    approved_at TIMESTAMP NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_employee_dates (employee_id, start_date, end_date),
    INDEX idx_status (status)
);

-- Create performance_reviews table
CREATE TABLE IF NOT EXISTS performance_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    overall_rating ENUM('Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Unsatisfactory') NOT NULL,
    goals_achievement DECIMAL(3, 2) DEFAULT 0.00, -- 0.00 to 5.00
    technical_skills DECIMAL(3, 2) DEFAULT 0.00,
    communication_skills DECIMAL(3, 2) DEFAULT 0.00,
    teamwork DECIMAL(3, 2) DEFAULT 0.00,
    leadership DECIMAL(3, 2) DEFAULT 0.00,
    strengths TEXT,
    areas_for_improvement TEXT,
    goals_next_period TEXT,
    comments TEXT,
    status ENUM('Draft', 'Submitted', 'Approved') DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_period (employee_id, review_period_start, review_period_end)
);

-- Create system_logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_user_action (user_id, action),
    INDEX idx_created_at (created_at)
);

-- Insert default departments
INSERT INTO departments (name, description, status) VALUES
('Human Resources', 'Manages employee relations, recruitment, and HR policies', 'Active'),
('Information Technology', 'Handles all technology infrastructure and software development', 'Active'),
('Finance', 'Manages financial operations, accounting, and budgeting', 'Active'),
('Marketing', 'Handles marketing campaigns, brand management, and customer outreach', 'Active'),
('Operations', 'Manages day-to-day business operations and processes', 'Active'),
('Sales', 'Handles customer acquisition and revenue generation', 'Active');

-- Insert default admin user
INSERT INTO employees (
    employee_id, first_name, last_name, email, password, phone,
    department, position, role, salary, join_date, status, avatar
) VALUES (
    'EMP001', 'System', 'Administrator', 'admin@ems.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    '+1 (555) 000-0001',
    'Information Technology', 'System Administrator', 'admin', 100000.00, 
    '2024-01-01', 'Active',
    'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
);

-- Insert HR Manager
INSERT INTO employees (
    employee_id, first_name, last_name, email, password, phone,
    department, position, role, salary, join_date, status, avatar
) VALUES (
    'EMP002', 'Sarah', 'Johnson', 'hr@ems.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    '+1 (555) 000-0002',
    'Human Resources', 'HR Manager', 'hr', 75000.00, 
    '2024-01-01', 'Active',
    'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
);

-- Insert Clerk
INSERT INTO employees (
    employee_id, first_name, last_name, email, password, phone,
    department, position, role, salary, join_date, status, avatar
) VALUES (
    'EMP003', 'Michael', 'Chen', 'clerk@ems.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    '+1 (555) 000-0003',
    'Finance', 'Office Clerk', 'clerk', 45000.00, 
    '2024-01-01', 'Active',
    'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
);

-- Insert Regular User
INSERT INTO employees (
    employee_id, first_name, last_name, email, password, phone,
    department, position, role, salary, join_date, status, avatar
) VALUES (
    'EMP004', 'John', 'Doe', 'user@ems.com', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    '+1 (555) 000-0004',
    'Information Technology', 'Software Engineer', 'user', 70000.00, 
    '2024-01-01', 'Active',
    'https://images.pexels.com/photos/1239300/pexels-photo-1239300.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
);

-- Insert sample employees
INSERT INTO employees (
    employee_id, first_name, last_name, email, password, phone,
    department, position, role, salary, join_date, status, avatar
) VALUES 
('EMP005', 'Emily', 'Davis', 'emily.davis@company.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1 (555) 123-4567', 'Marketing', 'Marketing Specialist', 'user', 58000.00, '2023-02-14', 'Active', 'https://images.pexels.com/photos/1239295/pexels-photo-1239295.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'),
('EMP006', 'David', 'Wilson', 'david.wilson@company.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1 (555) 234-5678', 'Operations', 'Operations Manager', 'user', 78000.00, '2021-11-08', 'Active', 'https://images.pexels.com/photos/1239297/pexels-photo-1239297.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'),
('EMP007', 'Lisa', 'Anderson', 'lisa.anderson@company.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1 (555) 345-6789', 'Sales', 'Sales Representative', 'user', 52000.00, '2023-05-22', 'On Leave', 'https://images.pexels.com/photos/1239299/pexels-photo-1239299.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop');

-- Insert sample attendance records
INSERT INTO attendance (employee_id, date, check_in, check_out, total_hours, status) VALUES
(1, '2024-01-15', '09:00:00', '17:30:00', 8.00, 'Present'),
(2, '2024-01-15', '08:30:00', '17:00:00', 8.00, 'Present'),
(3, '2024-01-15', '09:15:00', '17:30:00', 7.75, 'Late'),
(4, '2024-01-15', '09:00:00', '17:00:00', 8.00, 'Present'),
(1, '2024-01-16', '09:00:00', '17:30:00', 8.00, 'Present'),
(2, '2024-01-16', '08:30:00', '17:00:00', 8.00, 'Present'),
(3, '2024-01-16', NULL, NULL, 0.00, 'Absent'),
(4, '2024-01-16', '09:00:00', '13:00:00', 4.00, 'Half Day');

-- Create views for reporting
CREATE VIEW employee_summary AS
SELECT 
    e.id,
    e.employee_id,
    CONCAT(e.first_name, ' ', e.last_name) as full_name,
    e.email,
    e.department,
    e.position,
    e.role,
    e.salary,
    e.join_date,
    e.status,
    DATEDIFF(CURDATE(), e.join_date) as days_employed,
    d.name as department_name,
    d.manager_id as department_manager_id
FROM employees e
LEFT JOIN departments d ON e.department = d.name
WHERE e.status != 'Deleted';

CREATE VIEW attendance_summary AS
SELECT 
    e.employee_id,
    CONCAT(e.first_name, ' ', e.last_name) as employee_name,
    COUNT(a.id) as total_days,
    SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_days,
    SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
    SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) as late_days,
    ROUND((SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100, 2) as attendance_percentage
FROM employees e
LEFT JOIN attendance a ON e.id = a.employee_id
WHERE e.status != 'Deleted'
GROUP BY e.id, e.employee_id, e.first_name, e.last_name;

-- Create stored procedures
DELIMITER //

CREATE PROCEDURE GetEmployeesByDepartment(IN dept_name VARCHAR(50))
BEGIN
    SELECT * FROM employee_summary 
    WHERE department = dept_name 
    ORDER BY full_name;
END //

CREATE PROCEDURE GetAttendanceReport(IN start_date DATE, IN end_date DATE)
BEGIN
    SELECT 
        e.employee_id,
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        e.department,
        COUNT(a.id) as total_days,
        SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_days,
        SUM(a.total_hours) as total_hours,
        ROUND(AVG(a.total_hours), 2) as avg_hours_per_day
    FROM employees e
    LEFT JOIN attendance a ON e.id = a.employee_id 
        AND a.date BETWEEN start_date AND end_date
    WHERE e.status = 'Active'
    GROUP BY e.id
    ORDER BY e.department, e.last_name;
END //

DELIMITER ;

-- Create triggers for audit logging
DELIMITER //

CREATE TRIGGER employee_audit_insert
AFTER INSERT ON employees
FOR EACH ROW
BEGIN
    INSERT INTO system_logs (user_id, action, table_name, record_id, new_values)
    VALUES (NEW.id, 'INSERT', 'employees', NEW.id, JSON_OBJECT(
        'employee_id', NEW.employee_id,
        'name', CONCAT(NEW.first_name, ' ', NEW.last_name),
        'email', NEW.email,
        'department', NEW.department,
        'position', NEW.position,
        'role', NEW.role
    ));
END //

CREATE TRIGGER employee_audit_update
AFTER UPDATE ON employees
FOR EACH ROW
BEGIN
    INSERT INTO system_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (NEW.id, 'UPDATE', 'employees', NEW.id, 
        JSON_OBJECT(
            'employee_id', OLD.employee_id,
            'name', CONCAT(OLD.first_name, ' ', OLD.last_name),
            'email', OLD.email,
            'department', OLD.department,
            'position', OLD.position,
            'role', OLD.role,
            'status', OLD.status
        ),
        JSON_OBJECT(
            'employee_id', NEW.employee_id,
            'name', CONCAT(NEW.first_name, ' ', NEW.last_name),
            'email', NEW.email,
            'department', NEW.department,
            'position', NEW.position,
            'role', NEW.role,
            'status', NEW.status
        )
    );
END //

DELIMITER ;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON employee_management.* TO 'ems_user'@'localhost' IDENTIFIED BY 'ems_password';
-- FLUSH PRIVILEGES;