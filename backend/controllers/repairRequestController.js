const { RepairRequest, Equipment, User, Department, Position } = require('../models');
const { Op } = require('sequelize');
const feishuService = require('../services/feishuService');

// 创建报修记录
exports.createRepairRequest = async (req, res) => {
  try {
    const { equipment_id, fault_description } = req.body;
    const user_id = req.user.userId;

    // 检查设备是否存在
    const equipment = await Equipment.findByPk(equipment_id);
    if (!equipment) {
      return res.status(404).json({ message: '设备不存在' });
    }

    // 获取用户信息
    const user = await User.findByPk(user_id, {
      include: [Department, Position]
    });

    // 创建报修记录
    const repairRequest = await RepairRequest.create({
      user_id,
      equipment_id,
      fault_description,
      fault_images: req.files ? req.files.map(file => file.path) : []
    });

    // 更新设备状态为故障
    await equipment.update({ status: 'faulty' });

    // 发送飞书通知
    try {
      await feishuService.sendRepairNotification({
        equipment_name: equipment.name,
        description: fault_description,
        priority: '一般', // 可以根据需要动态设置
        requester_name: user.name,
        created_at: repairRequest.created_at
      });
    } catch (notificationError) {
      console.error('飞书通知发送失败:', notificationError);
      // 不影响主流程，只记录日志
    }

    res.status(201).json({
      message: '报修成功',
      repairRequest: {
        ...repairRequest.toJSON(),
        reporter: {
          name: user.name,
          phone: user.phone,
          department: user.Department.name,
          position: user.Position.name
        },
        equipment: {
          name: equipment.name,
          model: equipment.model,
          location: equipment.location
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取报修记录列表
exports.getRepairRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};

    if (status) {
      if (Array.isArray(status)) {
        // 如果是数组，使用Op.in查询
        where.status = { [Op.in]: status };
      } else if (status.includes(',')) {
        // 如果是字符串且包含逗号，分割后使用Op.in查询
        where.status = { [Op.in]: status.split(',') };
      } else {
        // 单个状态值
        where.status = status;
      }
    }

    const repairRequests = await RepairRequest.findAll({
      where,
      include: [
        {
          model: User,
          as: 'reporter',
          include: [Department, Position]
        },
        {
          model: Equipment
        },
        {
          model: require('../models/repair_record'),
          as: 'repair_records',
          include: [
            {
              model: User,
              as: 'repairman'
            }
          ],
          attributes: ['id', 'repair_request_id', 'repairman_id', 'solution_description', 'solution_images', 'status', 'transfer_note', 'shift_processing_log', 'work_personnel', 'completed_at', 'created_at', 'updated_at']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(repairRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取单个报修记录
exports.getRepairRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const repairRequest = await RepairRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'reporter',
          include: [Department, Position]
        },
        {
          model: Equipment
        },
        {
          model: require('../models/repair_record'),
          as: 'repair_records',
          include: [
            {
              model: User,
              as: 'repairman'
            }
          ]
        }
      ]
    });

    if (!repairRequest) {
      return res.status(404).json({ message: '报修记录不存在' });
    }

    res.json(repairRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新报修记录状态
exports.updateRepairRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const repairRequest = await RepairRequest.findByPk(id);
    if (!repairRequest) {
      return res.status(404).json({ message: '报修记录不存在' });
    }

    await repairRequest.update({ status });

    // 如果状态为已完成，更新设备状态为正常
    if (status === 'completed') {
      const equipment = await Equipment.findByPk(repairRequest.equipment_id);
      if (equipment) {
        await equipment.update({ status: 'normal' });
      }
    }

    res.json({ message: '状态更新成功', repairRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
};