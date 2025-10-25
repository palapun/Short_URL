-- URL Shortener Database Schema
CREATE DATABASE IF NOT EXISTS url_shortener;
USE url_shortener;

-- URLs table to store original and short URLs
CREATE TABLE urls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code VARCHAR(10) NOT NULL UNIQUE,
    custom_alias VARCHAR(50) NULL,
    click_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_short_code (short_code),
    INDEX idx_custom_alias (custom_alias),
    INDEX idx_created_at (created_at)
);

-- Click statistics table
CREATE TABLE click_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    url_id BIGINT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer TEXT,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE,
    INDEX idx_url_id (url_id),
    INDEX idx_clicked_at (clicked_at)
);

-- Create indexes for better performance
CREATE INDEX idx_urls_active ON urls(is_active);
CREATE INDEX idx_urls_expires ON urls(expires_at);
