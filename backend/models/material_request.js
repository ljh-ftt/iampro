const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Material = require('./material');

const MaterialRequest = sequelize.define('MaterialRequest', {
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
  material_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Material,
      key: 'id'
    }
  },
  request_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  material_category: {
    type: DataTypes.ENUM('production', 'non_production'),
    allowNull: false,
    comment: '申领时物资的分类：production-生产性物资，non_production-非生产性物资'
  },
  attachments: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '附件信息，JSON格式存储多个附件路径'
  },
  photos: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '照片信息，JSON格式存储多个照片路径'
  },
  approved_by: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  approved_at: {
    type: DataTypes.DATE
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
  tableName: 'material_requests',
  timestamps: false
});

// 关联
MaterialRequest.belongsTo(User, { foreignKey: 'user_id', as: 'requester' });
MaterialRequest.belongsTo(Material, { foreignKey: 'material_id' });
MaterialRequest.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

module.exports = MaterialRequest;