const jwt = require('jsonwebtoken');

// 验证token中间件
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: '认证失败' });
  }
};

// 权限验证中间件
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '没有权限执行此操作' });
    }
    next();
  };
};

module.exports = { auth, authorize };