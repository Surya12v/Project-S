const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');
const orderController = require('../controllers/orderController');
const emiController = require('../controllers/emiController');

// Customer routes
router.get('/my-orders', isAuthenticated, orderController.getMyOrders); // Changed from /me to /my-orders
router.post('/', isAuthenticated, orderController.createOrder);
router.get('/:orderId', isAuthenticated, orderController.getOrderDetails);
router.put('/:orderId/cancel', isAuthenticated, orderController.cancelOrder);
router.post('/emi/pay', isAuthenticated, emiController.payEmiInstallment);

// Admin routes
router.get('/admin/all', isAdmin, orderController.getAllOrders);
router.put('/admin/:orderId/status', isAdmin, orderController.updateOrderStatus);

module.exports = router;
