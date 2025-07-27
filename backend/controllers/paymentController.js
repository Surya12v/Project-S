const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const notificationController = require('./notificationController'); // Import notification controller

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
exports.razorpayWebhook = async (req, res) => {
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
    // Save payment record for audit/history
    const paymentEntity = req.body.payload?.payment?.entity;
    if (paymentEntity) {
      await Payment.create({
        userId: paymentEntity.notes?.userId,
        orderId: paymentEntity.notes?.orderId,
        paymentType: 'ORDER',
        amount: paymentEntity.amount / 100,
        status: 'SUCCESS',
        method: paymentEntity.method,
        gateway: 'Razorpay',
        gatewayOrderId: paymentEntity.order_id,
        gatewayPaymentId: paymentEntity.id,
        details: paymentEntity,
        paidAt: new Date(paymentEntity.created_at * 1000),
        createdBy: 'system'
      });

      // Send notification after payment record is created
      try {
        console.log('Creating payment notification for user:', paymentEntity.notes?.userId);
        await notificationController.createNotification(
          paymentEntity.notes?.userId,
          'PAYMENT',
          'Payment Successful',
          `Your payment of ₹${paymentEntity.amount / 100} was successful.`,
          `/orders`
        );
      } catch (notifyErr) {
        console.error('Failed to create payment notification:', notifyErr);
      }
    }
  }
  res.status(200).send('Webhook received');
};

// Get all payments (admin)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ paidAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

// Get payment by ID (admin)
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payment' });
  }
};

// Get payments by order (user)
exports.getPaymentsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    // Only allow user to fetch their own order's payments
    const payments = await Payment.find({ orderId, userId: req.user._id }).sort({ paidAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payments for order' });
  }
};

// Get payments by user (user)
exports.getPaymentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    // Only allow user to fetch their own payments
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const payments = await Payment.find({ userId }).sort({ paidAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payments for user' });
  }
};

// Pay EMI installment (moved from emiController)
exports.payEmiInstallment = async (req, res) => {
  try {
    const { orderId, installmentNumber, paymentDetails } = req.body;
    if (!orderId || !installmentNumber) {
      return res.status(400).json({ error: 'Missing EMI order ID or installment number' });
    }
    const EmiOrder = require('../models/EmiOrder');
    const EmiPayment = require('../models/EmiPayment');
    const CrudHistory = require('../models/CrudHistory');
    const emiOrder = await EmiOrder.findOne({ _id: orderId, userId: req.user._id });
    if (!emiOrder) {
      return res.status(404).json({ error: 'EMI order not found' });
    }
    const idx = Number(installmentNumber) - 1;
    if (!emiOrder.schedule[idx]) {
      return res.status(400).json({ error: 'Invalid installment' });
    }
    if (emiOrder.schedule[idx].status === 'PAID') {
      return res.status(400).json({ error: 'Installment already paid' });
    }
    emiOrder.schedule[idx].status = 'PAID';
    emiOrder.schedule[idx].paidAt = new Date();
    if (emiOrder.schedule.every(s => s.status === 'PAID')) {
      emiOrder.status = 'COMPLETED';
    }
    await emiOrder.save();
    try {
      await EmiPayment.create({
        orderId,
        userId: req.user._id,
        scheduleIndex: idx,
        amount: emiOrder.schedule[idx].amount,
        paidAt: emiOrder.schedule[idx].paidAt,
        paymentDetails,
        status: 'SUCCESS',
        createdBy: 'user'
      });
    } catch {}
    try {
      await Payment.create({
        userId: req.user._id,
        orderId,
        paymentType: 'EMI',
        amount: emiOrder.schedule[idx].amount,
        status: 'SUCCESS',
        method: paymentDetails?.method || 'ONLINE',
        gateway: paymentDetails?.gateway || 'Razorpay',
        gatewayOrderId: paymentDetails?.razorpayOrderId,
        gatewayPaymentId: paymentDetails?.razorpayPaymentId,
        gatewaySignature: paymentDetails?.razorpaySignature,
        scheduleIndex: idx,
        details: paymentDetails,
        paidAt: emiOrder.schedule[idx].paidAt,
        createdBy: 'user'
      });
    } catch {}
    try {
      await CrudHistory.create({
        userId: req.user._id,
        action: 'PAYMENT',
        entity: 'EmiOrder',
        entityId: orderId,
        details: {
          orderId,
          scheduleIndex: idx,
          amount: emiOrder.schedule[idx].amount,
          paymentDetails
        },
        createdBy: 'user'
      });
    } catch {}
    const updatedEmiOrder = await EmiOrder.findById(orderId).populate('productId orderId');
    res.json({ success: true, emiOrder: updatedEmiOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to pay EMI installment', details: err.message });
  }
};