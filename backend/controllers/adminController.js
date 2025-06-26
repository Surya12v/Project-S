// ...existing imports...
const User = require('../models/User');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');

// Get all users with activity counts
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders'
        }
      },
      {
        $lookup: {
          from: 'carts',
          localField: '_id',
          foreignField: 'userId',
          as: 'cart'
        }
      },
      {
        $lookup: {
          from: 'wishlists',
          localField: '_id',
          foreignField: 'userId',
          as: 'wishlist'
        }
      },
      {
        $project: {
          _id: 1,
          email: 1,
          displayName: 1,
          image: 1,
          role: 1,
          isActive: 1,
          createdAt: 1,
          lastLogin: 1,
          orderCount: { $size: '$orders' },
          cartCount: { $size: '$cart' },
          wishlistCount: { $size: '$wishlist' }
        }
      }
    ]);

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get detailed user information
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's activity
    const [orders, cart, wishlist] = await Promise.all([
      Order.find({ userId: user._id }).populate('items.productId'),
      Cart.findOne({ userId: user._id }).populate('items.productId'),
      Wishlist.findOne({ userId: user._id }).populate('products')
    ]);

    // Calculate stats
    const totalSpent = orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0;

    res.json({
      user,
      activity: {
        orders,
        cart,
        wishlist,
        stats: {
          totalSpent,
          orderCount: orders?.length || 0,
          cartCount: cart?.items?.length || 0,
          wishlistCount: wishlist?.products?.length || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user status (active/inactive)
exports.updateUserStatus = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clean up user's data
    await Promise.all([
      Order.deleteMany({ userId: user._id }),
      Cart.deleteOne({ userId: user._id }),
      Wishlist.deleteOne({ userId: user._id })
    ]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ...existing controller functions...
