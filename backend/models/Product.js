const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  // Required base fields
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  
  // Basic fields with defaults
  isActive: { type: Boolean, default: true },
  stockQuantity: { type: Number, default: 0 },
  
  // Dynamic fields storage
  attributes: { type: Map, of: Schema.Types.Mixed },
  specifications: { type: Map, of: Schema.Types.Mixed },
  metadata: { type: Map, of: Schema.Types.Mixed },
  
  // Custom fields container
  customFields: { type: Map, of: Schema.Types.Mixed },
  
  // Schema version for migrations
  schemaVersion: { type: Number, default: 1 }
}, {
  timestamps: true,
  strict: false, // Allow fields not specified in schema
  storeSubdocValidationError: false // Flexible validation
});

// Index for common queries
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ 'attributes.category': 1 });
productSchema.index({ 'attributes.brand': 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stockQuantity: 1 });
productSchema.index({ createdAt: -1 });

// Method to add custom fields
productSchema.methods.addCustomField = function(key, value) {
  if (!this.customFields) {
    this.customFields = new Map();
  }
  this.customFields.set(key, value);
};

// Static method to add new attribute to schema
productSchema.statics.addAttribute = function(attributeName, attributeType = Schema.Types.Mixed) {
  if (!this.schema.path(`attributes.${attributeName}`)) {
    this.schema.add({
      attributes: {
        [attributeName]: attributeType
      }
    });
  }
};

module.exports = mongoose.model('Product', productSchema);
