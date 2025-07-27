const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String }, // EMI, ORDER, PAYMENT, PRODUCT, etc.
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String }, // URL to redirect
  read: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
