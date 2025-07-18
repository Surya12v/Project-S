// const EmiPlan = require('../models/EmiPlan');
// const EmiOrder = require('../models/EmiOrder');
const Product = require('../models/Product');
const Order = require('../models/Order');

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
    const emiOrder = await EmiOrder.findOne({ _id: emiOrderId, userId: req.user._id }).populate('productId orderId');
    if (!emiOrder) return res.status(404).json({ error: 'EMI order not found' });
    res.json(emiOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch EMI order details' });
  }
};

// Pay EMI installment
exports.payEmiInstallment = async (req, res) => {
  try {
    const { emiOrderId, scheduleIndex } = req.params;
    const emiOrder = await EmiOrder.findOne({ _id: emiOrderId, userId: req.user._id });
    if (!emiOrder) return res.status(404).json({ error: 'EMI order not found' });
    if (!emiOrder.schedule[scheduleIndex]) return res.status(400).json({ error: 'Invalid installment' });

    // Mark as paid
    emiOrder.schedule[scheduleIndex].status = 'PAID';
    emiOrder.schedule[scheduleIndex].paidAt = new Date();
    await emiOrder.save();
    res.json({ success: true, emiOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to pay EMI installment' });
  }
};

// Admin: Get all EMI orders
exports.getAllEmiOrders = async (req, res) => {
  try {
    const emiOrders = await EmiOrder.find().populate('userId productId orderId');
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
    if (status === 'PAID') emiOrder.schedule[scheduleIndex].paidAt = new Date();
    await emiOrder.save();
    res.json({ success: true, emiOrder });
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
