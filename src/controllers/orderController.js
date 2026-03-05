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
            image: (product.images && product.images.length > 0)
                ? product.images[0]
                : 'https://via.placeholder.com/600x800?text=No+Image',
            price: product.price, // Snapshot price
            size: item.size,
            color: item.color,
            product: product._id
        });

        // 3) Reduce stock
        product.stock -= item.quantity;
        await product.save({ validateBeforeSave: false });
    }

    // 4) Calculate Prices (Discounts, Tax, Shipping)
    const Coupon = require('../models/couponModel');
    const { couponCode, deliveryOption } = req.body;
    let discountAmount = 0;
    let subtotal = cart.totalPrice;

    if (couponCode) {
        const coupon = await Coupon.findOne({
            code: couponCode.toUpperCase(),
            isActive: true,
            expiryDate: { $gt: Date.now() },
            $expr: { $lt: ['$usageCount', '$usageLimit'] }
        });

        if (coupon && subtotal >= coupon.minCartValue) {
            if (coupon.discountType === 'percentage') {
                discountAmount = (subtotal * coupon.discount) / 100;
            } else {
                discountAmount = coupon.discount;
            }

            // Increment usage
            coupon.usageCount += 1;
            await coupon.save();
        }
    }

    const shippingPrice = deliveryOption === 'express' ? 1500 : 0; // Matching frontend logic (Express: ₹1500, Standard: ₹0)
    const taxPrice = (subtotal - discountAmount) * 0.08; // 8% tax on discounted amount
    const totalPrice = subtotal - discountAmount + shippingPrice + taxPrice;

    // 5) Create order
    const order = await Order.create({
        user: req.user.id,
        orderItems,
        shippingAddress,
        paymentMethod,
        subtotal,
        taxPrice,
        shippingPrice,
        discountAmount,
        couponCode: couponCode ? couponCode.toUpperCase() : undefined,
        totalPrice,
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
/**
 * @desc    Cancel order
 * @route   PATCH /api/v1/orders/:id/cancel
 */
exports.cancelOrder = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError('No order found with that ID', 404));
    }

    // Check ownership
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('You are not authorized to cancel this order', 403));
    }

    // Check status
    if (!['pending', 'paid'].includes(order.orderStatus)) {
        return next(new AppError(`You cannot cancel an order that is already ${order.orderStatus}`, 400));
    }

    order.orderStatus = 'cancelled';
    await order.save();

    // Restore stock
    for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
            product.stock += item.quantity;
            await product.save({ validateBeforeSave: false });
        }
    }

    res.status(200).json({
        status: 'success',
        data: {
            order
        }
    });
});

/**
 * @desc    Request return
 * @route   PATCH /api/v1/orders/:id/return
 */
exports.requestReturn = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError('No order found with that ID', 404));
    }

    if (order.user.toString() !== req.user.id) {
        return next(new AppError('You are not authorized to request return for this order', 403));
    }

    if (order.orderStatus !== 'delivered') {
        return next(new AppError('You can only return delivered orders', 400));
    }

    // Set status to return_requested
    order.orderStatus = 'return_requested';
    await order.save();

    res.status(200).json({
        status: 'success',
        message: 'Return request submitted successfully',
        data: {
            order
        }
    });
});

/**
 * @desc    Process return (Admin only)
 * @route   PATCH /api/v1/orders/:id/process-return
 */
exports.processReturn = catchAsync(async (req, res, next) => {
    const { status } = req.body; // 'returned' (approved) or 'delivered' (rejected)

    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new AppError('No order found with that ID', 404));
    }

    if (order.orderStatus !== 'return_requested') {
        return next(new AppError('Order is not in a return requested state', 400));
    }

    if (!['returned', 'delivered'].includes(status)) {
        return next(new AppError('Invalid return process status', 400));
    }

    order.orderStatus = status;
    await order.save();

    // If approved (returned), restore stock
    if (status === 'returned') {
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock += item.quantity;
                await product.save({ validateBeforeSave: false });
            }
        }
    }

    res.status(200).json({
        status: 'success',
        data: {
            order
        }
    });
});
