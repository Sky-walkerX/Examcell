-- Create database
CREATE DATABASE IF NOT EXISTS student_results;
USE student_results;

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  department VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  gpa DECIMAL(3,2) DEFAULT 0.00,
  status ENUM('Active', 'Inactive', 'Graduated', 'Suspended') DEFAULT 'Active',
  profile_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  code VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  credits INT NOT NULL DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Results table
CREATE TABLE IF NOT EXISTS results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL,
  semester VARCHAR(50) NOT NULL,
  subject_code VARCHAR(20) NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  marks DECIMAL(5,2) NOT NULL,
  grade VARCHAR(5) NOT NULL,
  status ENUM('Pass', 'Fail') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_code) REFERENCES subjects(code) ON DELETE CASCADE
);

-- Uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  records INT NOT NULL DEFAULT 0,
  status ENUM('Processing', 'Completed', 'Failed') NOT NULL DEFAULT 'Processing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
-- Sample admin
INSERT INTO admins (id, name, email, role) VALUES
('ADM001', 'Admin User', 'admin@example.com', 'admin');

-- Sample students
INSERT INTO students (id, name, email, department, year, gpa, status) VALUES
('STU2023001', 'Michael Johnson', 'michael.johnson@example.com', 'Computer Science', 3, 3.75, 'Active'),
('STU2023045', 'Sarah Williams', 'sarah.williams@example.com', 'Electrical Engineering', 2, 3.92, 'Active'),
('STU2022078', 'David Chen', 'david.chen@example.com', 'Computer Science', 4, 3.68, 'Active'),
('STU2023112', 'Emily Rodriguez', 'emily.rodriguez@example.com', 'Mechanical Engineering', 1, 3.45, 'Active'),
('STU2021034', 'James Wilson', 'james.wilson@example.com', 'Information Technology', 3, 3.81, 'Active');

-- Sample subjects
INSERT INTO subjects (code, name, department, credits) VALUES
('CS201', 'Data Structures', 'Computer Science', 3),
('CS301', 'Database Systems', 'Computer Science', 4),
('CS302', 'Computer Networks', 'Computer Science', 3),
('CS401', 'Software Engineering', 'Computer Science', 4),
('CS501', 'Artificial Intelligence', 'Computer Science', 3),
('EE201', 'Circuit Theory', 'Electrical Engineering', 4),
('EE301', 'Digital Electronics', 'Electrical Engineering', 3),
('ME201', 'Thermodynamics', 'Mechanical Engineering', 4),
('ME301', 'Fluid Mechanics', 'Mechanical Engineering', 3),
('IT201', 'Web Development', 'Information Technology', 3);

-- Sample results
INSERT INTO results (student_id, semester, subject_code, subject_name, marks, grade, status) VALUES
('STU2023001', 'Fall 2023', 'CS201', 'Data Structures', 87, 'A', 'Pass'),
('STU2023001', 'Fall 2023', 'CS301', 'Database Systems', 92, 'A+', 'Pass'),
('STU2023001', 'Fall 2023', 'CS302', 'Computer Networks', 78, 'B+', 'Pass'),
('STU2023001', 'Fall 2023', 'CS401', 'Software Engineering', 85, 'A', 'Pass'),
('STU2023001', 'Fall 2023', 'CS501', 'Artificial Intelligence', 76, 'B+', 'Pass'),
('STU2023045', 'Fall 2023', 'EE201', 'Circuit Theory', 94, 'A+', 'Pass'),
('STU2023045', 'Fall 2023', 'EE301', 'Digital Electronics', 89, 'A', 'Pass'),
('STU2022078', 'Fall 2023', 'CS401', 'Software Engineering', 91, 'A+', 'Pass'),
('STU2023112', 'Fall 2023', 'ME201', 'Thermodynamics', 82, 'A-', 'Pass'),
('STU2021034', 'Fall 2023', 'IT201', 'Web Development', 88, 'A', 'Pass');

-- Sample uploads
INSERT INTO uploads (id, name, type, records, status) VALUES
(UUID(), 'Fall 2023 Results', 'Semester Results', 245, 'Completed'),
(UUID(), 'New Student Batch', 'Student Records', 78, 'Completed'),
(UUID(), 'Spring 2024 Subjects', 'Course Data', 32, 'Completed'),
(UUID(), 'Faculty Assignments', 'Faculty Data', 18, 'Completed'),
(UUID(), 'Mid-term Evaluations', 'Exam Results', 245, 'Completed');
