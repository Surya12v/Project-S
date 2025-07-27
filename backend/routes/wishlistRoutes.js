const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/authMiddleware');
const wishlistController = require('../controllers/wishlistController');

router.get('/', isAuthenticated, wishlistController.getWishlist);
router.post('/add', isAuthenticated, wishlistController.addToWishlist);
router.post('/remove', isAuthenticated, wishlistController.removeFromWishlist);

module.exports = router;


