const razorpay = require('../config/razorpay');
const crypto = require('crypto');
// Create Razorpay order
exports.createRazorpayOrder = async (req, res) => {
  // CSRF error handling
  if (req.csrfToken && typeof req.csrfToken === 'function') {
    // Optionally send CSRF token to frontend if needed
    res.set('X-CSRF-Token', req.csrfToken());
  }
  console.log('Creating Razorpay order with body:', req.body);
  try {
    const { amount, currency = 'INR', receipt, notes = {} } = req.body;
    const options = {
      amount: Math.round(amount), // amount should already be in paise from frontend
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1,
      notes
    };
    console.log('Razorpay order options:', options);

    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order);
    res.json({ success: true, order });
  } catch (error) {
    // CSRF error handling
    if (error.code === 'EBADCSRFTOKEN') {
      return res.status(403).json({ success: false, error: 'Invalid CSRF token' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// (Optional) Razorpay webhook endpoint for EMI tracking


exports.razorpayWebhook = (req, res) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).send('Invalid signature');
  }

  // Process event (e.g., payment.captured)
  if (req.body.event === 'payment.captured') {
    // Update order/payment status in DB
    // Example: await Order.findOneAndUpdate({ razorpayPaymentId: req.body.payload.payment.entity.id }, { paymentStatus: 'PAID' });
  }

  res.status(200).send('Webhook received');
};