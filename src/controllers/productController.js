const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const APIFeatures = require('../utils/apiFeatures');

/**
 * @desc    Get all products with filtering, sorting, and pagination
 * @route   GET /api/products
 * @access  Public
 */
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  // Build query
  const features = new APIFeatures(Product.find({ isActive: true }), req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Execute query
  const products = await features.query.populate('category', 'name slug');

  // Get total count for pagination
  const total = await Product.countDocuments({ isActive: true });

  res.status(200).json({
    status: 'success',
    results: products.length,
    total,
    data: {
      products,
    },
  });
});

/**
 * @desc    Get single product by ID or slug
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProduct = asyncHandler(async (req, res, next) => {
  let product;

  // Check if parameter is MongoDB ObjectId or slug
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findById(req.params.id).populate('category', 'name slug');
  } else {
    product = await Product.findOne({ slug: req.params.id }).populate('category', 'name slug');
  }

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
exports.createProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      product,
    },
  });
});

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

/**
 * @desc    Delete product (soft delete)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Product deleted successfully',
  });
});

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
exports.getFeaturedProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .limit(10)
    .populate('category', 'name slug');

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});
