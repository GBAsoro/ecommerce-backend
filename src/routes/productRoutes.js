const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { createProductSchema, updateProductSchema } = require('../validators/productValidator');

// Public routes
router.get('/featured', productController.getFeaturedProducts);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Admin only routes
router.post('/', protect, restrictTo('admin'), validate(createProductSchema), productController.createProduct);
router.put('/:id', protect, restrictTo('admin'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', protect, restrictTo('admin'), productController.deleteProduct);

module.exports = router;
