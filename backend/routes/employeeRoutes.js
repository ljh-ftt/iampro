const express = require('express');
const router = express.Router();
const { User, Department, Position } = require('../models');
const { Op } = require('sequelize');
const { auth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// 获取员工列表
router.get('/', auth, async (req, res) => {
  try {
    // 检查是否为超级管理员
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: '没有权限访问此资源' });
    }
    
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const whereCondition = {};
    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const { count, rows: employees } = await User.findAndCountAll({
      include: [
        { model: Department, as: 'Department' },
        { model: Position, as: 'Position' }
      ],
      where: whereCondition,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    
    res.json({
      employees,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取部门列表
router.get('/departments', auth, async (req, res) => {
  try {
    // 检查是否为超级管理员
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: '没有权限访问此资源' });
    }
    
    const departments = await Department.findAll();
    res.json(departments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取岗位列表
router.get('/positions', auth, async (req, res) => {
  try {
    // 检查是否为超级管理员
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: '没有权限访问此资源' });
    }
    
    const positions = await Position.findAll();
    res.json(positions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个员工
router.get('/:id', auth, async (req, res) => {
  try {
    // 检查是否为超级管理员
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: '没有权限访问此资源' });
    }
    
    const employee = await User.findByPk(req.params.id, {
      include: [
        { model: Department, as: 'Department' },
        { model: Position, as: 'Position' }
      ]
    });
    
    if (!employee) {
      return res.status(404).json({ message: '员工不存在' });
    }
    
    res.json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建员工
router.post('/', auth, async (req, res) => {
  try {
    // 检查是否为超级管理员
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: '没有权限执行此操作' });
    }
    
    const { name, phone, department_id, position_id, password } = req.body;
    
    // 检查手机号是否已存在
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ message: '手机号已被使用' });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建员工
    const employee = await User.create({
      name,
      phone,
      department_id,
      position_id,
      password: hashedPassword
    });
    
    res.status(201).json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新员工
router.put('/:id', auth, async (req, res) => {
  try {
    // 检查是否为超级管理员
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: '没有权限执行此操作' });
    }
    
    const { name, phone, department_id, position_id, password } = req.body;
    const employee = await User.findByPk(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: '员工不存在' });
    }
    
    // 检查手机号是否已被其他用户使用
    if (phone && phone !== employee.phone) {
      const existingUser = await User.findOne({ where: { phone } });
      if (existingUser) {
        return res.status(400).json({ message: '手机号已被使用' });
      }
    }
    
    // 更新员工信息
    const updateData = {
      name,
      phone,
      department_id,
      position_id
    };
    
    // 如果提供了密码，则更新密码
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    await employee.update(updateData);
    res.json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除员工
router.delete('/:id', auth, async (req, res) => {
  try {
    // 检查是否为超级管理员
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: '没有权限执行此操作' });
    }
    
    const employee = await User.findByPk(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: '员工不存在' });
    }
    
    await employee.destroy();
    res.json({ message: '员工删除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;