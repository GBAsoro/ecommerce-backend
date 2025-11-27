const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      required: true,
      default: 'NGN',
      enum: ['NGN', 'GHS', 'ZAR', 'USD'],
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'success', 'failed', 'abandoned'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
    },
    channel: {
      type: String,
    },
    gatewayResponse: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
    paystackData: {
      id: Number,
      domain: String,
      status: String,
      reference: String,
      amount: Number,
      message: String,
      gateway_response: String,
      paid_at: String,
      created_at: String,
      channel: String,
      currency: String,
      ip_address: String,
      metadata: mongoose.Schema.Types.Mixed,
      fees: Number,
      customer: {
        id: Number,
        first_name: String,
        last_name: String,
        email: String,
        customer_code: String,
        phone: String,
        metadata: mongoose.Schema.Types.Mixed,
        risk_action: String,
      },
      authorization: {
        authorization_code: String,
        bin: String,
        last4: String,
        exp_month: String,
        exp_year: String,
        channel: String,
        card_type: String,
        bank: String,
        country_code: String,
        brand: String,
        reusable: Boolean,
        signature: String,
      },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// Virtual for authorization URL
paymentSchema.virtual('authorizationUrl').get(function () {
  return this.paystackData?.authorization_url || null;
});

// Method to check if payment is successful
paymentSchema.methods.isSuccessful = function () {
  return this.status === 'success';
};

// Method to check if payment is pending
paymentSchema.methods.isPending = function () {
  return this.status === 'pending';
};

// Method to check if payment has failed
paymentSchema.methods.hasFailed = function () {
  return this.status === 'failed' || this.status === 'abandoned';
};

module.exports = mongoose.model('Payment', paymentSchema);
