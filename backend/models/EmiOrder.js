const mongoose = require('mongoose');

const emiScheduleSchema = new mongoose.Schema({
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['DUE', 'PAID', 'LATE'], default: 'DUE' },
  paidAt: { type: Date },
  penalty: { type: Number, default: 0 },
  gracePeriod: { type: Number, default: 5 }, // days
  autoPayment: { type: Boolean, default: false }
});

const emiOrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  monthlyAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  schedule: [emiScheduleSchema],
  status: { type: String, enum: ['ONGOING', 'COMPLETED', 'CLOSED'], default: 'ONGOING' },
  autoPaymentMethod: { type: String }, // e.g., card token/UPI
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmiOrder', emiOrderSchema);
