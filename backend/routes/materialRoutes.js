const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { auth, authorize } = require('../middleware/auth');

// 物资入库
router.post('/in', auth, authorize('material_admin', 'super_admin'), materialController.addMaterial);

// 物资出库
router.post('/out', auth, authorize('material_admin', 'super_admin'), materialController.issueMaterial);

// 申领物资
router.post('/request', auth, authorize('employee', 'material_admin', 'super_admin'), materialController.requestMaterial);

// 审批物资申领
router.put('/request/approve', auth, authorize('material_admin', 'super_admin'), materialController.approveMaterialRequest);

// 获取物资列表
router.get('/', auth, materialController.getMaterials);

// 获取物资申领记录
router.get('/requests', auth, materialController.getMaterialRequests);

module.exports = router;