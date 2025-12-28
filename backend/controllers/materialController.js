const { Material, MaterialRequest, MaterialInventoryLog, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// 物资入库
exports.addMaterial = async (req, res) => {
  try {
    const { name, type, unit, quantity, min_stock, category } = req.body;

    // 查找是否已存在该物资
    let material = await Material.findOne({ where: { name } });

    if (material) {
      // 更新库存
      await material.update({
        stock_quantity: material.stock_quantity + quantity,
        min_stock: min_stock || material.min_stock
      });
    } else {
      // 创建新物资
      material = await Material.create({
        name,
        type,
        unit,
        stock_quantity: quantity,
        min_stock: min_stock || 0,
        category: category || 'production' // 默认是生产性物资
      });
    }

    // 记录入库日志
    await MaterialInventoryLog.create({
      material_id: material.id,
      type: 'in',
      quantity,
      operator_id: req.user.userId,
      description: `入库：${name} ${quantity}${unit}`
    });

    res.json({ message: '物资入库成功', material });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 物资出库
exports.issueMaterial = async (req, res) => {
  try {
    const { material_id, quantity, user_id } = req.body;

    // 检查物资是否存在
    const material = await Material.findByPk(material_id);
    if (!material) {
      return res.status(404).json({ message: '物资不存在' });
    }

    // 检查库存是否充足
    if (material.stock_quantity < quantity) {
      return res.status(400).json({ message: '库存不足' });
    }

    // 更新库存
    await material.update({
      stock_quantity: material.stock_quantity - quantity
    });

    // 记录出库日志
    await MaterialInventoryLog.create({
      material_id: material.id,
      type: 'out',
      quantity,
      operator_id: req.user.userId,
      description: `出库：${material.name} ${quantity}${material.unit} 给用户 ${user_id}`
    });

    res.json({ message: '物资出库成功', material });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 申领物资
exports.requestMaterial = async (req, res) => {
  try {
    const { material_id, request_quantity, attachments, photos } = req.body;
    const user_id = req.user.userId;

    // 检查物资是否存在
    const material = await Material.findByPk(material_id);
    if (!material) {
      return res.status(404).json({ message: '物资不存在' });
    }

    // 检查库存是否充足
    if (material.stock_quantity < request_quantity) {
      return res.status(400).json({ message: '库存不足' });
    }

    // 创建申领记录
    const materialRequest = await MaterialRequest.create({
      user_id,
      material_id,
      request_quantity,
      material_category: material.category, // 保存申领时物资的分类
      attachments: attachments ? JSON.stringify(attachments) : null,
      photos: photos ? JSON.stringify(photos) : null
    });

    res.status(201).json({ message: '物资申领成功', materialRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 审批物资申领
exports.approveMaterialRequest = async (req, res) => {
  try {
    const { id, status } = req.body;
    const approved_by = req.user.userId;

    // 检查申领记录是否存在
    const materialRequest = await MaterialRequest.findByPk(id, {
      include: [Material]
    });
    if (!materialRequest) {
      return res.status(404).json({ message: '申领记录不存在' });
    }

    // 检查库存是否充足（仅当批准时）
    if (status === 'approved') {
      if (materialRequest.Material.stock_quantity < materialRequest.request_quantity) {
        return res.status(400).json({ message: '库存不足' });
      }

      // 使用事务确保原子性
      await sequelize.transaction(async (t) => {
        // 更新物资库存
        await materialRequest.Material.update({
          stock_quantity: materialRequest.Material.stock_quantity - materialRequest.request_quantity
        }, { transaction: t });

        // 记录出库日志
        await MaterialInventoryLog.create({
          material_id: materialRequest.material_id,
          type: 'out',
          quantity: materialRequest.request_quantity,
          operator_id: approved_by,
          description: `物资申领批准：${materialRequest.Material.name} ${materialRequest.request_quantity}${materialRequest.Material.unit}`
        }, { transaction: t });

        // 更新申领记录状态
        await materialRequest.update({
          status,
          approved_by,
          approved_at: new Date()
        }, { transaction: t });
      });
    } else {
      // 拒绝申领
      await materialRequest.update({
        status,
        approved_by,
        approved_at: new Date()
      });
    }

    res.json({ message: `物资申领已${status === 'approved' ? '批准' : '拒绝'}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取物资列表
exports.getMaterials = async (req, res) => {
  try {
    // 获取用户信息，判断其部门和角色
    const user = await User.findByPk(req.user.userId, {
      include: [{ model: require('../models').Department }]
    });
    
    let where = {};
    
    // 处理搜索参数
    const { search, category } = req.query;
    
    // 如果客户端传入了分类参数，则使用该参数
    if (category) {
      where.category = category;
    } else {
      // 根据用户角色和部门进行筛选
      if (req.user.role === 'material_admin') {
        // 物资管理员只能看到其部门类型的物资
        if (user.Department.name === '工信技术与信息管理部') {
          where.category = 'production'; // 生产性物资
        } else if (user.Department.name === '综合办公室') {
          where.category = 'non_production'; // 非生产性物资
        }
      }
      // 超级管理员和普通员工可以查看所有物资
    }
    
    // 添加名称搜索条件（模糊搜索）
    if (search) {
      where.name = {
        [Op.like]: `%${search}%`
      };
    }

    const materials = await Material.findAll({ 
      where,
      order: [['created_at', 'DESC']]
    });
    res.json(materials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取物资申领记录
exports.getMaterialRequests = async (req, res) => {
  try {
    const { user_id, status } = req.query;
    const where = {};
    if (user_id) where.user_id = user_id;
    if (status) where.status = status;

    // 获取用户信息，判断其部门和角色
    const user = await User.findByPk(req.user.userId, {
      include: [{ model: require('../models').Department }]
    });
    
    // 根据用户角色和部门进行筛选
    if (req.user.role === 'material_admin') {
      // 物资管理员只能看到其部门类型的物资申领记录
      if (user.Department.name === '工信技术与信息管理部') {
        where.material_category = 'production'; // 生产性物资
      } else if (user.Department.name === '综合办公室') {
        where.material_category = 'non_production'; // 非生产性物资
      }
    }
    // 超级管理员可以查看所有申领记录
    // 普通员工只能查看自己的申领记录

    const materialRequests = await MaterialRequest.findAll({
      where,
      include: [Material, { model: User, as: 'requester' }],
      order: [['created_at', 'DESC']]
    });

    res.json(materialRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
};