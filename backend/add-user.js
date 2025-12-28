const { sequelize, User, Department, Position } = require('./models');
const bcrypt = require('bcryptjs');

async function addUserIfNotExists() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功。');

    // 检查用户是否存在
    const existingUser = await User.findOne({ where: { phone: '18758839706' } });
    
    if (existingUser) {
      console.log('用户已存在，正在验证密码...');
      const isPasswordCorrect = await bcrypt.compare('123456', existingUser.password);
      if (isPasswordCorrect) {
        console.log('密码正确！');
      } else {
        console.log('密码错误，正在重置密码...');
        existingUser.password = await bcrypt.hash('123456', 10);
        await existingUser.save();
        console.log('密码已重置为：123456');
      }
      return;
    }

    // 获取部门和职位
    let department = await Department.findOne({ where: { name: '技术部' } });
    if (!department) {
      department = await Department.create({ name: '技术部' });
      console.log('创建了部门：技术部');
    }

    let employeePosition = await Position.findOne({ where: { role: 'employee' } });
    if (!employeePosition) {
      employeePosition = await Position.create({ 
        name: '普通员工', 
        role: 'employee', 
        department_id: department.id 
      });
      console.log('创建了职位：普通员工');
    }

    // 创建新用户
    const newUser = await User.create({
      name: '新用户',
      phone: '18758839706',
      password: await bcrypt.hash('123456', 10),
      department_id: department.id,
      position_id: employeePosition.id
    });

    console.log('用户创建成功！');
    console.log('手机号：18758839706');
    console.log('密码：123456');
    console.log('角色：普通员工');

  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await sequelize.close();
  }
}

addUserIfNotExists();
