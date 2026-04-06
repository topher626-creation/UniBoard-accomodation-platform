-- UniBoard Database Schema
-- MySQL Database for Student Accommodation Marketplace Platform

-- Create database
CREATE DATABASE IF NOT EXISTS uniboard_db;
USE uniboard_db;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('student', 'landlord', 'admin') DEFAULT 'student',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Compounds table
CREATE TABLE compounds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    landlord_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Buildings table
CREATE TABLE buildings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    compound_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (compound_id) REFERENCES compounds(id) ON DELETE CASCADE
);

-- Properties table
CREATE TABLE properties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    price DECIMAL(10,2),
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    room_type ENUM('single', 'bedsitter', 'self-contained'),
    total_beds INT DEFAULT 1,
    occupied_beds INT DEFAULT 0,
    building_id INT,
    landlord_id INT,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Property images table
CREATE TABLE property_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- Property features table
CREATE TABLE property_features (
    id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT,
    feature ENUM('water', 'electricity', 'wifi', 'security', 'kitchen', 'toilet'),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE KEY unique_property_feature (property_id, feature)
);

-- Indexes for search performance
CREATE INDEX idx_compounds_name ON compounds(name);
CREATE INDEX idx_compounds_location ON compounds(location);
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_room_type ON properties(room_type);
CREATE INDEX idx_properties_approved ON properties(approved);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);