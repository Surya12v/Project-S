const mongoose = require('mongoose');

const crudHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true }, // e.g. 'CREATE', 'UPDATE', 'DELETE', 'PAYMENT'
  entity: { type: String, required: true }, // e.g. 'Order', 'Product', 'EmiOrder', 'User'
  entityId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: Object },
  createdBy: { type: String, enum: ['user', 'admin', 'system'], default: 'user' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CrudHistory', crudHistorySchema);
