-- Staff Management Database Schema
-- Create staff table to store non-teaching staff information

-- Staff table (inherits from users table via JOINED inheritance)
CREATE TABLE IF NOT EXISTS staff (
    id BIGINT Primary KEY,
    staff_id VARCHAR(20) UNIQUE,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    join_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    salary DECIMAL(10, 2),
    emergency_contact_name VARCHAR(100),
    emergency_contact_number VARCHAR(20),
    address VARCHAR(255),
    contract_type VARCHAR(20),
    qualification VARCHAR(100),
    experience INT,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_staff_id (staff_id),
    INDEX idx_department (department),
    INDEX idx_status (status),
    INDEX idx_position (position)
);

-- Insert sample staff data
INSERT INTO users (first_name, last_name, other_names, email, password, gender, date_of_birth, nationality, phone_number, created_at, updated_at) VALUES
('Sarah', 'Wilson', NULL, 'sarah.wilson@academix.edu', '$2a$10$dummyPasswordHashForDevelopment', 'FEMALE', '1985-03-15', 'Ugandan', '+256700123456', NOW(), NOW()),
('Michael', 'Chen', NULL, 'michael.chen@academix.edu', '$2a$10$dummyPasswordHashForDevelopment', 'MALE', '1990-07-22', 'Ugandan', '+256700123457', NOW(), NOW()),
('Rebecca', 'Martinez', NULL, 'rebecca.martinez@academix.edu', '$2a$10$dummyPasswordHashForDevelopment', 'FEMALE', '1988-11-10', 'Ugandan', '+256700123458', NOW(), NOW()),
('David', 'Thompson', NULL, 'david.thompson@academix.edu', '$2a$10$dummyPasswordHashForDevelopment', 'MALE', '1982-05-05', 'Ugandan', '+256700123459', NOW(), NOW()),
('Grace', 'Nakato', NULL, 'grace.nakato@academix.edu', '$2a$10$dummyPasswordHashForDevelopment', 'FEMALE', '1987-09-18', 'Ugandan', '+256700123460', NOW(), NOW()),
('James', 'Okello', NULL, 'james.okello@academix.edu', '$2a$10$dummyPasswordHashForDevelopment', 'MALE', '1983-12-03', 'Ugandan', '+256700123461', NOW(), NOW()),
('Patricia', 'Akinyi', NULL, 'patricia.akinyi@academix.edu', '$2a$10$dummyPasswordHashForDevelopment', 'FEMALE', '1991-04-27', 'Ugandan', '+256700123462', NOW(), NOW()),
('Robert', 'Mugisha', NULL, 'robert.mugisha@academix.edu', '$2a$10$dummyPasswordHashForDevelopment', 'MALE', '1986-08-14', 'Ugandan', '+256700123463', NOW(), NOW()),
('Betty', 'Nalwanga', NULL, 'betty.nalwanga@academix.edu', '$2a$10$dummyPasswordHashForDevelopment', 'FEMALE', '1989-01-30', 'Ugandan', '+256700123464', NOW(), NOW()),
('Joseph', 'Kiprotich', NULL, 'joseph.kiprotich@academix.edu', '$2a$10$dummyPasswordHashForDevelopment', 'MALE', '1984-06-12', 'Ugandan', '+256700123465', NOW(), NOW());

-- Insert corresponding staff records
INSERT INTO staff (id, staff_id, department, position, join_date, status, salary, contract_type, qualification, experience, address, emergency_contact_name, emergency_contact_number) VALUES
-- Administration Staff
((SELECT id FROM users WHERE email = 'sarah.wilson@academix.edu'), 'ADM2024001', 'Administration', 'Secretary', '2024-09-15', 'ACTIVE', 800000.00, 'PERMANENT', 'Bachelor of Business Administration', 5, 'Kampala, Uganda', 'John Wilson', '+256700987654'),
((SELECT id FROM users WHERE email = 'grace.nakato@academix.edu'), 'ADM2024002', 'Administration', 'Office Assistant', '2024-08-01', 'ACTIVE', 600000.00, 'PERMANENT', 'Diploma in Office Management', 3, 'Wakiso, Uganda', 'Peter Nakato', '+256700987655'),
((SELECT id FROM users WHERE email = 'patricia.akinyi@academix.edu'), 'ADM2024003', 'Administration', 'Receptionist', '2024-07-10', 'ACTIVE', 550000.00, 'CONTRACT', 'Certificate in Customer Service', 2, 'Entebbe, Uganda', 'Mary Akinyi', '+256700987656'),

-- IT Support Staff
((SELECT id FROM users WHERE email = 'michael.chen@academix.edu'), 'ITS2025001', 'IT Support', 'Technical Assistant', '2025-01-20', 'ACTIVE', 1200000.00, 'PERMANENT', 'Bachelor of Computer Science', 4, 'Kampala, Uganda', 'Lisa Chen', '+256700987657'),
((SELECT id FROM users WHERE email = 'robert.mugisha@academix.edu'), 'ITS2024001', 'IT Support', 'Network Administrator', '2024-05-15', 'ACTIVE', 1500000.00, 'PERMANENT', 'Bachelor of Information Technology', 6, 'Mukono, Uganda', 'Ruth Mugisha', '+256700987658'),

-- Maintenance Staff
((SELECT id FROM users WHERE email = 'rebecca.martinez@academix.edu'), 'MNT2023001', 'Maintenance', 'Custodian', '2023-11-10', 'ACTIVE', 450000.00, 'PERMANENT', 'Certificate in Technical Skills', 8, 'Jinja, Uganda', 'Carlos Martinez', '+256700987659'),
((SELECT id FROM users WHERE email = 'joseph.kiprotich@academix.edu'), 'MNT2024001', 'Maintenance', 'Grounds Keeper', '2024-02-28', 'ACTIVE', 500000.00, 'TEMPORARY', 'Certificate in Landscaping', 10, 'Mbale, Uganda', 'Agnes Kiprotich', '+256700987660'),

-- Security Staff
((SELECT id FROM users WHERE email = 'david.thompson@academix.edu'), 'SEC2024001', 'Security', 'Security Guard', '2024-03-05', 'ON_LEAVE', 650000.00, 'PERMANENT', 'Certificate in Security Management', 7, 'Gulu, Uganda', 'Susan Thompson', '+256700987661'),
((SELECT id FROM users WHERE email = 'james.okello@academix.edu'), 'SEC2024002', 'Security', 'Night Watchman', '2024-04-12', 'ACTIVE', 600000.00, 'PART_TIME', 'Secondary Education', 5, 'Lira, Uganda', 'Florence Okello', '+256700987662'),

-- Library Staff
((SELECT id FROM users WHERE email = 'betty.nalwanga@academix.edu'), 'LIB2024001', 'Library', 'Librarian Assistant', '2024-06-01', 'ACTIVE', 750000.00, 'CONTRACT', 'Diploma in Library Science', 3, 'Masaka, Uganda', 'Paul Nalwanga', '+256700987663');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_department_status ON staff(department, status);
CREATE INDEX IF NOT EXISTS idx_staff_join_date ON staff(join_date);
CREATE INDEX IF NOT EXISTS idx_staff_contract_type ON staff(contract_type);

-- Add constraints for enum values (if not handled by application)
ALTER TABLE staff ADD CONSTRAINT chk_staff_status 
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED'));

ALTER TABLE staff ADD CONSTRAINT chk_contract_type 
    CHECK (contract_type IN ('PERMANENT', 'TEMPORARY', 'CONTRACT', 'PART_TIME', 'INTERNSHIP'));