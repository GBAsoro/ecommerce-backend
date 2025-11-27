const Paystack = require('paystack');
const logger = require('../config/logger');

// Initialize Paystack with secret key
const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);

/**
 * Initialize a payment transaction
 * @param {Object} params - Payment parameters
 * @param {string} params.email - Customer email
 * @param {number} params.amount - Amount in kobo (for NGN) or lowest currency unit
 * @param {string} params.reference - Unique transaction reference
 * @param {string} params.currency - Currency code (NGN, GHS, ZAR, USD)
 * @param {Object} params.metadata - Additional metadata
 * @param {string} params.callback_url - URL to redirect after payment
 * @returns {Promise<Object>} Paystack response
 */
exports.initializeTransaction = async ({
  email,
  amount,
  reference,
  currency = 'NGN',
  metadata = {},
  callback_url,
}) => {
  try {
    const response = await paystack.transaction.initialize({
      email,
      amount: Math.round(amount * 100), // Convert to kobo/pesewas/cents
      reference,
      currency,
      metadata,
      callback_url,
    });

    logger.info(`Payment initialized: ${reference}`);
    return response;
  } catch (error) {
    logger.error(`Paystack initialization error: ${error.message}`);
    throw new Error(`Payment initialization failed: ${error.message}`);
  }
};

/**
 * Verify a transaction
 * @param {string} reference - Transaction reference
 * @returns {Promise<Object>} Transaction details
 */
exports.verifyTransaction = async (reference) => {
  try {
    const response = await paystack.transaction.verify(reference);

    logger.info(`Payment verified: ${reference} - Status: ${response.data.status}`);
    return response;
  } catch (error) {
    logger.error(`Paystack verification error: ${error.message}`);
    throw new Error(`Payment verification failed: ${error.message}`);
  }
};

/**
 * Fetch transaction details
 * @param {string} reference - Transaction reference
 * @returns {Promise<Object>} Transaction details
 */
exports.fetchTransaction = async (reference) => {
  try {
    const response = await paystack.transaction.get(reference);
    return response;
  } catch (error) {
    logger.error(`Paystack fetch transaction error: ${error.message}`);
    throw new Error(`Failed to fetch transaction: ${error.message}`);
  }
};

/**
 * List transactions
 * @param {Object} params - Query parameters
 * @param {number} params.perPage - Records per page
 * @param {number} params.page - Page number
 * @param {string} params.status - Transaction status filter
 * @param {string} params.customer - Customer ID filter
 * @returns {Promise<Object>} List of transactions
 */
exports.listTransactions = async (params = {}) => {
  try {
    const response = await paystack.transaction.list(params);
    return response;
  } catch (error) {
    logger.error(`Paystack list transactions error: ${error.message}`);
    throw new Error(`Failed to list transactions: ${error.message}`);
  }
};

/**
 * Validate webhook signature
 * @param {string} signature - Signature from webhook header
 * @param {Object} body - Webhook body
 * @returns {boolean} Whether signature is valid
 */
exports.validateWebhookSignature = (signature, body) => {
  const crypto = require('crypto');
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;
  
  const hash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(body))
    .digest('hex');

  return hash === signature;
};

/**
 * Get transaction timeline
 * @param {string} reference - Transaction reference
 * @returns {Promise<Object>} Transaction timeline
 */
exports.getTransactionTimeline = async (reference) => {
  try {
    const response = await paystack.transaction.timeline(reference);
    return response;
  } catch (error) {
    logger.error(`Paystack timeline error: ${error.message}`);
    throw new Error(`Failed to get transaction timeline: ${error.message}`);
  }
};

/**
 * Calculate Paystack fees
 * @param {number} amount - Amount in main currency unit
 * @param {string} currency - Currency code
 * @returns {Object} Breakdown of amount and fees
 */
exports.calculateFees = (amount, currency = 'NGN') => {
  // Paystack fee structure (as of 2024)
  // Nigeria: 1.5% capped at NGN 2,000
  // Ghana: 1.95% (no cap)
  // South Africa: 2.9% (no cap)
  // International: 3.9% + $0.50

  let feePercentage;
  let feeCap = null;
  let flatFee = 0;

  switch (currency) {
    case 'NGN':
      feePercentage = 0.015; // 1.5%
      feeCap = 2000; // NGN 2,000
      break;
    case 'GHS':
      feePercentage = 0.0195; // 1.95%
      break;
    case 'ZAR':
      feePercentage = 0.029; // 2.9%
      break;
    case 'USD':
      feePercentage = 0.039; // 3.9%
      flatFee = 0.5; // $0.50
      break;
    default:
      feePercentage = 0.015;
  }

  let fee = amount * feePercentage + flatFee;
  
  if (feeCap && fee > feeCap) {
    fee = feeCap;
  }

  return {
    amount,
    fee: Math.round(fee * 100) / 100, // Round to 2 decimal places
    total: Math.round((amount + fee) * 100) / 100,
    currency,
  };
};

/**
 * Convert amount to kobo/pesewas/cents
 * @param {number} amount - Amount in main currency unit
 * @returns {number} Amount in smallest currency unit
 */
exports.toKobo = (amount) => {
  return Math.round(amount * 100);
};

/**
 * Convert amount from kobo/pesewas/cents to main unit
 * @param {number} amount - Amount in smallest currency unit
 * @returns {number} Amount in main currency unit
 */
exports.fromKobo = (amount) => {
  return amount / 100;
};

module.exports = exports;
