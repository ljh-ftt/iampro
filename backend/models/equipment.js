const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Equipment = sequelize.define('Equipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  model: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('股道龙门吊', '堆场龙门吊', '堆高机', '正面吊', '集卡', '车辆', '远控室设备', '其他'),
    allowNull: false,
    defaultValue: '其他'
  },
  status: {
    type: DataTypes.ENUM('normal', 'faulty', 'maintenance'),
    defaultValue: 'normal'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  tableName: 'equipment',
  timestamps: false
});

module.exports = Equipment;