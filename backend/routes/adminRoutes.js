const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middlewares/authMiddleware');
const adminController = require('../controllers/adminController');

// Apply isAdmin middleware to all routes
router.use(isAdmin);

// Dashboard stats route
router.get('/dashboard/stats', async (req, res) => {
  const User = require('../models/User');
  const Order = require('../models/Order');
  const Product = require('../models/Product');
  try {
    const [userCount, orderCount, productCount, recentOrders, totalAmountAgg] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }])
    ]);
    const total = totalAmountAgg[0]?.total || 0;
    console.log('User count:', userCount);
    console.log('Admin routes',total);
    console.log('Dashboard stats fetched successfully');
    res.json({
      userCount,
      orderCount,
      productCount,
      recentOrders,
      total
    });
    
   
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});
console.log('Admin dashboard stats route initialized');


// User Management Routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
