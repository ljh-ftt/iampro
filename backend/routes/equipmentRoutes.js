const express = require('express');
const router = express.Router();
const Equipment = require('../models/equipment');
const { auth } = require('../middleware/auth');

// 获取所有设备列表
router.get('/', auth, async (req, res) => {
  try {
    // 允许超级管理员、维修人员和员工访问设备列表
    if (!['super_admin', 'repairman', 'employee', 'material_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: '没有权限访问此资源' });
    }
    
    const { category } = req.query;
    let whereClause = {};
    
    if (category) {
      whereClause.category = category;
    }
    
    const equipment = await Equipment.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });
    
    res.json(equipment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个设备详情
router.get('/:id', auth, async (req, res) => {
  try {
    // 检查是否为超级管理员
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: '没有权限访问此资源' });
    }
    
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: '设备不存在' });
    }
    res.json(equipment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建新设备
router.post('/', auth, async (req, res) => {
  try {
    // 检查是否为超级管理员
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: '没有权限执行此操作' });
    }
    
    const { name, model, location, category, status } = req.body;
    const equipment = await Equipment.create({ name, model, location, category, status });
    res.status(201).json(equipment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新设备信息
router.put('/:id', auth, async (req, res) => {
  try {
    // 检查是否为超级管理员
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: '没有权限执行此操作' });
    }
    
    const { name, model, location, category, status } = req.body;
    const [updated] = await Equipment.update(
      { name, model, location, category, status },
      { where: { id: req.params.id } }
    );
    
    if (updated) {
      const updatedEquipment = await Equipment.findByPk(req.params.id);
      res.json(updatedEquipment);
    } else {
      res.status(404).json({ message: '设备不存在' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除设备
router.delete('/:id', auth, async (req, res) => {
  try {
    // 检查是否为超级管理员
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: '没有权限执行此操作' });
    }
    
    const deleted = await Equipment.destroy({ where: { id: req.params.id } });
    
    if (deleted) {
      res.json({ message: '设备删除成功' });
    } else {
      res.status(404).json({ message: '设备不存在' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;