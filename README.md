# 生产设备报修、检修、物资管理平台

## 系统介绍

本系统是一个生产设备报修、检修、物资管理平台，支持员工设备报修、维修人员现场解决、物资管理等功能，具有良好的移动端适配性。

## 功能模块

### 用户认证与权限管理
- 用户登录
- 基于角色的权限控制（普通员工、物资管理员、维修人员、超级管理员）

### 员工管理
- 部门管理
- 岗位管理
- 员工信息管理

### 设备报修模块
- 员工故障报修
- 故障照片上传
- 派工单生成

### 维修管理模块
- 维修人员查看派工单
- 现场解决并上传解决照片
- 故障登记（已解决/未解决）
- 解决结果反馈

### 物资管理模块
- 物资申领
- 物资入库
- 物资出库
- 物资库存管理

## 技术栈

### 后端
- Node.js + Express
- MySQL + Sequelize
- JWT认证
- Multer文件上传

### 前端
- Vue.js 2.x
- Vant UI组件库
- Vue Router路由管理
- Vuex状态管理
- Axios网络请求

## 数据库表结构

系统包含以下数据库表：

1. **departments** - 部门表
2. **positions** - 岗位表
3. **users** - 用户表
4. **equipment** - 设备表
5. **repair_requests** - 报修表
6. **repair_records** - 维修记录表
7. **materials** - 物资表
8. **material_requests** - 物资申领表
9. **material_inventory_logs** - 物资出入库表

详细的表结构和字段类型请参考 `database_design.md` 文件。

## 安装与运行

### 后端

1. 进入后端目录
```bash
cd backend
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
创建 `.env` 文件，配置数据库连接信息：
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=equipment_maintenance
PORT=3000
JWT_SECRET=your-secret-key
```

4. 启动服务器
```bash
node server.js
```

### 前端

1. 进入前端目录
```bash
cd frontend
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
创建 `.env` 文件，配置API地址：
```
VUE_APP_API_BASE_URL=http://localhost:3000/api
```

4. 启动开发服务器
```bash
npm run serve
```

5. 构建生产版本
```bash
npm run build
```

## 权限说明

| 角色 | 权限 |
|------|------|
| 普通员工 | 报修权限、申领物资 |
| 物资管理员 | 物资入库、物资出库、审批物资申领 |
| 维修人员 | 查看派工单、维修操作 |
| 超级管理员 | 所有模块操作（员工管理、系统设置等） |

## 系统流程

### 报修流程
1. 员工填写报修信息（部门、岗位、姓名、手机号、故障描述）
2. 上传故障照片
3. 系统生成派工单

### 维修流程
1. 维修人员登录系统
2. 查看派工单
3. 现场解决故障
4. 上传解决照片
5. 登记解决情况（已解决/未解决）
6. 已解决的反馈给报修人

### 物资管理流程
1. 物资入库（物资管理员）
2. 员工申领物资
3. 物资出库（物资管理员审核）

## 注意事项

1. 系统支持移动端适配，请确保在手机端使用时的良好体验
2. 物资申领时，系统会确保原子性和一致性，防止超库存申领
3. 所有照片上传功能支持最多5张照片
4. 请确保数据库连接信息正确配置

## 项目结构

### 后端
```
backend/
├── config/          # 配置文件
├── controllers/     # 控制器
├── middleware/      # 中间件
├── models/          # 数据模型
├── routes/          # 路由
├── uploads/         # 上传文件
├── server.js        # 服务器入口
└── package.json     # 项目配置
```

### 前端
```
frontend/
├── public/          # 静态资源
├── src/
│   ├── api/         # API请求
│   ├── assets/      # 静态资源
│   ├── components/  # 组件
│   ├── router/      # 路由配置
│   ├── store/       # Vuex状态管理
│   ├── utils/       # 工具函数
│   ├── views/       # 页面组件
│   ├── App.vue      # 根组件
│   └── main.js      # 入口文件
└── package.json     # 项目配置
```

## 开发说明

1. 本系统使用前后端分离架构，后端提供RESTful API
2. 前端使用Vant UI组件库，确保移动端适配
3. 数据库表使用Sequelize ORM进行操作
4. 权限控制使用JWT token实现

## 许可证

MIT License
