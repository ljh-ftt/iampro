const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { sequelize } = require('./models');

// 加载环境变量
dotenv.config();

// 初始化应用
const app = express();

// 中间件
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://10.123.240.127:8080', 'http://10.123.240.127'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 根路径响应
app.get('/', (req, res) => {
  res.json({
    message: '生产设备报修、检修、物资管理平台 API 服务器',
    version: '1.0.0',
    availableAPIs: [
      '/api/auth/login - 用户登录',
      '/api/repair-requests - 报修请求管理',
      '/api/repair-records - 维修记录管理',
      '/api/materials - 物资管理',
      '/api/health - 健康检查'
    ],
    frontendURL: 'http://localhost:8080'
  });
});

// 路由
const authRoutes = require('./routes/authRoutes');
const repairRequestRoutes = require('./routes/repairRequestRoutes');
const repairRecordRoutes = require('./routes/repairRecordRoutes');
const materialRoutes = require('./routes/materialRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/repair-requests', repairRequestRoutes);
app.use('/api/repair-records', repairRecordRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/upload', uploadRoutes);

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器错误' });
});

// 启动服务器
const PORT = process.env.PORT || 3001;

sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
    console.log(`本地访问地址: http://localhost:${PORT}`);
    console.log('数据库模型已同步');
  });
}).catch(err => {
  console.error('数据库连接错误:', err);
});
