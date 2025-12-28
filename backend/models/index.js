const sequelize = require('../config/database');
const Department = require('./department');
const Position = require('./position');
const User = require('./user');
const Equipment = require('./equipment');
const RepairRequest = require('./repair_request');
const RepairRecord = require('./repair_record');
const Material = require('./material');
const MaterialRequest = require('./material_request');
const MaterialInventoryLog = require('./material_inventory_log');

// 定义模型关联关系
// 部门与用户
Department.hasMany(User, { foreignKey: 'department_id' });
User.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// 职位与用户
Position.hasMany(User, { foreignKey: 'position_id' });
User.belongsTo(Position, { foreignKey: 'position_id', as: 'position' });

// 用户与报修记录
User.hasMany(RepairRequest, { foreignKey: 'user_id', as: 'reportedRequests' });
RepairRequest.belongsTo(User, { foreignKey: 'user_id', as: 'reporter' });

// 设备与报修记录
Equipment.hasMany(RepairRequest, { foreignKey: 'equipment_id' });
RepairRequest.belongsTo(Equipment, { foreignKey: 'equipment_id', as: 'equipment' });

// 报修记录与维修记录
RepairRequest.hasMany(RepairRecord, { foreignKey: 'repair_request_id', as: 'repair_records' });
RepairRecord.belongsTo(RepairRequest, { foreignKey: 'repair_request_id', as: 'repair_request' });

// 维修人员与维修记录
User.hasMany(RepairRecord, { foreignKey: 'repairman_id', as: 'repairRecords' });
RepairRecord.belongsTo(User, { foreignKey: 'repairman_id', as: 'repairman' });

// 导出所有模型
module.exports = {
  sequelize,
  Department,
  Position,
  User,
  Equipment,
  RepairRequest,
  RepairRecord,
  Material,
  MaterialRequest,
  MaterialInventoryLog
};