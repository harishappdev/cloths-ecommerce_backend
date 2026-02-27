const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc    Get current user's cart
 * @route   GET /api/v1/cart
 */
exports.getCart = catchAsync(async (req, res, next) => {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart) {
        // Return empty cart if none exists
        return res.status(200).json({
            status: 'success',
            data: {
                cart: { items: [], totalPrice: 0 }
            }
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            cart
        }
    });
});

/**
 * @desc    Add item to cart
 * @route   POST /api/v1/cart/add
 */
exports.addToCart = catchAsync(async (req, res, next) => {
    const { productId, quantity, size, color } = req.body;

    // 1) Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('No product found with that ID', 404));
    }

    if (product.stock < quantity) {
        return next(new AppError(`Insufficient stock. Only ${product.stock} items left.`, 400));
    }

    // 2) Find user's cart or create one
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // 3) Check if item already exists in cart (with same size/color)
    const itemIndex = cart.items.findIndex(item =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (itemIndex > -1) {
        // Update existing item
        const newQuantity = cart.items[itemIndex].quantity + quantity;
        if (product.stock < newQuantity) {
            return next(new AppError(`Cannot add more. Total in cart would exceed stock (${product.stock}).`, 400));
        }
        cart.items[itemIndex].quantity = newQuantity;
        cart.items[itemIndex].price = product.price; // Update to latest price
    } else {
        // Add new item
        cart.items.push({
            product: productId,
            quantity,
            size,
            color,
            price: product.price
        });
    }

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
        status: 'success',
        data: {
            cart
        }
    });
});

/**
 * @desc    Update item quantity in cart
 * @route   PATCH /api/v1/cart/update
 */
exports.updateQuantity = catchAsync(async (req, res, next) => {
    const { productId, quantity, size, color } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return next(new AppError('Cart not found', 404));

    const itemIndex = cart.items.findIndex(item =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (itemIndex === -1) {
        return next(new AppError('Item not found in cart', 404));
    }

    // Check stock
    const product = await Product.findById(productId);
    if (product.stock < quantity) {
        return next(new AppError(`Only ${product.stock} items available in stock.`, 400));
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
        status: 'success',
        data: {
            cart
        }
    });
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/v1/cart/remove
 */
exports.removeItem = catchAsync(async (req, res, next) => {
    const { productId, size, color } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return next(new AppError('Cart not found', 404));

    cart.items = cart.items.filter(item =>
        !(item.product.toString() === productId && item.size === size && item.color === color)
    );

    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
        status: 'success',
        data: {
            cart
        }
    });
});

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/v1/cart/clear
 */
exports.clearCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
        cart.items = [];
        await cart.save();
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});
