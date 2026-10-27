-- FDRFlow Database Schema
-- SIH 2026 | PS 26265 | AICTE

CREATE DATABASE IF NOT EXISTS fdrflow;
USE fdrflow;

-- Institutions Table
CREATE TABLE IF NOT EXISTS institutions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  contact_email VARCHAR(255),
  phone VARCHAR(20),
  approved_status ENUM('pending', 'approved', 'suspended') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('institution_admin', 'aicte_officer', 'auditor') NOT NULL DEFAULT 'institution_admin',
  institution_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE SET NULL
);

-- FDR Records Table
CREATE TABLE IF NOT EXISTS fdr_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  institution_id INT NOT NULL,
  bank_name VARCHAR(255) NOT NULL,
  branch_name VARCHAR(255),
  instrument_ref VARCHAR(100) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  issue_date DATE NOT NULL,
  maturity_date DATE NOT NULL,
  renewal_date DATE,
  interest_rate DECIMAL(5, 2),
  status ENUM('submitted', 'under_verification', 'maturity_pending', 'renewal_requested', 'release_requested', 'released', 'expired') DEFAULT 'submitted',
  submission_notes TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (institution_id) REFERENCES institutions(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_status (status),
  INDEX idx_maturity_date (maturity_date),
  INDEX idx_institution (institution_id)
);

-- FDR Documents Table
CREATE TABLE IF NOT EXISTS fdr_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fdr_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  file_size INT,
  uploaded_by INT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fdr_id) REFERENCES fdr_records(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Audit Trail Table
CREATE TABLE IF NOT EXISTS audit_trail (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fdr_id INT,
  action VARCHAR(100) NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  performed_by INT NOT NULL,
  notes TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fdr_id) REFERENCES fdr_records(id) ON DELETE SET NULL,
  FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fdr_id INT NOT NULL,
  alert_type ENUM('maturity_90', 'maturity_30', 'maturity_7', 'overdue', 'verification_pending') NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  FOREIGN KEY (fdr_id) REFERENCES fdr_records(id) ON DELETE CASCADE
);

-- Verification Records Table
CREATE TABLE IF NOT EXISTS verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fdr_id INT NOT NULL,
  verified_by INT NOT NULL,
  verification_status ENUM('pending', 'verified', 'discrepancy_found', 'manual_review') DEFAULT 'pending',
  evidence_notes TEXT,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fdr_id) REFERENCES fdr_records(id),
  FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- ============================================================
-- SEED DATA (Synthetic - For Prototype Demo Only)
-- ============================================================

INSERT INTO institutions (name, address, contact_email, phone, approved_status) VALUES
('IIT Delhi', 'Hauz Khas, New Delhi - 110016', 'admin@iitd.ac.in', '9876543210', 'approved'),
('NIT Trichy', 'Tanjore Main Road, Tiruchirappalli - 620015', 'admin@nitt.edu', '9876543211', 'approved'),
('BITS Pilani', 'Vidya Vihar, Pilani - 333031', 'admin@bits-pilani.ac.in', '9876543212', 'approved'),
('VIT Vellore', 'Tiruvalam Rd, Vellore - 632014', 'admin@vit.ac.in', '9876543213', 'approved'),
('Amity University', 'Sector 125, Noida - 201313', 'admin@amity.edu', '9876543214', 'approved');

-- Password: Admin@123 (bcrypt hash)
INSERT INTO users (name, email, password_hash, role, institution_id) VALUES
('AICTE Officer', 'officer@aicte.in', '$2a$10$n3XiToHEkFYy0V6sMtI5guf2ZRTDH8RgV4fJyM4hkS4rS8QMbpPIi', 'aicte_officer', NULL),
('Audit Officer', 'auditor@aicte.in', '$2a$10$n3XiToHEkFYy0V6sMtI5guf2ZRTDH8RgV4fJyM4hkS4rS8QMbpPIi', 'auditor', NULL),
('IIT Delhi Admin', 'admin@iitd.ac.in', '$2a$10$n3XiToHEkFYy0V6sMtI5guf2ZRTDH8RgV4fJyM4hkS4rS8QMbpPIi', 'institution_admin', 1),
('NIT Trichy Admin', 'admin@nitt.edu', '$2a$10$n3XiToHEkFYy0V6sMtI5guf2ZRTDH8RgV4fJyM4hkS4rS8QMbpPIi', 'institution_admin', 2),
('BITS Admin', 'admin@bits-pilani.ac.in', '$2a$10$n3XiToHEkFYy0V6sMtI5guf2ZRTDH8RgV4fJyM4hkS4rS8QMbpPIi', 'institution_admin', 3);

INSERT INTO fdr_records (institution_id, bank_name, branch_name, instrument_ref, amount, issue_date, maturity_date, interest_rate, status, submission_notes, created_by) VALUES
(1, 'State Bank of India', 'Hauz Khas Branch', 'SBI/FDR/2024/001', 5000000.00, '2024-01-15', '2026-01-15', 7.25, 'under_verification', 'Annual security deposit as per AICTE norms', 3),
(1, 'Punjab National Bank', 'IIT Delhi Branch', 'PNB/FDR/2024/045', 3500000.00, '2024-03-10', '2025-11-10', 6.80, 'maturity_pending', 'Renewal FDR for 2024-25', 3),
(2, 'Bank of Baroda', 'Trichy Main', 'BOB/FDR/2023/112', 4200000.00, '2023-06-01', '2025-12-01', 7.10, 'submitted', 'Fresh deposit submission', 4),
(2, 'Canara Bank', 'NIT Branch', 'CAN/FDR/2024/078', 2800000.00, '2024-02-20', '2026-02-20', 6.95, 'under_verification', 'Security deposit Q1 2024', 4),
(3, 'HDFC Bank', 'Pilani', 'HDFC/FDR/2024/033', 6000000.00, '2024-04-01', '2026-04-01', 7.50, 'released', 'Completed and released', 5),
(3, 'ICICI Bank', 'Pilani Branch', 'ICICI/FDR/2024/067', 4500000.00, '2024-07-15', '2026-07-15', 7.30, 'submitted', 'New security deposit 2024', 5),
(4, 'Union Bank', 'Vellore Main', 'UBI/FDR/2024/021', 3000000.00, '2024-01-01', '2025-12-31', 6.75, 'renewal_requested', 'Requesting renewal for next year', 3),
(1, 'Axis Bank', 'Delhi', 'AXIS/FDR/2024/099', 2500000.00, '2024-08-01', '2026-08-01', 7.15, 'submitted', 'Additional security deposit', 3),
(2, 'State Bank of India', 'Trichy', 'SBI/FDR/2025/005', 3800000.00, '2025-01-10', '2027-01-10', 7.00, 'submitted', 'Annual deposit 2025', 4),
(5, 'Bank of India', 'Noida Sector 62', 'BOI/FDR/2024/044', 5500000.00, '2024-05-15', '2026-05-15', 7.20, 'under_verification', 'Amity security deposit', 3);

INSERT INTO audit_trail (fdr_id, action, old_status, new_status, performed_by, notes) VALUES
(1, 'STATUS_CHANGE', 'submitted', 'under_verification', 1, 'Documents received, starting verification'),
(2, 'STATUS_CHANGE', 'submitted', 'under_verification', 1, 'Initial review started'),
(2, 'STATUS_CHANGE', 'under_verification', 'maturity_pending', 1, 'Verified. Maturity approaching in 30 days'),
(5, 'STATUS_CHANGE', 'submitted', 'under_verification', 1, 'Documents verified successfully'),
(5, 'STATUS_CHANGE', 'under_verification', 'released', 1, 'Approved for release by competent authority'),
(7, 'STATUS_CHANGE', 'under_verification', 'renewal_requested', 4, 'Institution requested renewal before maturity');
