const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const RepairRequest = require('./repair_request');
const User = require('./user');

const RepairRecord = sequelize.define('RepairRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  repair_request_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: RepairRequest,
      key: 'id'
    }
  },
  repairman_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  solution_description: {
    type: DataTypes.TEXT
  },
  solution_images: {
    type: DataTypes.JSON
  },
  status: {
    type: DataTypes.ENUM('completed', 'transferred'),
    allowNull: false
  },
  transfer_note: {
    type: DataTypes.TEXT
  },
  shift_processing_log: {
    type: DataTypes.TEXT,
    comment: '班次处理记录，记录本班次对该问题的处理过程和发现'
  },
  work_personnel: {
    type: DataTypes.STRING(255),
    comment: '出工人员，记录实际参与维修的人员姓名'
  },
  completed_at: {
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
  tableName: 'repair_records',
  timestamps: false
});

module.exports = RepairRecord;