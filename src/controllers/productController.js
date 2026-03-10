const Product = require('../models/productModel');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc    Get all products
 * @route   GET /api/v1/products
 */
exports.getAllProducts = catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    const features = new APIFeatures(Product.find(), req.query)
        .filter()
        .search()
        .sort()
        .limitFields()
        .paginate();

    const products = await features.query;

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: products.length,
        data: {
            products
        }
    });
});

/**
 * @desc    Get single product
 * @route   GET /api/v1/products/:id
 */
exports.getProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new AppError('No product found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    });
});

/**
 * @desc    Create new product (Admin Only)
 * @route   POST /api/v1/products
 */
exports.createProduct = catchAsync(async (req, res, next) => {
    // Set createdBy to current admin user
    if (!req.user) return next(new AppError('Authentication required', 401));
    req.body.createdBy = req.user.id;

    // Handle images if uploaded via multer
    if (req.files && req.files.length > 0) {
        req.body.images = req.files.map(file => `/img/products/${file.filename}`);
        console.log('Saved images paths:', req.body.images);
    }

    // Ensure sizes and colors are arrays if they come as strings (single select)
    if (req.body.sizes && typeof req.body.sizes === 'string') {
        req.body.sizes = [req.body.sizes];
    }
    if (req.body.colors && typeof req.body.colors === 'string') {
        req.body.colors = [req.body.colors];
    }

    const newProduct = await Product.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            product: newProduct
        }
    });
});

/**
 * @desc    Update product (Admin Only)
 * @route   PATCH /api/v1/products/:id
 */
exports.updateProduct = catchAsync(async (req, res, next) => {
    // Handle images if uploaded via multer
    // Handle images if uploaded via multer
    if (req.files && req.files.length > 0) {
        req.body.images = req.files.map(file => `/img/products/${file.filename}`);
    }

    // Ensure sizes and colors are arrays if they come as strings
    if (req.body.sizes && typeof req.body.sizes === 'string') {
        req.body.sizes = [req.body.sizes];
    }
    if (req.body.colors && typeof req.body.colors === 'string') {
        req.body.colors = [req.body.colors];
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!product) {
        return next(new AppError('No product found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    });
});

/**
 * @desc    Delete product (Admin Only)
 * @route   DELETE /api/v1/products/:id
 */
exports.deleteProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
        return next(new AppError('No product found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});
/**
 * @desc    Get product by slug
 * @route   GET /api/v1/products/slug/:slug
 */
exports.getProductBySlug = catchAsync(async (req, res, next) => {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
        return next(new AppError('No product found with that slug', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    });
});

/**
 * @desc    Get unique filter options
 * @route   GET /api/v1/products/filters
 */
exports.getFilterOptions = catchAsync(async (req, res, next) => {
    const categories = await Product.distinct('category');
    const brands = await Product.distinct('brand');
    const colors = await Product.distinct('colors');
    const fabric = await Product.distinct('fabric');
    const sizes = await Product.distinct('sizes');
    const occasion = await Product.distinct('occasion');

    res.status(200).json({
        status: 'success',
        data: {
            categories,
            brands,
            colors,
            fabric,
            sizes,
            occasion
        }
    });
});
