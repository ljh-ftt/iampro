const { RepairRecord, RepairRequest, User, Equipment } = require('../models');
const feishuService = require('../services/feishuService');

// 创建维修记录
exports.createRepairRecord = async (req, res) => {
  try {
    const { repair_request_id, status, solution_description, transfer_note, shift_processing_log, work_personnel } = req.body;
    const repairman_id = req.user.userId;

    // 检查报修记录是否存在
    const repairRequest = await RepairRequest.findByPk(repair_request_id);
    if (!repairRequest) {
      return res.status(404).json({ message: '报修记录不存在' });
    }

    // 更新报修记录状态
    await repairRequest.update({ 
      status: status === 'completed' ? 'completed' : 'transferred'
    });

    // 创建维修记录
    const repairRecord = await RepairRecord.create({
      repair_request_id,
      repairman_id,
      solution_description,
      solution_images: req.files ? req.files.map(file => file.path) : [],
      status,
      transfer_note,
      shift_processing_log,
      work_personnel,
      completed_at: status === 'completed' ? new Date() : null
    });

    // 如果维修完成，更新设备状态并发送飞书通知
    if (status === 'completed') {
      const equipment = await Equipment.findByPk(repairRequest.equipment_id);
      if (equipment) {
        await equipment.update({ status: 'normal' });
      }

      // 发送飞书维修完成通知
      try {
        const repairman = await User.findByPk(repairman_id);
        await feishuService.sendRepairCompletedNotification({
          equipment_name: equipment.name,
          work_description: solution_description,
          repairer_name: repairman.name,
          repaired_at: repairRecord.completed_at
        });
      } catch (notificationError) {
        console.error('飞书维修完成通知发送失败:', notificationError);
        // 不影响主流程，只记录日志
      }
    }

    res.status(201).json({ 
      message: '维修记录创建成功',
      repairRecord 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取维修记录列表
exports.getRepairRecords = async (req, res) => {
  try {
    const repairRecords = await RepairRecord.findAll({
      include: [
        {
          model: RepairRequest,
          include: [Equipment]
        },
        {
          model: User,
          as: 'repairman'
        }
      ],
      order: [['created_at', 'DESC']],
      attributes: ['id', 'repair_request_id', 'repairman_id', 'solution_description', 'solution_images', 'status', 'transfer_note', 'shift_processing_log', 'work_personnel', 'completed_at', 'created_at', 'updated_at']
    });

    res.json(repairRecords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取单个维修记录
exports.getRepairRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const repairRecord = await RepairRecord.findByPk(id, {
      include: [
        {
          model: RepairRequest,
          include: [
            Equipment,
            {
              model: User,
              as: 'reporter'
            }
          ]
        },
        {
          model: User,
          as: 'repairman'
        }
      ]
    });

    if (!repairRecord) {
      return res.status(404).json({ message: '维修记录不存在' });
    }

    res.json(repairRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取维修请求的班次处理历史
exports.getRepairShiftHistory = async (req, res) => {
  try {
    const { repair_request_id } = req.params;

    // 检查报修记录是否存在
    const repairRequest = await RepairRequest.findByPk(repair_request_id);
    if (!repairRequest) {
      return res.status(404).json({ message: '报修记录不存在' });
    }

    // 获取该维修请求的所有班次处理记录
    const shiftRecords = await RepairRecord.findAll({
      where: { repair_request_id },
      include: [
        {
          model: User,
          as: 'repairman',
          attributes: ['id', 'name', 'username']
        }
      ],
      order: [['created_at', 'ASC']],
      attributes: ['id', 'solution_description', 'solution_images', 'status', 'transfer_note', 'shift_processing_log', 'work_personnel', 'completed_at', 'created_at']
    });

    res.json({
      repair_request: {
        id: repairRequest.id,
        fault_description: repairRequest.fault_description,
        equipment: repairRequest.Equipment ? {
          id: repairRequest.Equipment.id,
          name: repairRequest.Equipment.name,
          category: repairRequest.Equipment.category
        } : null,
        reporter: repairRequest.User ? {
          id: repairRequest.User.id,
          name: repairRequest.User.name
        } : null,
        status: repairRequest.status,
        created_at: repairRequest.created_at
      },
      shift_history: shiftRecords
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
};