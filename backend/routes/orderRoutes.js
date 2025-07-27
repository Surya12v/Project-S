const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');
const orderController = require('../controllers/orderController');

// Customer routes
router.get('/my-orders', isAuthenticated, orderController.getMyOrders);
router.post('/', isAuthenticated, orderController.createOrder);
router.get('/:orderId', isAuthenticated, orderController.getOrderDetails);
router.put('/:orderId/cancel', isAuthenticated, orderController.cancelOrder);

// Admin routes
router.get('/admin/all', isAdmin, orderController.getAllOrders);
router.put('/admin/:orderId/status', isAdmin, orderController.updateOrderStatus);

module.exports = router;
