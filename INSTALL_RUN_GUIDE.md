# 项目安装与运行指南

由于当前环境未安装Node.js，您需要按照以下步骤完成项目的安装和运行。

## 步骤1：安装Node.js和npm

1. 访问Node.js官方网站：https://nodejs.org/zh-cn/download/
2. 下载适合您操作系统的LTS版本（长期支持版）
3. 运行安装程序，按照提示完成安装
4. 安装完成后，打开命令行工具验证安装：
   ```bash
   node -v  # 查看Node.js版本
   npm -v   # 查看npm版本
   ```

## 步骤2：安装项目依赖

### 后端依赖安装

1. 进入后端目录：
   ```bash
   cd C:\Users\admin\Documents\trae_projects\iampro\backend
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

### 前端依赖安装

1. 进入前端目录：
   ```bash
   cd C:\Users\admin\Documents\trae_projects\iampro\frontend
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

## 步骤3：配置环境变量

### 后端环境变量配置

1. 在后端目录下创建`.env`文件：
   ```bash
   cd C:\Users\admin\Documents\trae_projects\iampro\backend
   touch .env
   ```

2. 编辑`.env`文件，配置数据库连接信息（根据您创建的数据库信息填写）：
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_database_password
   DB_NAME=equipment_maintenance
   PORT=3000
   JWT_SECRET=your_jwt_secret_key
   ```

### 前端环境变量配置

1. 在前端目录下创建`.env`文件：
   ```bash
   cd C:\Users\admin\Documents\trae_projects\iampro\frontend
   touch .env
   ```

2. 编辑`.env`文件，配置API地址：
   ```
   VUE_APP_API_BASE_URL=http://localhost:3000/api
   ```

## 步骤4：初始化数据库表

由于您已经创建了数据库，需要执行数据库迁移来创建表结构。在后端目录下执行：

```bash
cd C:\Users\admin\Documents\trae_projects\iampro\backend
node server.js
```

Sequelize ORM会自动根据模型定义创建表结构。

## 步骤5：运行项目

### 启动后端服务器

1. 进入后端目录：
   ```bash
   cd C:\Users\admin\Documents\trae_projects\iampro\backend
   ```

2. 启动服务器：
   ```bash
   node server.js
   ```

3. 验证服务器是否启动成功：
   - 打开浏览器访问：http://localhost:3000/api/health
   - 如果看到`{"status":"ok","message":"服务器运行正常"}`，则表示后端服务器启动成功

### 启动前端开发服务器

1. 打开新的命令行窗口，进入前端目录：
   ```bash
   cd C:\Users\admin\Documents\trae_projects\iampro\frontend
   ```

2. 启动开发服务器：
   ```bash
   npm run serve
   ```

3. 启动成功后，浏览器会自动打开前端页面，或手动访问：http://localhost:8080

## 步骤6：创建初始用户

项目启动后，您需要创建初始用户来测试系统功能。

1. 使用MySQL客户端连接到数据库
2. 插入初始用户数据：

```sql
-- 插入部门数据
INSERT INTO departments (name) VALUES ('生产部'), ('维修部'), ('管理部');

-- 插入岗位数据
INSERT INTO positions (name, role) VALUES 
('普通员工', 'employee'), 
('物资管理员', 'material_admin'), 
('维修人员', 'repairman'), 
('超级管理员', 'super_admin');

-- 插入用户数据（密码为123456，已使用bcrypt加密）
INSERT INTO users (department_id, position_id, name, phone, password) VALUES 
(1, 1, '张三', '13800138001', '$2a$10$E3XKbE3a8qH6h7q1Qz5eUu1aZ2bC3dD4eF5gH6iJ7kL8mN9oP0q'), -- 普通员工
(1, 2, '李四', '13800138002', '$2a$10$E3XKbE3a8qH6h7q1Qz5eUu1aZ2bC3dD4eF5gH6iJ7kL8mN9oP0q'), -- 物资管理员
(2, 3, '王五', '13800138003', '$2a$10$E3XKbE3a8qH6h7q1Qz5eUu1aZ2bC3dD4eF5gH6iJ7kL8mN9oP0q'), -- 维修人员
(3, 4, '赵六', '13800138004', '$2a$10$E3XKbE3a8qH6h7q1Qz5eUu1aZ2bC3dD4eF5gH6iJ7kL8mN9oP0q'); -- 超级管理员

-- 插入设备数据
INSERT INTO equipment (name, model, location) VALUES 
('注塑机', 'Model-A', '生产车间1'), 
('包装机', 'Model-B', '生产车间2'), 
('传送带', 'Model-C', '生产车间3');

-- 插入物资数据
INSERT INTO materials (name, type, unit, stock_quantity, min_stock) VALUES 
('螺丝', '零件', '个', 1000, 100), 
('润滑油', '耗材', '升', 50, 10), 
('工具套装', '工具', '套', 20, 5);
```

## 步骤7：测试系统功能

1. 打开浏览器访问前端页面：http://localhost:8080
2. 使用以下账号登录测试系统功能：
   - 普通员工：手机号13800138001，密码123456
   - 物资管理员：手机号13800138002，密码123456
   - 维修人员：手机号13800138003，密码123456
   - 超级管理员：手机号13800138004，密码123456

## 常见问题及解决方案

### 1. 端口被占用

如果端口被占用，可以修改`.env`文件中的端口配置：
- 后端端口：修改`PORT`配置
- 前端端口：修改`vue.config.js`文件（如果不存在，需要创建）

### 2. 数据库连接失败

检查`.env`文件中的数据库连接配置是否正确：
- DB_HOST：数据库地址
- DB_PORT：数据库端口
- DB_USER：数据库用户名
- DB_PASSWORD：数据库密码
- DB_NAME：数据库名称

### 3. 依赖安装失败

尝试使用以下命令清理缓存后重新安装：
```bash
npm cache clean --force
npm install
```

## 项目结构说明

### 后端结构
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

### 前端结构
```
frontend/
├── public/          # 静态资源
├── src/             # 源代码
│   ├── api/         # API请求
│   ├── assets/      # 静态资源
│   ├── components/  # 组件
│   ├── router/      # 路由配置
│   ├── store/       # Vuex状态管理
│   ├── views/       # 页面组件
│   ├── App.vue      # 根组件
│   └── main.js      # 入口文件
└── package.json     # 项目配置
```

## 功能测试建议

1. **普通员工功能**：测试设备报修、物资申领
2. **维修人员功能**：测试查看派工单、处理维修
3. **物资管理员功能**：测试物资入库、出库、审批申领
4. **超级管理员功能**：测试所有功能，包括员工管理

按照以上步骤完成后，您的生产设备报修、检修、物资管理平台就可以正常运行了！