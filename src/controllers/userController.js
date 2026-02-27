const User = require('../models/userModel');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Public
 */
exports.getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    });
});

/**
 * @desc    Create new user
 * @route   POST /api/v1/users
 * @access  Public
 */
exports.createUser = asyncHandler(async (req, res, next) => {
    const newUser = await User.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            user: newUser
        }
    });
});
/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: req.user
        }
    });
});
