const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  emiOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmiOrder' },
  paymentType: { type: String, enum: ['ORDER', 'EMI', 'WALLET', 'REFUND'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING'], default: 'SUCCESS' },
  method: { type: String }, // e.g. ONLINE, COD, UPI, CARD, WALLET
  gateway: { type: String }, // e.g. Razorpay, Stripe, Paytm
  gatewayOrderId: { type: String },
  gatewayPaymentId: { type: String },
  gatewaySignature: { type: String },
  scheduleIndex: { type: Number }, // for EMI payments
  details: { type: Object }, // any extra info (UPI id, card last4, etc)
  paidAt: { type: Date, default: Date.now },
  createdBy: { type: String, enum: ['user', 'admin', 'system'], default: 'user' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
