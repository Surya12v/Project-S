const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');
const productController = require('../controllers/productController');

// Public routes
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProduct);

// Admin routes
const adminRouter = express.Router();
router.use('/admin', isAdmin, adminRouter);

adminRouter.get('/products', productController.getAllProducts);
adminRouter.post('/products', productController.createProduct);
adminRouter.post('/products/bulk', productController.bulkImport);
adminRouter.put('/products/:id', productController.updateProduct);
adminRouter.delete('/products/:id', productController.deleteProduct);

module.exports = router;
