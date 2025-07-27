const mongoose = require('mongoose');

const emiPaymentSchema = new mongoose.Schema({
  emiOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmiOrder', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduleIndex: { type: Number, required: true },
  amount: { type: Number, required: true },
  paidAt: { type: Date, default: Date.now },
  paymentDetails: { type: Object },
  status: { type: String, enum: ['SUCCESS', 'FAILED'], default: 'SUCCESS' },
  createdBy: { type: String, enum: ['user', 'admin', 'system'], default: 'user' }
}, { timestamps: true });

module.exports = mongoose.model('EmiPayment', emiPaymentSchema);
