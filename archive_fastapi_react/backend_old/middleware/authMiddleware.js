const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Người dùng không tồn tại' });
      }

      req.user.role = decoded.role || req.user.role;
      req.user.isAdmin = req.user.role === 'admin';
      return next();
    } catch (error) {
      console.error('Auth error:', error.message);
      return res.status(401).json({ message: 'Không có quyền truy cập, token không hợp lệ' });
    }
  }

  return res.status(401).json({ message: 'Không có quyền truy cập, không có token' });
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Không có quyền truy cập với tư cách admin' });
  }
};

module.exports = { protect, admin };
