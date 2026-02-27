const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc    Generate JWT Access Token
 */
const signAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

/**
 * @desc    Generate JWT Refresh Token
 */
const signRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
    });
};

/**
 * @desc    Create and send tokens in response
 */
const createSendToken = (user, statusCode, res) => {
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_REFRESH_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token: accessToken,
        accessToken, // Keep for compatibility
        data: {
            user
        }
    });
};

/**
 * @desc    Register new user
 */
exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
    });

    createSendToken(newUser, 201, res);
});

/**
 * @desc    Login user
 */
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, res);
});

/**
 * @desc    Refresh Access Token
 */
exports.refresh = catchAsync(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return next(new AppError('No refresh token provided', 401));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    const accessToken = signAccessToken(currentUser._id);

    res.status(200).json({
        status: 'success',
        accessToken
    });
});

/**
 * @desc    Logout user
 */
exports.logout = (req, res) => {
    res.cookie('refreshToken', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
};

/**
 * @desc    Forgot Password - Send 6-digit OTP
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address.', 404));
    }

    // 2) Generate the random 6-digit OTP
    const otp = user.createPasswordResetOTP();
    await user.save({ validateBeforeSave: false });

    // 3) Log the OTP for development
    console.log('--- PASSWORD RESET OTP ---');
    console.log(`Email: ${req.body.email}`);
    console.log(`OTP: ${otp}`);
    console.log('--------------------------');

    res.status(200).json({
        status: 'success',
        message: 'OTP sent to email!'
    });
});

/**
 * @desc    Reset Password using OTP
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get hashed OTP from body
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
        return next(new AppError('Please provide email, OTP, and new password', 400));
    }

    const hashedOTP = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    // 2) Find user by email and valid OTP
    const user = await User.findOne({
        email,
        passwordResetOTP: hashedOTP,
        passwordResetOTPExpires: { $gt: Date.now() }
    });

    // 3) If OTP is invalid or expired
    if (!user) {
        return next(new AppError('OTP is invalid or has expired', 400));
    }

    // 4) Set new password and clear OTP fields
    user.password = password;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    await user.save();

    // 5) Log the user in, send JWT
    createSendToken(user, 200, res);
});
