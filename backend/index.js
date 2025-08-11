const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 全局数据库连接对象
let db;

// 中间件
app.use(cors());
app.use(express.json());

// 创建数据库连接（不指定数据库名称，用于创建数据库）
const dbInit = mysql.createConnection({
  host: process.env.DB_HOST || '10.0.3.101',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password'
});

// 初始化数据库和表
function initializeDatabase() {
  // 连接到MySQL服务器
  dbInit.connect((err) => {
    if (err) {
      console.error('MySQL服务器连接失败:', err);
      return;
    }
    console.log('成功连接到MySQL服务器');
    
    // 创建数据库
    dbInit.query('CREATE DATABASE IF NOT EXISTS ??', [process.env.DB_NAME || 'todos_db'], (err) => {
      if (err) {
        console.error('创建数据库失败:', err);
        return;
      }
      console.log('数据库已创建或已存在');
      
      // 关闭初始连接
      dbInit.end();
      
      // 创建新的连接到指定数据库
      db = mysql.createConnection({
        host: process.env.DB_HOST || '10.0.3.101',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'todos_db'
      });
      
      // 连接到指定数据库
      db.connect((err) => {
        if (err) {
          console.error('数据库连接失败:', err);
          return;
        }
        console.log('成功连接到MySQL数据库');
        
        // 创建用户表
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;
        
        db.query(createTableQuery, (err) => {
          if (err) {
            console.error('创建用户表失败:', err);
            return;
          }
          console.log('用户表已创建或已存在');
          
          // 初始化默认用户
          initializeDefaultUsers(db);
        });
      });
    });
  });
}

// 调用初始化函数
initializeDatabase();

// 初始化默认用户
function initializeDefaultUsers(db) {
  const adminPassword = bcrypt.hashSync('admin123', 10);
  const userPassword = bcrypt.hashSync('user123', 10);
  
  const defaultUsers = [
    { username: 'admin', password: adminPassword, role: 'admin' },
    { username: 'user', password: userPassword, role: 'user' }
  ];
  
  defaultUsers.forEach(user => {
    const checkQuery = 'SELECT * FROM users WHERE username = ?';
    db.query(checkQuery, [user.username], (err, results) => {
      if (err) {
        console.error('检查用户失败:', err);
        return;
      }
      
      if (results.length === 0) {
        const insertQuery = 'INSERT INTO users SET ?';
        db.query(insertQuery, user, (err) => {
          if (err) {
            console.error('插入默认用户失败:', err);
            return;
          }
          console.log(`默认用户 '${user.username}' 已创建`);
        });
      }
    });
  });

  // 数据库初始化完成后启动服务器
  startServer();
}

// 注册API
app.post('/register', (req, res) => {
  const { username, password, role } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码是必需的' });
  }
  
  // 检查用户名是否已存在
  const checkQuery = 'SELECT * FROM users WHERE username = ?';
  db.query(checkQuery, [username], (err, results) => {
    if (err) {
      console.error('数据库查询错误:', err);
      return res.status(500).json({ message: '服务器内部错误' });
    }
    
    if (results.length > 0) {
      return res.status(400).json({ message: '用户名已存在' });
    }
    
    // 密码哈希
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // 设置默认角色
    const userRole = role || 'user';
    
    // 插入新用户
    const insertQuery = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    db.query(insertQuery, [username, hashedPassword, userRole], (err, results) => {
      if (err) {
        console.error('插入用户失败:', err);
        return res.status(500).json({ message: '服务器内部错误' });
      }
      
      res.status(201).json({ message: '注册成功' });
    });
  });
});

// 登录API
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码是必需的' });
  }
  
  // 查询用户
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('数据库查询错误:', err);
      return res.status(500).json({ message: '服务器内部错误' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    const user = results[0];
    
    // 验证密码
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('密码验证错误:', err);
        return res.status(500).json({ message: '服务器内部错误' });
      }
      
      if (!isMatch) {
        return res.status(401).json({ message: '用户名或密码错误' });
      }
      
      // 生成JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.role 
        }, 
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: '1h' }
      );
      
      // 返回token和用户信息
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role 
        } 
      });
    });
  });
});

// 启动服务器函数
function startServer() {
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  });
}

// 只在数据库初始化完成后启动服务器
// 这里我们在initializeDatabase函数中调用startServer