const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc    Middleware to protect routes (Authentication)
 */
exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 2) Verification token
    let decoded;
    try {
        decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        return next(new AppError('Invalid token. Please log in again!', 401));
    }

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        console.error('User lookup failed for ID:', decoded.id);
        return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again.', 401));
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});

/**
 * @desc    Middleware for Role-Based Access Control (Authorization)
 */
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin', 'manager']. role='user'
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
