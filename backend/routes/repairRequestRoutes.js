const express = require('express');
const router = express.Router();
const repairRequestController = require('../controllers/repairRequestController');
const { auth, authorize } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// 创建报修记录
router.post('/', auth, authorize('employee', 'super_admin'), upload.array('images', 5), repairRequestController.createRepairRequest);

// 获取报修记录列表
router.get('/', auth, repairRequestController.getRepairRequests);

// 获取单个报修记录
router.get('/:id', auth, repairRequestController.getRepairRequestById);

// 更新报修记录状态
router.put('/:id/status', auth, authorize('repairman', 'super_admin'), repairRequestController.updateRepairRequestStatus);

module.exports = router;