# 生产设备报修、检修、物资管理平台 - 运行指南

## 项目概述

本项目是一个基于 Node.js + Vue.js 的生产设备管理平台，主要功能包括：
- 设备报修管理（员工报修、维修工单处理）
- 物资管理（申领、入库、出库）
- 员工管理（部门、岗位、人员信息）
- 权限控制系统（普通员工、维修人员、物资管理员、超级管理员）
- 移动端适配界面

## 技术架构

### 后端
- Node.js + Express 框架
- MySQL 数据库
- Sequelize ORM
- JWT 身份验证
- Multer 文件上传

### 前端
- Vue.js 2.x
- Vant UI 组件库
- Vue Router 路由管理
- Vuex 状态管理
- Axios HTTP 请求

## 目录结构

```
iampro/
├── backend/              # 后端代码
│   ├── config/          # 配置文件
│   ├── controllers/     # 控制器
│   ├── middleware/      # 中间件
│   ├── models/          # 数据库模型
│   ├── routes/          # 路由配置
│   ├── uploads/         # 上传文件目录
│   ├── .env             # 环境变量
│   └── server.js        # 服务器入口
├── frontend/            # 前端代码
│   ├── public/          # 静态资源
│   ├── src/             # 源代码
│   └── .env             # 前端环境变量
└── database_design.md   # 数据库设计文档
```

## 运行前准备

### 1. 数据库配置

#### 创建数据库
```sql
CREATE DATABASE equipment_maintenance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 创建用户（可选）
```sql
CREATE USER 'eqm_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON equipment_maintenance.* TO 'eqm_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. 环境变量配置

#### 后端环境变量（backend/.env）
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=equipment_maintenance
PORT=3000
JWT_SECRET=your-jwt-secret-key-123456
```

#### 前端环境变量（frontend/.env）
```
VUE_APP_API_BASE_URL=http://localhost:3000/api
```

## 运行步骤

### 1. 后端运行

#### 安装依赖
```bash
cd backend
npm install
```

#### 启动服务器
```bash
node server.js
# 或使用 nodemon (开发环境)
nodemon server.js
```

服务器将在 http://localhost:3000 运行

### 2. 前端运行

#### 安装依赖
```bash
cd frontend
npm install --legacy-peer-deps
```

#### 启动开发服务器
```bash
npm run serve
```

前端将在 http://localhost:8080 运行

### 3. 构建生产版本

```bash
cd frontend
npm run build
```

构建产物将在 frontend/dist 目录

## 权限与角色

### 普通员工
- 设备报修功能
- 物资申领功能

### 维修人员
- 工单查看与处理
- 维修记录登记

### 物资管理员
- 物资入库
- 物资出库

### 超级管理员
- 员工管理
- 部门管理
- 岗位管理
- 所有功能访问权限

## 常见问题解决方案

### 1. 数据库连接错误

**错误信息**: `Access denied for user 'root'@'localhost'`

**解决方案**:
- 检查 MySQL 服务是否正在运行
- 验证数据库用户名和密码是否正确
- 确认数据库是否已创建
- 检查用户是否有足够的权限

### 2. 前端依赖安装失败

**错误信息**: `EPERM: operation not permitted`

**解决方案**:
- 以管理员身份运行命令行
- 使用 `npm install --legacy-peer-deps`
- 清理 npm 缓存: `npm cache clean --force`

### 3. Node.js 版本兼容性问题

**错误信息**: `Unsupported engine`

**解决方案**:
- 推荐使用 Node.js v16.x - v20.x
- 使用 nvm 管理 Node.js 版本

### 4. 图片上传失败

**解决方案**:
- 确保 backend/uploads 目录存在
- 检查目录权限
- 确认 Multer 配置正确

## API 接口说明

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出

### 设备报修
- `GET /api/repair-requests` - 获取报修列表
- `POST /api/repair-requests` - 创建报修
- `GET /api/repair-requests/:id` - 获取报修详情

### 物资管理
- `GET /api/materials` - 获取物资列表
- `POST /api/materials/request` - 申领物资
- `POST /api/materials/inbound` - 物资入库
- `POST /api/materials/outbound` - 物资出库

## 数据库表结构

平台包含以下核心数据表：
- `departments` - 部门信息
- `positions` - 岗位信息
- `users` - 用户信息
- `equipment` - 设备信息
- `repair_requests` - 报修请求
- `repair_records` - 维修记录
- `materials` - 物资信息
- `material_requests` - 物资申领
- `material_inventory_logs` - 物资库存日志

详细表结构请参考 `database_design.md` 文件

## 移动端使用说明

1. 在手机浏览器中访问前端地址（默认 http://localhost:8080）
2. 根据角色选择登录方式
3. 普通员工：进入报修或物资申领页面
4. 维修人员：查看待处理工单并进行维修记录
5. 管理员：进行相应的管理操作

## 后续维护

1. **数据备份**：定期备份 MySQL 数据库
2. **日志监控**：关注系统运行日志，及时发现问题
3. **安全更新**：定期更新依赖包，修复安全漏洞
4. **性能优化**：根据实际使用情况进行数据库索引优化和代码优化

## 联系方式

如有问题或建议，请联系技术支持团队。
