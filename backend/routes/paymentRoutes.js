const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/authMiddleware');
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

module.exports = router;