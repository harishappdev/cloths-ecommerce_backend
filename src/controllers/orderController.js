const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc    Create new order from cart
 * @route   POST /api/v1/orders
 */
exports.createOrder = catchAsync(async (req, res, next) => {
    const { shippingAddress, paymentMethod } = req.body;

    // 1) Get user cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
        return next(new AppError('Your cart is empty', 400));
    }

    // 2) Validate stock and prepare order items
    const orderItems = [];
    for (const item of cart.items) {
        const product = await Product.findById(item.product._id);

        if (!product || product.stock < item.quantity) {
            return next(new AppError(`Product ${product ? product.name : 'Unknown'} is out of stock or insufficient quantity`, 400));
        }

        // Prepare snapshot
        orderItems.push({
            name: product.name,
            quantity: item.quantity,
            image: product.images[0],
            price: product.price, // Snapshot price
            size: item.size,
            color: item.color,
            product: product._id
        });

        // 3) Reduce stock
        product.stock -= item.quantity;
        await product.save({ validateBeforeSave: false });
    }

    // 4) Create order
    const order = await Order.create({
        user: req.user.id,
        orderItems,
        shippingAddress,
        paymentMethod,
        totalPrice: cart.totalPrice,
        isPaid: paymentMethod === 'Credit Card',
        paidAt: paymentMethod === 'Credit Card' ? Date.now() : undefined,
        paymentStatus: paymentMethod === 'Credit Card' ? 'completed' : 'pending',
        orderStatus: paymentMethod === 'Credit Card' ? 'paid' : 'pending'
    });

    // 5) Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
        status: 'success',
        data: {
            order
        }
    });
});

/**
 * @desc    Get order by ID
 * @route   GET /api/v1/orders/:id
 */
exports.getOrder = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
        return next(new AppError('No order found with that ID', 404));
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('You are not authorized to view this order', 403));
    }

    res.status(200).json({
        status: 'success',
        data: {
            order
        }
    });
});

/**
 * @desc    Get logged in user orders
 * @route   GET /api/v1/orders/myorders
 */
exports.getMyOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: {
            orders
        }
    });
});

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/v1/orders
 */
exports.getAllOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find().sort('-createdAt').populate('user', 'name email');

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: {
            orders
        }
    });
});

/**
 * @desc    Update order status (Admin only)
 * @route   PATCH /api/v1/orders/:id/status
 */
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
    const { orderStatus, paymentStatus, isPaid, isDelivered } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError('No order found with that ID', 404));
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    if (isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
    }

    if (isDelivered) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
    }

    await order.save();

    res.status(200).json({
        status: 'success',
        data: {
            order
        }
    });
});
