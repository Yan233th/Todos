# Todos 任务管理系统

一个基于Vue 3 + Node.js + MySQL的全栈任务管理系统，支持用户认证、任务管理、用户组管理等功能。

## 功能特性

- **用户认证**：注册、登录、JWT Token认证
- **任务管理**：创建、编辑、删除任务，设置优先级、截止日期和状态
- **用户管理**：管理员可以管理所有用户
- **用户组管理**：创建用户组，分配用户到组，组长管理
- **权限控制**：区分普通用户和管理员权限
- **响应式设计**：适配不同屏幕尺寸

## 技术栈

- **前端**：Vue 3, Vite, Tailwind CSS, DaisyUI
- **后端**：Node.js, Express
- **数据库**：MySQL
- **部署**：Docker, Docker Compose, Nginx

## 项目结构

```
todos/
├── src/                 # 前端源码
│   ├── components/      # Vue组件
│   ├── router/          # 路由配置
│   └── stores/          # 状态管理
├── backend/             # 后端源码
│   ├── index.js         # 主服务文件
│   └── todo-details/    # 任务详情存储目录
├── nginx/               # Nginx配置
├── docker-compose.yml   # Docker Compose配置
└── Dockerfile           # Docker构建文件
```

## Docker部署

项目支持Docker部署，使用Docker Compose一键启动整个应用栈：

```sh
docker-compose up
```

默认访问地址：http://localhost:3000

默认管理员账户：
- 用户名：admin
- 密码：admin123

## 环境变量配置

项目使用以下环境变量：

- `DB_HOST`：数据库主机地址
- `DB_PORT`：数据库端口
- `DB_USER`：数据库用户名
- `DB_PASSWORD`：数据库密码
- `DB_NAME`：数据库名称
- `JWT_SECRET`：JWT密钥

在Docker部署中，这些变量已在`docker-compose.yml`中配置。本地开发时，可以创建`.env`文件进行配置，参考`.env.example`文件。
