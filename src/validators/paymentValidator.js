const Joi = require('joi');

/**
 * Validate payment initialization
 */
exports.validateInitializePayment = (req, res, next) => {
  const schema = Joi.object({
    orderId: Joi.string()
      .required()
      .regex(/^[0-9a-fA-F]{24}$/)
      .messages({
        'string.pattern.base': 'Invalid order ID format',
        'any.required': 'Order ID is required',
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Valid email is required',
        'any.required': 'Email is required',
      }),
    currency: Joi.string()
      .valid('NGN', 'GHS', 'ZAR', 'USD')
      .default('NGN')
      .messages({
        'any.only': 'Currency must be one of NGN, GHS, ZAR, or USD',
      }),
    metadata: Joi.object().optional(),
    callback_url: Joi.string().uri().optional(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message,
    });
  }

  req.validatedData = value;
  next();
};

/**
 * Validate payment verification
 */
exports.validateVerifyPayment = (req, res, next) => {
  const schema = Joi.object({
    reference: Joi.string()
      .required()
      .min(10)
      .max(100)
      .messages({
        'any.required': 'Payment reference is required',
        'string.min': 'Invalid reference format',
        'string.max': 'Invalid reference format',
      }),
  });

  const { error, value } = schema.validate({ reference: req.params.reference });

  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message,
    });
  }

  req.validatedData = value;
  next();
};

/**
 * Validate webhook payload
 */
exports.validateWebhook = (req, res, next) => {
  const schema = Joi.object({
    event: Joi.string().required(),
    data: Joi.object().required(),
  }).unknown(true); // Allow additional fields

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid webhook payload',
    });
  }

  next();
};

/**
 * Validate payment query parameters
 */
exports.validatePaymentQuery = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string()
      .valid('pending', 'success', 'failed', 'abandoned')
      .optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
  });

  const { error, value } = schema.validate(req.query);

  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message,
    });
  }

  req.validatedQuery = value;
  next();
};
