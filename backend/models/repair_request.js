const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Equipment = require('./equipment');

const RepairRequest = sequelize.define('RepairRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  equipment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Equipment,
      key: 'id'
    }
  },
  fault_description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fault_images: {
    type: DataTypes.JSON
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'transferred'),
    defaultValue: 'pending'
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
  tableName: 'repair_requests',
  timestamps: false
});

// 关联
RepairRequest.belongsTo(User, { foreignKey: 'user_id' });
RepairRequest.belongsTo(Equipment, { foreignKey: 'equipment_id' });

module.exports = RepairRequest;