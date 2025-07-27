const Product = require('../models/Product');
const logger = require('../utils/logger');
const notificationController = require('./notificationController');
const User = require('../models/User');

// Define all functions without exports.
// ...existing code...
const bulkImport = async (req, res) => {
  try {
    console.log('--- BULK IMPORT START ---');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    if (!req.body || (Array.isArray(req.body) && req.body.length === 0)) {
      console.log('No products provided for import');
      return res.status(400).json({
        success: false,
        error: 'No products provided for import'
      });
    }

    const products = Array.isArray(req.body) ? req.body : [req.body];
    console.log(`Received ${products.length} products for bulk import`);
    console.log('Products:', JSON.stringify(products, null, 2));

    // Validate required fields
    const invalidProducts = products.filter(p => 
      !p.name || !p.sku || !p.price || !p.category
    );

    if (invalidProducts.length > 0) {
      console.log('Invalid products:', JSON.stringify(invalidProducts, null, 2));
      return res.status(400).json({
        success: false,
        error: 'Missing required fields in some products',
        invalidProducts: invalidProducts.map(p => p.sku || 'unknown')
      });
    }

    console.log('All products passed validation. Proceeding to insertMany...');
    const result = await Product.insertMany(products, {
      ordered: false,
      rawResult: true
    });

    console.log('InsertMany result:', JSON.stringify(result, null, 2));

    res.status(201).json({
      success: true,
      message: `Successfully imported ${result.insertedCount} products`,
      insertedIds: result.insertedIds
    });

    console.log('--- BULK IMPORT END ---');
  } catch (error) {
    console.error('Bulk import error:', error);
    if (error.writeErrors) {
      console.error('Write errors:', JSON.stringify(error.writeErrors, null, 2));
    }
    res.status(400).json({
      success: false,
      error: error.message || 'Error importing products',
      details: error.writeErrors || []
    });
  }
};
// ...existing code...

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    console.log(`Fetching all products...`);
    console.log(products);
    console.log(`Found ${products.length} products in database`);
    res.status(200).json(products);
  } catch (error) {
    logger.error('Get all products error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    // Notify all users about the new product
    const users = await User.find({});
    for (const user of users) {
      await notificationController.createNotification(
        user._id,
        'PRODUCT',
        'New Product Added',
        `Check out our new product: ${product.name}`,
        `/product/${product._id}`
      );
    }

    res.status(201).json(product);
  } catch (error) {
    logger.error('Create product error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    logger.error('Update product error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Delete product error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    console.log('Fetching products...');
    const products = await Product.find({ 'isActive': true })
      .select('-metadata -audit -mongoDB')
      .sort({ 'metadata.createdAt': -1 });
    
    console.log(`Found ${products.length} products`);
    
    if (!products.length) {
      console.log('No products found in database');
    }

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Single exports
module.exports = {
  getProducts,
  getProduct,
  getAllProducts,
  createProduct,
  bulkImport,
  updateProduct,
  deleteProduct
};
