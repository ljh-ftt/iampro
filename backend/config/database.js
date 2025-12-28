const { Sequelize } = require('sequelize');

// 创建数据库连接
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'root',
  password: '123456',
  database: process.env.DB_NAME || 'equipment_maintenance',
  timezone: '+08:00',
  dialectOptions: {
    charset: 'utf8mb4'
  },
  define: {
    timestamps: true,
    underscored: true
  }
});

module.exports = sequelize;