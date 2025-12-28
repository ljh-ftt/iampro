const { sequelize, User, Department, Position } = require('./models');
const bcrypt = require('bcryptjs');

async function initUsers() {
  try {
    // 确保数据库连接
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // 检查是否已有部门和职位
    let department = await Department.findOne({ where: { name: '技术部' } });
    if (!department) {
      department = await Department.create({ name: '技术部' });
      console.log('Created department: 技术部');
    }

    // 创建不同角色的职位
    let positions = await Position.findAll();
    if (positions.length === 0) {
      positions = await Position.bulkCreate([
        { name: '普通员工', role: 'employee', department_id: department.id },
        { name: '维修人员', role: 'repairman', department_id: department.id },
        { name: '物资管理员', role: 'material_admin', department_id: department.id },
        { name: '超级管理员', role: 'super_admin', department_id: department.id }
      ]);
      console.log('Created 4 positions with different roles');
    }

    // 创建测试用户
    let users = await User.findAll();
    if (users.length === 0) {
      users = await User.bulkCreate([
        {
          name: '张三',
          phone: '13800138001',
          password: await bcrypt.hash('123456', 10),
          department_id: department.id,
          position_id: positions.find(p => p.role === 'employee').id
        },
        {
          name: '李四',
          phone: '13800138002',
          password: await bcrypt.hash('123456', 10),
          department_id: department.id,
          position_id: positions.find(p => p.role === 'repairman').id
        },
        {
          name: '王五',
          phone: '13800138003',
          password: await bcrypt.hash('123456', 10),
          department_id: department.id,
          position_id: positions.find(p => p.role === 'material_admin').id
        },
        {
          name: '管理员',
          phone: '13800138004',
          password: await bcrypt.hash('123456', 10),
          department_id: department.id,
          position_id: positions.find(p => p.role === 'super_admin').id
        }
      ]);
      console.log('Created 4 test users:');
      users.forEach(user => {
        const position = positions.find(p => p.id === user.position_id);
        console.log(`- ${user.name} (${user.phone}) - ${position.name} (密码: 123456)`);
      });
    } else {
      console.log('Users already exist in database');
    }

    console.log('Initialization completed successfully!');
  } catch (error) {
    console.error('Error during initialization:', error.message);
  } finally {
    await sequelize.close();
  }
}

initUsers();
