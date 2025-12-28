const express = require('express');
const router = express.Router();
const repairRecordController = require('../controllers/repairRecordController');
const { auth, authorize } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// 创建维修记录
router.post('/', auth, authorize('repairman', 'super_admin'), upload.array('images', 5), repairRecordController.createRepairRecord);

// 获取维修记录列表
router.get('/', auth, repairRecordController.getRepairRecords);

// 获取单个维修记录
router.get('/:id', auth, repairRecordController.getRepairRecordById);

// 获取维修请求的班次处理历史
router.get('/history/:repair_request_id', auth, repairRecordController.getRepairShiftHistory);

module.exports = router;