const Order = require('../models/orderModel');
const catchAsync = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc    Get Stripe Checkout Session (Placeholder)
 * @route   POST /api/v1/payments/checkout-session/:orderId
 */
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the order
    const order = await Order.findById(req.params.orderId);
    if (!order) {
        return next(new AppError('No order found with that ID', 404));
    }

    // 2) Ensure user owns the order
    if (order.user.toString() !== req.user.id) {
        return next(new AppError('You are not authorized to pay for this order', 403));
    }

    /* 
    FUTURE STRIPE INTEGRATION:
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/order-success?orderId=${order._id}`,
        cancel_url: `${req.protocol}://${req.get('host')}/cart`,
        customer_email: req.user.email,
        client_reference_id: req.params.orderId,
        line_items: order.orderItems.map(item => ({
            price_data: {
                currency: 'usd',
                unit_amount: item.price * 100, // Stripe uses cents
                product_data: {
                    name: `${item.name} (${item.size})`,
                    images: [item.image],
                },
            },
            quantity: item.quantity,
        })),
        mode: 'payment',
    });
    */

    // Placeholder response
    res.status(200).json({
        status: 'success',
        message: 'Checkout session creation placeholder',
        data: {
            sessionUrl: 'https://checkout.stripe.com/pay/placeholder_session_id',
            orderId: order._id
        }
    });
});

/**
 * @desc    Handle Stripe Webhook (Placeholder)
 * @route   POST /api/v1/payments/webhook
 */
exports.webhookCheckout = catchAsync(async (req, res, next) => {
    // Stripe webhooks require the raw body to verify the signature
    const signature = req.headers['stripe-signature'];

    console.log('Webhook received! Signature:', signature);

    /* 
    FUTURE STRIPE INTEGRATION:
    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body, // Raw body
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.client_reference_id;
        
        // Update order status to PAID
        await Order.findByIdAndUpdate(orderId, {
            isPaid: true,
            paidAt: Date.now(),
            orderStatus: 'paid',
            paymentStatus: 'completed'
        });
    }
    */

    res.status(200).json({ received: true });
});
