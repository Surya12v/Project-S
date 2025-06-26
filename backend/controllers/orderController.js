const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const crypto = require('crypto'); // Add this for signature verification

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMode } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.productId');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total and create order items
    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.price
    }));

    const totalAmount = cart.items.reduce((total, item) => 
      total + (item.quantity * item.productId.price), 0);

    // Accept Razorpay IDs if provided (for online payment)
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Razorpay payment verification for ONLINE mode
    if (paymentMode === 'ONLINE') {
      // You must have RAZORPAY_KEY_SECRET in your environment
      const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ message: 'Missing Razorpay payment details' });
      }
      console.log("order details", razorpayOrderId, razorpayPaymentId, razorpaySignature);
      // Generate expected signature
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest('hex');
      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
    }

    // Create order
    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      shippingAddress,
      totalAmount,
      paymentMode,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });
    console.log("Order created:", order);

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { stockQuantity: -item.quantity }
      });
    }

    // Clear cart
    await Cart.findByIdAndUpdate(cart._id, { $set: { items: [] }});

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const orders = await Order.find({ userId: req.user._id })
      .populate('items.productId', 'name price') // Only get needed fields
      .sort({ createdAt: -1 });

    // Ensure we return an array even if no orders found
    res.json(orders || []);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      message: 'Error fetching orders',
      error: error.message 
    });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id
    }).populate('items.productId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus !== 'PLACED') {
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }

    order.orderStatus = 'CANCELLED';
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: item.quantity }
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin controllers
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'displayName email')
      .populate('items.productId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus: status },
      { new: true }
    ).populate('items.productId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
