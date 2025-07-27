const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id }).populate('products');
    res.json(wishlist ? wishlist.products : []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user._id, products: [productId] });
    } else if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
    }
    await wishlist.save();
    await wishlist.populate('products');
    res.json({ success: true, wishlist: wishlist.products });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        id => id.toString() !== productId
      );
      await wishlist.save();
      await wishlist.populate('products');
      res.json({ success: true, wishlist: wishlist.products });
    } else {
      res.json({ success: true, wishlist: [] });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
};
