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
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
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
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
      
      // 连接到指定数据库
      db.connect((err) => {
        if (err) {
          console.error('数据库连接失败:', err);
          return;
        }
        console.log('成功连接到MySQL数据库');
        
        // 创建用户组表
        const createGroupsTableQuery = `
          CREATE TABLE IF NOT EXISTS \`groups\` (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;
        
        db.query(createGroupsTableQuery, (err) => {
          if (err) {
            console.error('创建用户组表失败:', err);
            return;
          }
          console.log('用户组表已创建或已存在');
          
          // 创建用户表
          const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
              id INT AUTO_INCREMENT PRIMARY KEY,
              username VARCHAR(50) UNIQUE NOT NULL,
              password VARCHAR(255) NOT NULL,
              role VARCHAR(20) DEFAULT 'user',
              group_id INT DEFAULT NULL,
              FOREIGN KEY (group_id) REFERENCES \`groups\`(id) ON DELETE SET NULL,
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
  });
}

// 调用初始化函数
initializeDatabase();

// 初始化默认用户
function initializeDefaultUsers(db) {
  // 数据库初始化完成后启动服务器
  startServer();
}

// 注册API
app.post('/register', (req, res) => {
  const { username, password, role, groupId } = req.body;
  
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
    
    // 检查用户组是否存在（如果提供了groupId）
    if (groupId) {
      const checkGroupQuery = 'SELECT * FROM `groups` WHERE id = ?';
      db.query(checkGroupQuery, [groupId], (err, groupResults) => {
        if (err) {
          console.error('数据库查询错误:', err);
          return res.status(500).json({ message: '服务器内部错误' });
        }
        
        if (groupResults.length === 0) {
          return res.status(400).json({ message: '指定的用户组不存在' });
        }
        
        // 密码哈希
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        // 设置默认角色
        const userRole = role || 'user';
        
        // 插入新用户
        const insertQuery = 'INSERT INTO users (username, password, role, group_id) VALUES (?, ?, ?, ?)';
        db.query(insertQuery, [username, hashedPassword, userRole, groupId], (err, results) => {
          if (err) {
            console.error('插入用户失败:', err);
            return res.status(500).json({ message: '服务器内部错误' });
          }
          
          res.status(201).json({ message: '注册成功' });
        });
      });
    } else {
      // 没有提供groupId，直接插入用户
      // 密码哈希
      const hashedPassword = bcrypt.hashSync(password, 10);
      
      // 设置默认角色
      const userRole = role || 'user';
      
      // 插入新用户
      const insertQuery = 'INSERT INTO users (username, password, role, group_id) VALUES (?, ?, ?, ?)';
      db.query(insertQuery, [username, hashedPassword, userRole, null], (err, results) => {
        if (err) {
          console.error('插入用户失败:', err);
          return res.status(500).json({ message: '服务器内部错误' });
        }
        
        res.status(201).json({ message: '注册成功' });
      });
    }
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
          role: user.role,
          groupId: user.group_id || null
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
          role: user.role,
          groupId: user.group_id || null
        } 
      });
    });
  });
});

// 刷新token API
app.post('/refresh-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: '未提供token' });
  }
  
  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    
    // 验证用户是否仍然存在于数据库中
    const query = 'SELECT * FROM users WHERE id = ? AND username = ?';
    db.query(query, [decoded.userId, decoded.username], (err, results) => {
      if (err) {
        console.error('数据库查询错误:', err);
        return res.status(500).json({ message: '服务器内部错误' });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ message: '用户不存在' });
      }
      
      // 生成新token
      const newToken = jwt.sign(
        { 
          userId: decoded.userId, 
          username: decoded.username, 
          role: decoded.role,
          groupId: decoded.groupId || null
        }, 
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: '1h' }
      );
      
      res.json({ token: newToken });
    });
  } catch (error) {
    console.error('token刷新失败:', error);
    res.status(401).json({ message: 'token无效或已过期' });
  }
});

// 获取所有用户组API
app.get('/groups', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM `groups`';
  db.query(query, (err, results) => {
    if (err) {
      console.error('数据库查询错误:', err);
      return res.status(500).json({ message: '服务器内部错误' });
    }
    
    res.json({ groups: results });
  });
});

// 根据ID获取单个用户组API
app.get('/groups/:id', authenticateToken, (req, res) => {
  const groupId = req.params.id;
  const query = 'SELECT * FROM \`groups\` WHERE id = ?';
  
  db.query(query, [groupId], (err, results) => {
    if (err) {
      console.error('数据库查询错误:', err);
      return res.status(500).json({ message: '服务器内部错误' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: '用户组不存在' });
    }
    
    res.json({ group: results[0] });
  });
});

// 认证中间件
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ message: '未提供token' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key', (err, decodedUser) => {
    if (err) return res.status(403).json({ message: 'token无效或已过期' });
    
    // 验证用户是否仍然存在于数据库中
    const query = 'SELECT * FROM users WHERE id = ? AND username = ?';
    db.query(query, [decodedUser.userId, decodedUser.username], (err, results) => {
      if (err) {
        console.error('数据库查询错误:', err);
        return res.status(500).json({ message: '服务器内部错误' });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ message: '用户不存在' });
      }
      
      // 添加groupId信息到decodedUser
      const user = results[0];
      req.user = {
        userId: user.id,
        username: user.username,
        role: user.role,
        groupId: user.group_id || null
      };
      next();
    });
  });
};


// 启动服务器函数
function startServer() {
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  });
}

// 只在数据库初始化完成后启动服务器
// 这里我们在initializeDatabase函数中调用startServer