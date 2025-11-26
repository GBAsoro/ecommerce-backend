const Joi = require('joi');

// Create product validation schema
exports.createProductSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(3).max(100).required().messages({
      'string.empty': 'Product name is required',
      'string.min': 'Product name must be at least 3 characters',
      'string.max': 'Product name cannot exceed 100 characters',
    }),
    description: Joi.string().trim().min(10).max(2000).required().messages({
      'string.empty': 'Product description is required',
      'string.min': 'Description must be at least 10 characters',
      'string.max': 'Description cannot exceed 2000 characters',
    }),
    price: Joi.number().min(0).required().messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required',
    }),
    comparePrice: Joi.number().min(0).optional(),
    category: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.pattern.base': 'Invalid category ID',
      'any.required': 'Category is required',
    }),
    images: Joi.array().items(Joi.string().uri()).optional(),
    stock: Joi.number().integer().min(0).default(0),
    sku: Joi.string().trim().optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    isFeatured: Joi.boolean().optional(),
    specifications: Joi.object().optional(),
  }),
};

// Update product validation schema
exports.updateProductSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(3).max(100).optional(),
    description: Joi.string().trim().min(10).max(2000).optional(),
    price: Joi.number().min(0).optional(),
    comparePrice: Joi.number().min(0).optional(),
    category: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    stock: Joi.number().integer().min(0).optional(),
    sku: Joi.string().trim().optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    isFeatured: Joi.boolean().optional(),
    isActive: Joi.boolean().optional(),
    specifications: Joi.object().optional(),
  }),
};
