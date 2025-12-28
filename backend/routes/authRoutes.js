const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// 登录路由
router.post('/login', authController.login);

// 获取当前用户信息
router.get('/me', auth, authController.getCurrentUser);

// 修改密码
router.post('/change-password', auth, authController.changePassword);

module.exports = router;