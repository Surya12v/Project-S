const User = require('../models/User');

exports.isAuthenticated = async (req, res, next) => {
  try {
    // Debug log
    console.log('isAuthenticated middleware - req.user:', req.user);
    if (!req.user || req.user.isActive === false) {
      return res.status(401).json({ message: 'Account is disabled or not authenticated' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

exports.isAdmin = (req, res, next) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ message: 'Access denied: Admins only' });
  } catch (error) {
    return res.status(403).json({ message: 'Admin check failed' });
  }
};
