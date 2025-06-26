const Product = require('../models/Product');
const logger = require('../utils/logger');

// Define all functions without exports.
const bulkImport = async (req, res) => {
  try {
    if (!req.body || (Array.isArray(req.body) && req.body.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'No products provided for import'
      });
    }

    const products = Array.isArray(req.body) ? req.body : [req.body];

    // Validate required fields
    const invalidProducts = products.filter(p => 
      !p.name || !p.sku || !p.price || !p.category
    );

    if (invalidProducts.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields in some products',
        invalidProducts: invalidProducts.map(p => p.sku || 'unknown')
      });
    }

    const result = await Product.insertMany(products, {
      ordered: false,
      rawResult: true
    });

    res.status(201).json({
      success: true,
      message: `Successfully imported ${result.insertedCount} products`,
      insertedIds: result.insertedIds
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error importing products',
      details: error.writeErrors || []
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    logger.error('Get all products error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
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
    const products = await Product.find({ 'flags.isActive': true })
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
