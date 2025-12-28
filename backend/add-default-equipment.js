const { sequelize } = require('./models');
const Equipment = require('./models/equipment');

// 默认设备数据
const defaultEquipment = [
  { name: '冲压机A', model: 'YH-200', location: '车间A-01', status: 'normal' },
  { name: '冲压机B', model: 'YH-200', location: '车间A-02', status: 'normal' },
  { name: '注塑机A', model: 'SZ-300', location: '车间B-01', status: 'normal' },
  { name: '注塑机B', model: 'SZ-300', location: '车间B-02', status: 'faulty' },
  { name: '注塑机C', model: 'SZ-400', location: '车间B-03', status: 'normal' },
  { name: '包装机A', model: 'BZ-150', location: '车间C-01', status: 'maintenance' },
  { name: '包装机B', model: 'BZ-150', location: '车间C-02', status: 'normal' },
  { name: '传送带A', model: 'CD-500', location: '车间D-01', status: 'normal' },
  { name: '传送带B', model: 'CD-500', location: '车间D-02', status: 'normal' },
  { name: '检测设备A', model: 'JC-100', location: '车间E-01', status: 'normal' }
];

// 添加默认设备数据
const addDefaultEquipment = async () => {
  try {
    // 同步数据库模型
    await sequelize.sync();
    
    // 批量创建设备
    const createdEquipment = await Equipment.bulkCreate(defaultEquipment);
    console.log(`成功添加 ${createdEquipment.length} 台默认设备：`);
    createdEquipment.forEach(equipment => {
      console.log(`- ${equipment.name} (${equipment.model}) - ${equipment.status}`);
    });
  } catch (error) {
    console.error('添加默认设备失败:', error);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
};

// 执行添加默认设备
addDefaultEquipment();