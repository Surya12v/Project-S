// const EmiPlan = require('../models/EmiPlan');
const EmiOrder = require('../models/EmiOrder');
const EmiPayment = require('../models/EmiPayment');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const Order = require('../models/Order');
const CrudHistory = require('../models/CrudHistory');
const mongoose = require('mongoose');
const notificationController = require('./notificationController');

// Get EMI plans for a product (read directly from Product.emiPlans)
exports.getEmiPlansForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).json({ error: 'Product not found' });
    // Return the emiPlans array directly from the product document
    console.log(`Fetching EMI plans for product ${productId}`);
    console.log('Product EMI plans:', product.emiPlans || []);
    res.json({ emiPlans: product.emiPlans || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch EMI plans' });
  }
};

// Calculate EMI monthly installment
exports.calculateEmi = (req, res) => {
  try {
    const { principal, duration, interestRate } = req.body;
    const r = interestRate / 12 / 100;
    let emi = 0;
    if (r === 0) emi = +(principal / duration).toFixed(2);
    else emi = +(
      (principal * r * Math.pow(1 + r, duration)) /
      (Math.pow(1 + r, duration) - 1)
    ).toFixed(2);
    res.json({ emi });
  } catch (err) {
    res.status(400).json({ error: 'Invalid EMI calculation' });
  }
};

// Place order with EMI (handled in orderController, but you can extend as needed)

// Get all EMI orders for logged-in user
exports.getMyEmiOrders = async (req, res) => {
  try {
    const emiOrders = await EmiOrder.find({ userId: req.user._id }).populate('productId orderId');
    res.json(emiOrders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch EMI orders' });
  }
};

// Get EMI order details
exports.getEmiOrderDetails = async (req, res) => {
  try {
    const { emiOrderId } = req.params;
    // Populate productId and orderId, and also include emiPlans from product
    const emiOrder = await EmiOrder.findOne({ _id: emiOrderId, userId: req.user._id })
      .populate({
        path: 'productId',
        select: 'name emiPlans', // <-- include emiPlans here
      })
      .populate('orderId');
    if (!emiOrder) return res.status(404).json({ error: 'EMI order not found' });

    // Attach emiPlans from product to the response for frontend use
    const emiPlans = emiOrder.productId?.emiPlans || [];
    res.json({ ...emiOrder.toObject(), emiPlans });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch EMI order details' });
  }
};


// Pay EMI installment
exports.payEmiInstallment = async (req, res) => {
  console.log('Processing EMI installment payment:', req.body);
  try {
    // Accept orderId (emiOrderId) and installmentNumber from body for POST /emi/pay
    const { orderId, installmentNumber, paymentDetails } = req.body;
    console.log('Received:', { orderId, installmentNumber, paymentDetails });

    // Validate input
    if (!orderId || !installmentNumber) {
      console.log('Missing EMI order ID or installment number');
      return res.status(400).json({ error: 'Missing EMI order ID or installment number' });
    }

    // Find the EMI order for the logged-in user
    const emiOrder = await EmiOrder.findOne({ 
      _id: orderId,
      userId: req.user._id
    });
    console.log('Found EMI order:', emiOrder);

    if (!emiOrder) {
      console.log('EMI order not found');
      return res.status(404).json({ error: 'EMI order not found' });
    }

    const idx = Number(installmentNumber) - 1;
    console.log('Installment index:', idx, 'Schedule:', emiOrder.schedule);

    if (!emiOrder.schedule[idx]) {
      console.log('Invalid installment');
      return res.status(400).json({ error: 'Invalid installment' });
    }

    // Prevent double payment
    if (emiOrder.schedule[idx].status === 'PAID') {
      console.log('Installment already paid');
      return res.status(400).json({ error: 'Installment already paid' });
    }

    // Mark as paid
    emiOrder.schedule[idx].status = 'PAID';
    emiOrder.schedule[idx].paidAt = new Date();
    console.log('Marked as paid:', emiOrder.schedule[idx]);

    // If all installments are paid, mark EMI order as COMPLETED
    const allPaid = emiOrder.schedule.every(s => s.status === 'PAID');
    if (allPaid) {
      emiOrder.status = 'COMPLETED';
      console.log('All installments paid, marking EMI order as COMPLETED');
    }

    await emiOrder.save();
    console.log('EMI order saved');

    // Save EMI payment record (legacy)
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
      console.log('EmiPayment record created');
    } catch (err) {
      console.error('Error creating EmiPayment:', err);
    }

    // Save to unified Payment collection
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
      console.log('Payment record created');
    } catch (err) {
      console.error('Error creating Payment:', err);
    }
    // Save CRUD history
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
      console.log('CrudHistory record created');
    } catch (err) {
      console.error('Error creating CrudHistory:', err);
    }
    // Return updated EMI order (with populated fields)
    const updatedEmiOrder = await EmiOrder.findById(orderId).populate('productId orderId');
    console.log('Returning updated EMI order:', updatedEmiOrder);
    res.json({ success: true, emiOrder: updatedEmiOrder });
  } catch (err) {
    console.error('EMI installment payment error:', err);
    res.status(500).json({ error: 'Failed to pay EMI installment', details: err.message });
  }
};

// Admin: Get all EMI ordersder (with populated fields)
exports.getAllEmiOrders = async (req, res) => {
  try {
    const emiOrders = await EmiOrder.find().populate('userId productId orderId');
    // Attach payment history to each EMI order
    for (const emi of emiOrders) {('EMI installment payment error:', err);
      emi.payments = await EmiPayment.find({ emiOrderId: emi._id }).sort({ paidAt: 1 });
    }
    res.json(emiOrders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch EMI orders' });
  }
};

// Admin: Update EMI schedule status
exports.adminUpdateEmiSchedule = async (req, res) => {
  try {
    const { emiOrderId, scheduleIndex } = req.params;
    const { status } = req.body;
    const emiOrder = await EmiOrder.findById(emiOrderId);
    if (!emiOrder || !emiOrder.schedule[scheduleIndex]) {
      return res.status(404).json({ error: 'EMI order or schedule not found' });
    }
    emiOrder.schedule[scheduleIndex].status = status;
    if (status === 'PAID') {
      emiOrder.schedule[scheduleIndex].paidAt = new Date();
    }
    await emiOrder.save(); 
    const updatedEmiOrder = await EmiOrder.findById(emiOrderId);
    res.json({ success: true, emiOrder: updatedEmiOrder }); 
  } catch (err) {   
    res.status(500).json({ error: 'Failed to update EMI schedule' });
  }
};


// Admin: Create or update EMI plan for a product
exports.createOrUpdateEmiPlan = async (req, res) => { 
  try { 
    const { productId, durations } = req.body;
    let plan = await EmiPlan.findOne({ productId });
    if (plan) {
      plan.durations = durations;
      await plan.save();
    } else {
      plan = await EmiPlan.create({ productId, durations });
    } 
    res.json(plan);  
  } catch (err) {    
    res.status(500).json({ error: 'Failed to save EMI plan' });
  }
};

// Utility: Auto-pay due EMIs (to be called by a cron job)
exports.autoPayDueEmis = async () => {
  const today = new Date();
  // Find all DUE schedules with autoPayment enabled and due today or earlier
  const emiOrders = await EmiOrder.find({
    status: 'ONGOING',
    'schedule.status': 'DUE',// Utility: Auto-pay due EMIs (to be called by a cron job)
    'schedule.dueDate': { $lte: today },
    autoPaymentMethod: { $exists: true, $ne: null }
  })

  for (const emiOrder of emiOrders) {
    for (let i = 0; i < emiOrder.schedule.length; i++) {
      const inst = emiOrder.schedule[i];
      if (inst.status === 'DUE' && new Date(inst.dueDate) <= today) {
        // Simulate payment gateway call here (replace with real integration)
        const paymentSuccess = true; // Assume always succeeds for demo
        if (paymentSuccess) {
          inst.status = 'PAID';
          inst.paidAt = new Date();
          // Optionally log payment resultf (inst.status === 'DUE' && new Date(inst.dueDate) <= today) {
        } else {   // Simulate payment gateway call here (replace with real integration)
          // Optionally handle payment failure// Assume always succeeds for demo
        }
      }
    }     inst.paidAt = new Date();
    // If all paid, mark as COMPLETEDg payment result
    if (emiOrder.schedule.every(s => s.status === 'PAID')) {   
      emiOrder.status = 'COMPLETED';        // Optionally handle payment failure
    }   

    // If all paid, mark as COMPLETED
    if (emiOrder.schedule.every(s => s.status === 'PAID')) {
      emiOrder.status = 'COMPLETED';
    }
    await emiOrder.save();
  }
};

