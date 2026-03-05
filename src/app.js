const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const mongoSanitize = require('express-mongo-sanitize');

const hpp = require('hpp');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middlewares/errorMiddleware');

const app = express();

// 1) GLOBAL MIDDLEWARES
// Implement CORS - Explicitly allow frontend origin for credentials compatibility
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
    ],
    credentials: true
}));

// Set security HTTP headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Cookie parser
app.use(cookieParser());

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Stricter limiter for Auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Increased for development
    message: 'Too many login/signup attempts from this IP, please try again after 15 minutes'
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/signup', authLimiter);

// Stricter limiter for Orders
const orderLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 10, // Limit each IP to 10 orders per hour
    message: 'Too many orders created from this IP, please try again in an hour'
});
app.post('/api/v1/orders', orderLimiter);

// STRIPE WEBHOOK: Must be before express.json() to get raw body
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Serve static files
const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));

// Data sanitization - Custom implementation for Express 5.0 compatibility
// (express-mongo-sanitize crashes when trying to write to the read-only req.query getter)
app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.params) mongoSanitize.sanitize(req.params);
    next();
});



// Prevent parameter pollution
app.use(hpp({
    whitelist: [
        'price',
        'ratings',
        'category',
        'sizes',
        'colors',
        'fabric',
        'occasion'
    ]
}));

// 2) ROUTES
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const cartRouter = require('./routes/cartRoutes');
const orderRouter = require('./routes/orderRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const adminRouter = require('./routes/adminRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const couponRouter = require('./routes/couponRoutes');

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/coupons', couponRouter);

// Handle undefined routes - Catch-all middleware
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 3) GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
