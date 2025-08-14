const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

let db;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

const dbInit = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

function initializeDatabase() {
  dbInit.connect((err) => {
    if (err) {
      console.error('MySQL服务器连接失败:', err);
      return;
    }
    console.log('成功连接到MySQL服务器');
    
    dbInit.query('CREATE DATABASE IF NOT EXISTS ??', [process.env.DB_NAME || 'todos_db'], (err) => {
      if (err) {
        console.error('创建数据库失败:', err);
        return;
      }
      console.log('数据库已创建或已存在');
      
      dbInit.end();

      db = mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        charset: 'utf8mb4'
      });

      db.connect((err) => {
        if (err) {
          console.error('数据库连接失败:', err);
          return;
        }
        console.log('成功连接到MySQL数据库');

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
          
          const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
              id INT AUTO_INCREMENT PRIMARY KEY,
              username VARCHAR(50) UNIQUE NOT NULL,
              name VARCHAR(100) NOT NULL,
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
            
            // 创建TodosList表
            const createTodosListTableQuery = `
              CREATE TABLE IF NOT EXISTS TodosList (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                Belonging_users TEXT,
                Belonging_groups TEXT,
                Completion_time DATETIME,
                create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                delete_time TIMESTAMP NULL,
                Deadline DATETIME,
                Priority INT DEFAULT 0,
                Status INT DEFAULT 0
              )
            `;
            
            db.query(createTodosListTableQuery, (err) => {
              if (err) {
                console.error('创建TodosList表失败:', err);
                return;
              }
              console.log('TodosList表已创建或已存在');
              
              // 初始化默认用户
              initializeDefaultUsers(db);
            });
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
  // 检查是否已存在默认用户，如果不存在则创建
  const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
  db.query(checkUserQuery, ['admin'], async (err, results) => {
    if (err) {
      console.error('检查默认用户失败:', err);
      return;
    }
    
    if (results.length === 0) {
      // 创建默认管理员用户
      const defaultPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      const insertUserQuery = 'INSERT INTO users (username, name, password, role, group_id) VALUES (?, ?, ?, ?, ?)';
      db.query(insertUserQuery, ['admin', '管理员', hashedPassword, 'admin', null], (err, result) => {
        if (err) {
          console.error('创建默认用户失败:', err);
        } else {
          console.log('默认管理员用户创建成功，用户名: admin，展示名: 管理员，密码: admin123');
        }
      });
    } else {
      console.log('默认管理员用户已存在');
    }
    
    // 数据库初始化完成后启动服务器
    startServer();
  });
}

// 注册API
app.post('/register', (req, res) => {
  const { username, name, password, role, groupId } = req.body;
  
  if (!username || !name || !password) {
    return res.status(400).json({ message: '用户名、展示名和密码是必需的' });
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
        const insertQuery = 'INSERT INTO users (username, name, password, role, group_id) VALUES (?, ?, ?, ?, ?)';
        db.query(insertQuery, [username, name, hashedPassword, userRole, groupId], (err, results) => {
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
      const insertQuery = 'INSERT INTO users (username, name, password, role, group_id) VALUES (?, ?, ?, ?, ?)';
      db.query(insertQuery, [username, name, hashedPassword, userRole, null], (err, results) => {
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
      
      // 确保用户信息中的中文字符正确编码
      const userInfo = {
        userId: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        groupId: user.group_id || null
      };
      
      // 生成JWT token
      const token = jwt.sign(userInfo, process.env.JWT_SECRET || 'your_jwt_secret_key', {
        expiresIn: '1h',
        encoding: 'utf8'
      });
      
      // 返回token和用户信息
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          name: user.name,
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
      
      // 确保用户信息中的中文字符正确编码
      const userInfo = {
        userId: decoded.userId,
        username: decoded.username,
        name: decoded.name,
        role: decoded.role,
        groupId: decoded.groupId || null
      };
      
      // 生成新token
      const newToken = jwt.sign(userInfo, process.env.JWT_SECRET || 'your_jwt_secret_key', {
        expiresIn: '1h',
        encoding: 'utf8'
      });
      
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
      
      // 添加用户信息到req.user，确保中文字符正确处理
      const user = results[0];
      req.user = {
        userId: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        groupId: user.group_id || null
      };
      
      // 确保响应头设置正确的字符集
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      next();
    });
  });
};


// 创建待办事项API
app.post('/todos', authenticateToken, (req, res) => {
  const { name, description, Deadline, Priority, Belonging_users, Belonging_groups } = req.body;
  
  // 验证必要字段
  if (!name) {
    return res.status(400).json({ message: '待办事项标题是必需的' });
  }
  
  // 设置默认值
  const priority = Priority || 0;
  const status = -1; // 默认状态为"计划中"
  
  // 处理Belonging_users和Belonging_groups为ID列表
  const belongingUsers = Array.isArray(Belonging_users) ? Belonging_users.join(',') : 
                        (typeof Belonging_users === 'string' ? Belonging_users : '');
  const belongingGroups = Array.isArray(Belonging_groups) ? Belonging_groups.join(',') : 
                         (typeof Belonging_groups === 'string' ? Belonging_groups : '');
  
  // 插入新待办事项
  const insertQuery = `
    INSERT INTO TodosList 
    (name, description, Deadline, Priority, Status, Belonging_users, Belonging_groups)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(insertQuery, [name, description, Deadline, priority, status, belongingUsers, belongingGroups], (err, results) => {
    if (err) {
      console.error('创建待办事项失败:', err);
      return res.status(500).json({ message: '服务器内部错误' });
    }
    
    res.status(201).json({ 
      message: '待办事项创建成功',
      todoId: results.insertId 
    });
  });
});

// 获取所有待办事项API
app.get('/todos', authenticateToken, (req, res) => {
  const query = 'SELECT * FROM TodosList';
  db.query(query, (err, results) => {
    if (err) {
      console.error('获取待办事项失败:', err);
      return res.status(500).json({ message: '服务器内部错误' });
    }
    
    // 处理Belonging_users和Belonging_groups字段，将逗号分隔的字符串转换为数组
    const todos = results.map(todo => ({
      ...todo,
      Belonging_users: todo.Belonging_users ? todo.Belonging_users.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [],
      Belonging_groups: todo.Belonging_groups ? todo.Belonging_groups.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : []
    }));
    
    res.json({ todos });
  });
});

// 根据ID获取单个待办事项API
app.get('/todos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM TodosList WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('获取待办事项详情失败:', err);
      return res.status(500).json({ message: '服务器内部错误' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: '未找到指定的待办事项' });
    }
    
    // 处理Belonging_users和Belonging_groups字段，将逗号分隔的字符串转换为数组
    const todo = {
      ...results[0],
      Belonging_users: results[0].Belonging_users ? results[0].Belonging_users.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [],
      Belonging_groups: results[0].Belonging_groups ? results[0].Belonging_groups.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : []
    };
    
    res.json({ todo });
  });
});

// 更新待办事项API
app.put('/todos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, description, Deadline, Priority, Status, Belonging_users, Belonging_groups } = req.body;
  
  // 构建更新查询
  let updateQuery = 'UPDATE TodosList SET ';
  const updateFields = [];
  const updateValues = [];
  
  if (name !== undefined) {
    updateFields.push('name = ?');
    updateValues.push(name);
  }
  if (description !== undefined) {
    updateFields.push('description = ?');
    updateValues.push(description);
  }
  if (Deadline !== undefined) {
    updateFields.push('Deadline = ?');
    updateValues.push(Deadline);
  }
  if (Priority !== undefined) {
    updateFields.push('Priority = ?');
    updateValues.push(Priority);
  }
  if (Status !== undefined) {
    updateFields.push('Status = ?');
    updateValues.push(Status);
  }
  if (Belonging_users !== undefined) {
    // 处理Belonging_users为ID列表
    const belongingUsers = Array.isArray(Belonging_users) ? Belonging_users.join(',') : 
                          (typeof Belonging_users === 'string' ? Belonging_users : '');
    updateFields.push('Belonging_users = ?');
    updateValues.push(belongingUsers);
  }
  if (Belonging_groups !== undefined) {
    // 处理Belonging_groups为ID列表
    const belongingGroups = Array.isArray(Belonging_groups) ? Belonging_groups.join(',') : 
                           (typeof Belonging_groups === 'string' ? Belonging_groups : '');
    updateFields.push('Belonging_groups = ?');
    updateValues.push(belongingGroups);
  }
  
  // 如果没有提供任何更新字段
  if (updateFields.length === 0) {
    return res.status(400).json({ message: '至少需要提供一个要更新的字段' });
  }
  
  updateQuery += updateFields.join(', ') + ' WHERE id = ?';
  updateValues.push(id);
  
  db.query(updateQuery, updateValues, (err, results) => {
    if (err) {
      console.error('更新待办事项失败:', err);
      return res.status(500).json({ message: '服务器内部错误' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: '未找到指定的待办事项' });
    }
    
    res.json({ message: '待办事项更新成功' });
  });
});

// 删除待办事项API
app.delete('/todos/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM TodosList WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('删除待办事项失败:', err);
      return res.status(500).json({ message: '服务器内部错误' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: '未找到指定的待办事项' });
    }
    
    res.json({ message: '待办事项删除成功' });
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