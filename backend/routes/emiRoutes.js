const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');
const emiController = require('../controllers/emiController');

// Customer APIs
router.get('/plans/:productId', emiController.getEmiPlansForProduct);
router.post('/calculate', emiController.calculateEmi);
router.get('/my', isAuthenticated, emiController.getMyEmiOrders);
router.get('/:emiOrderId', isAuthenticated, emiController.getEmiOrderDetails);
router.post('/:emiOrderId/pay/:scheduleIndex', isAuthenticated, emiController.payEmiInstallment);

// Admin APIs
router.get('/admin/orders', isAdmin, emiController.getAllEmiOrders);
router.put('/admin/:emiOrderId/schedule/:scheduleIndex', isAdmin, emiController.adminUpdateEmiSchedule);
router.post('/admin/plan', isAdmin, emiController.createOrUpdateEmiPlan);

module.exports = router;
