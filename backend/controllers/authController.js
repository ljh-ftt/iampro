const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Position, Department } = require('../models');

// 用户登录
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 验证输入参数
    if (!phone || !password) {
      return res.status(400).json({ message: '手机号和密码不能为空' });
    }

    // 查找用户
    const user = await User.findOne({
      where: { phone: phone },
      include: [
        {
          model: Department,
          attributes: ['name']
        },
        {
          model: Position,
          attributes: ['role', 'name']
        }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: '用户不存在' });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '密码错误' });
    }

    // 生成token
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.Position.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        department_id: user.department_id,
        department_name: user.Department.name,
        position_id: user.position_id,
        position_name: user.Position.name,
        role: user.Position.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      include: [
        {
          model: Department,
          attributes: ['name']
        },
        {
          model: Position,
          attributes: ['role', 'name']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      department_id: user.department_id,
      department_name: user.Department.name,
      position_id: user.position_id,
      position_name: user.Position.name,
      role: user.Position.role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 修改密码
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // 查找用户
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 验证当前密码
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '当前密码错误' });
    }

    // 更新密码
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: '密码修改成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
};