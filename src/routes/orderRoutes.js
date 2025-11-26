const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// User routes
router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/pay', orderController.updateOrderToPaid);
router.put('/:id/cancel', orderController.cancelOrder);

// Admin only routes
router.get('/all/orders', restrictTo('admin'), orderController.getAllOrders);
router.put('/:id/status', restrictTo('admin'), orderController.updateOrderStatus);

module.exports = router;
