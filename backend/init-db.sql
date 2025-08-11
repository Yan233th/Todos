-- 创建数据库
CREATE DATABASE IF NOT EXISTS todos_db;

-- 使用数据库
USE todos_db;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认用户
INSERT IGNORE INTO users (username, password, role) VALUES 
('admin', '$2a$10$8K1p/a0dURXAm7QiTRqUzuN0/SpuDMaM1YW6q89vZsJQXc4z3r5eO', 'admin'),
('user', '$2a$10$8K1p/a0dURXAm7QiTRqUzuN0/SpuDMaM1YW6q89vZsJQXc4z3r5eO', 'user');