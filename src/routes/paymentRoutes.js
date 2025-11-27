const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/auth');
const {
  validateInitializePayment,
  validateVerifyPayment,
  validateWebhook,
  validatePaymentQuery,
} = require('../validators/paymentValidator');

// Webhook route (public, but signature verified)
router.post('/webhook', validateWebhook, paymentController.handleWebhook);

// All other routes require authentication
router.use(protect);

// User routes
router.post(
  '/initialize',
  validateInitializePayment,
  paymentController.initializePayment
);

router.get(
  '/verify/:reference',
  validateVerifyPayment,
  paymentController.verifyPayment
);

router.get(
  '/history',
  validatePaymentQuery,
  paymentController.getPaymentHistory
);

router.get('/:reference', paymentController.getPaymentByReference);

// Admin only routes
router.get(
  '/admin/all',
  restrictTo('admin'),
  validatePaymentQuery,
  paymentController.getAllPayments
);

module.exports = router;
