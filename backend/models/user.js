const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Department = require('./department');
const Position = require('./position');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Department,
      key: 'id'
    }
  },
  position_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Position,
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
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
  tableName: 'users',
  timestamps: false
});

// 关联
User.belongsTo(Department, { foreignKey: 'department_id' });
User.belongsTo(Position, { foreignKey: 'position_id' });

module.exports = User;