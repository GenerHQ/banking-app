-- ============================================
-- BANKING APPLICATION - DATABASE SCHEMA
-- Database: bank_db
-- ============================================

-- 1. Create Database
CREATE DATABASE IF NOT EXISTS bank_db;
USE bank_db;

-- 2. Drop existing tables (if they exist) - BE CAREFUL!
-- This will DELETE all your data!
-- DROP TABLE IF EXISTS transactions;
-- DROP TABLE IF EXISTS accounts;

-- 3. Create Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    balance DOUBLE NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- 4. Create Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_number VARCHAR(50) NOT NULL,
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    transaction_type ENUM('DEPOSIT', 'WITHDRAW', 'TRANSFER_IN', 'TRANSFER_OUT') NOT NULL,
    amount DOUBLE NOT NULL,
    balance_after DOUBLE,
    remarks VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_number) REFERENCES accounts(account_number)
    ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_transactions_account_number (account_number)
    );

-- 5. Verification
SHOW TABLES;
DESCRIBE accounts;
DESCRIBE transactions;