-- NoteKeeper Database Initialization Script
-- MySQL 8.0+

-- Create database
CREATE DATABASE IF NOT EXISTS notekeeper;
USE notekeeper;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    tags JSON,
    owner_id BIGINT NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id),
    INDEX idx_created_at (created_at),
    INDEX idx_updated_at (updated_at),
    FULLTEXT idx_search (title, content)
);

-- Create user for application (optional - for development)
-- CREATE USER IF NOT EXISTS 'notekeeper'@'localhost' IDENTIFIED BY 'password';
-- GRANT ALL PRIVILEGES ON notekeeper.* TO 'notekeeper'@'localhost';
-- FLUSH PRIVILEGES;

-- Insert sample data (optional - for testing)
INSERT INTO users (email, password) VALUES 
('demo@notekeeper.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: password

-- No default notes
