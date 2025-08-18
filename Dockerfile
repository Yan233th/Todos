# 使用Node.js 20作为基础镜像
FROM node:20 AS builder

# 设置工作目录
WORKDIR /app

# 复制根目录的package.json和package-lock.json
COPY package*.json ./

# 安装根目录依赖
RUN npm install

# 复制前端代码
COPY . .

# 构建前端
RUN npm run build

# 生产阶段
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制后端package.json和package-lock.json
COPY backend/package*.json ./backend/

# 安装后端依赖
RUN npm install --prefix backend

# 复制构建好的前端文件
COPY --from=builder /app/dist ./dist

# 复制后端代码
COPY backend ./backend

# 复制根目录的package.json
COPY package*.json ./

# 暴露端口
EXPOSE 3001
EXPOSE 3000

RUN npm install

# 启动命令
CMD ["npm", "run", "dev"]