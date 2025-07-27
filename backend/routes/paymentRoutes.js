const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');
const paymentController = require('../controllers/paymentController');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// CSRF token endpoint
router.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Create Razorpay order with CSRF protection
router.post('/create-order', csrfProtection, isAuthenticated, paymentController.createRazorpayOrder);

// (Optional) Razorpay webhook endpoint for EMI tracking
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.razorpayWebhook);

// --- Public/Authenticated Payment Routes ---
router.get('/order/:orderId', isAuthenticated, paymentController.getPaymentsByOrder);
router.get('/user/:userId', isAuthenticated, paymentController.getPaymentsByUser);

// --- Admin Payment Routes ---
router.get('/admin/all', isAdmin, paymentController.getAllPayments);
router.get('/admin/:paymentId', isAdmin, paymentController.getPaymentById);

module.exports = router;