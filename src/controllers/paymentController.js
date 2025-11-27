const Payment = require('../models/Payment');
const Order = require('../models/Order');
const paystackService = require('../services/paystack');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../config/logger');

/**
 * @desc    Initialize payment for an order
 * @route   POST /api/payments/initialize
 * @access  Private
 */
exports.initializePayment = asyncHandler(async (req, res, next) => {
  const { orderId, email, currency, metadata, callback_url } = req.validatedData;

  // Find the order
  const order = await Order.findById(orderId);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Check if user owns the order
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to pay for this order', 403));
  }

  // Check if order is already paid
  if (order.isPaid) {
    return next(new AppError('Order is already paid', 400));
  }

  // Check if there's already a pending or successful payment for this order
  const existingPayment = await Payment.findOne({
    order: orderId,
    status: { $in: ['pending', 'success'] },
  });

  if (existingPayment) {
    if (existingPayment.status === 'success') {
      return next(new AppError('Payment already completed for this order', 400));
    }

    // Return existing pending payment
    return res.status(200).json({
      status: 'success',
      message: 'Payment already initialized',
      data: {
        payment: existingPayment,
        authorizationUrl: existingPayment.paystackData?.authorization_url,
        reference: existingPayment.reference,
      },
    });
  }

  // Generate unique reference
  const reference = `ORDER-${orderId}-${Date.now()}`;

  // Initialize payment with Paystack
  const paystackResponse = await paystackService.initializeTransaction({
    email: email || req.user.email,
    amount: order.totalPrice,
    reference,
    currency: currency || 'NGN',
    metadata: {
      orderId,
      userId: req.user._id.toString(),
      userName: req.user.name,
      ...metadata,
    },
    callback_url,
  });

  if (!paystackResponse.status) {
    return next(new AppError('Failed to initialize payment', 500));
  }

  // Create payment record
  const payment = await Payment.create({
    user: req.user._id,
    order: orderId,
    reference,
    amount: order.totalPrice,
    currency: currency || 'NGN',
    status: 'pending',
    paystackData: {
      ...paystackResponse.data,
      authorization_url: paystackResponse.data.authorization_url,
      access_code: paystackResponse.data.access_code,
    },
    metadata: {
      orderId,
      userId: req.user._id.toString(),
      ...metadata,
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'Payment initialized successfully',
    data: {
      payment,
      authorizationUrl: paystackResponse.data.authorization_url,
      accessCode: paystackResponse.data.access_code,
      reference,
    },
  });
});

/**
 * @desc    Verify payment
 * @route   GET /api/payments/verify/:reference
 * @access  Private
 */
exports.verifyPayment = asyncHandler(async (req, res, next) => {
  const { reference } = req.validatedData;

  // Find payment record
  const payment = await Payment.findOne({ reference }).populate('order');

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  // Check if user owns the payment
  if (payment.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to verify this payment', 403));
  }

  // If already verified as successful, return the payment
  if (payment.status === 'success') {
    return res.status(200).json({
      status: 'success',
      message: 'Payment already verified',
      data: {
        payment,
      },
    });
  }

  // Verify with Paystack
  const verificationResponse = await paystackService.verifyTransaction(reference);

  if (!verificationResponse.status) {
    return next(new AppError('Payment verification failed', 500));
  }

  const { data } = verificationResponse;

  // Update payment record
  payment.status = data.status === 'success' ? 'success' : 'failed';
  payment.paystackData = data;
  payment.gatewayResponse = data.gateway_response;
  payment.channel = data.channel;
  payment.paymentMethod = data.channel;

  if (data.status === 'success') {
    payment.paidAt = new Date(data.paid_at);

    // Update order
    const order = await Order.findById(payment.order);
    if (order) {
      order.isPaid = true;
      order.paidAt = new Date(data.paid_at);
      order.paymentMethod = 'paystack';
      order.paystackReference = reference;
      order.paymentResult = {
        id: data.id,
        status: data.status,
        updateTime: data.paid_at,
        emailAddress: data.customer?.email,
      };
      await order.save();
    }
  }

  await payment.save();

  res.status(200).json({
    status: 'success',
    message: `Payment ${payment.status}`,
    data: {
      payment,
    },
  });
});

/**
 * @desc    Handle Paystack webhook
 * @route   POST /api/payments/webhook
 * @access  Public (signature verified)
 */
exports.handleWebhook = asyncHandler(async (req, res, next) => {
  const signature = req.headers['x-paystack-signature'];

  // Validate webhook signature
  if (!paystackService.validateWebhookSignature(signature, req.body)) {
    logger.warn('Invalid webhook signature received');
    return next(new AppError('Invalid signature', 400));
  }

  const { event, data } = req.body;

  logger.info(`Webhook received: ${event} - Reference: ${data.reference}`);

  // Handle different webhook events
  switch (event) {
    case 'charge.success':
      await handleSuccessfulCharge(data);
      break;

    case 'charge.failed':
      await handleFailedCharge(data);
      break;

    case 'transfer.success':
    case 'transfer.failed':
      logger.info(`Transfer event received: ${event}`);
      break;

    default:
      logger.info(`Unhandled webhook event: ${event}`);
  }

  // Always respond with 200 to acknowledge receipt
  res.status(200).json({
    status: 'success',
    message: 'Webhook processed',
  });
});

/**
 * Handle successful charge webhook
 */
async function handleSuccessfulCharge(data) {
  const payment = await Payment.findOne({ reference: data.reference });

  if (!payment) {
    logger.warn(`Payment not found for reference: ${data.reference}`);
    return;
  }

  // Update payment
  payment.status = 'success';
  payment.paystackData = data;
  payment.gatewayResponse = data.gateway_response;
  payment.channel = data.channel;
  payment.paymentMethod = data.channel;
  payment.paidAt = new Date(data.paid_at);
  await payment.save();

  // Update order
  const order = await Order.findById(payment.order);
  if (order && !order.isPaid) {
    order.isPaid = true;
    order.paidAt = new Date(data.paid_at);
    order.paymentMethod = 'paystack';
    order.paystackReference = data.reference;
    order.paymentResult = {
      id: data.id,
      status: data.status,
      updateTime: data.paid_at,
      emailAddress: data.customer?.email,
    };
    await order.save();

    logger.info(`Order ${order._id} marked as paid via webhook`);
  }
}

/**
 * Handle failed charge webhook
 */
async function handleFailedCharge(data) {
  const payment = await Payment.findOne({ reference: data.reference });

  if (!payment) {
    logger.warn(`Payment not found for reference: ${data.reference}`);
    return;
  }

  payment.status = 'failed';
  payment.paystackData = data;
  payment.gatewayResponse = data.gateway_response;
  await payment.save();

  logger.info(`Payment ${payment._id} marked as failed via webhook`);
}

/**
 * @desc    Get payment history for user
 * @route   GET /api/payments/history
 * @access  Private
 */
exports.getPaymentHistory = asyncHandler(async (req, res, next) => {
  const { page, limit, status, startDate, endDate } = req.validatedQuery;

  const query = { user: req.user._id };

  if (status) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const payments = await Payment.find(query)
    .populate('order', 'orderItems totalPrice status')
    .sort('-createdAt')
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await Payment.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: payments.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: {
      payments,
    },
  });
});

/**
 * @desc    Get payment by reference
 * @route   GET /api/payments/:reference
 * @access  Private
 */
exports.getPaymentByReference = asyncHandler(async (req, res, next) => {
  const { reference } = req.params;

  const payment = await Payment.findOne({ reference })
    .populate('user', 'name email')
    .populate('order');

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  // Check if user owns the payment or is admin
  if (
    payment.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return next(new AppError('Not authorized to view this payment', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      payment,
    },
  });
});

/**
 * @desc    Get all payments (Admin only)
 * @route   GET /api/payments/admin/all
 * @access  Private/Admin
 */
exports.getAllPayments = asyncHandler(async (req, res, next) => {
  const { page, limit, status, startDate, endDate } = req.validatedQuery;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const payments = await Payment.find(query)
    .populate('user', 'name email')
    .populate('order', 'orderItems totalPrice status')
    .sort('-createdAt')
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await Payment.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: payments.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: {
      payments,
    },
  });
});
