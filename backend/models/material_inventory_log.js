const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Material = require('./material');
const User = require('./user');

const MaterialInventoryLog = sequelize.define('MaterialInventoryLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  material_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Material,
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('in', 'out'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  operator_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  description: {
    type: DataTypes.TEXT
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'material_inventory_logs',
  timestamps: false
});

// 关联
MaterialInventoryLog.belongsTo(Material, { foreignKey: 'material_id' });
MaterialInventoryLog.belongsTo(User, { foreignKey: 'operator_id', as: 'operator' });

module.exports = MaterialInventoryLog;