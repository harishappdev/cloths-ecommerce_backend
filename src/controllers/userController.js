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

/**
 * @desc    Update current user profile
 * @route   PATCH /api/v1/users/updateMe
 * @access  Private
 */
exports.updateMe = asyncHandler(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password updates. Please use /updateMyPassword.',
                400
            )
        );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = {};
    const allowedFields = ['name', 'email'];
    Object.keys(req.body).forEach((el) => {
        if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
    });

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

/**
 * @desc    Get all user addresses
 * @route   GET /api/v1/users/addresses
 */
exports.getAddresses = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        status: 'success',
        data: {
            addresses: user.addresses
        }
    });
});

/**
 * @desc    Add new address
 * @route   POST /api/v1/users/addresses
 */
exports.addAddress = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    // If isDefault is true, set others to false
    if (req.body.isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
    } else if (user.addresses.length === 0) {
        req.body.isDefault = true;
    }

    user.addresses.push(req.body);
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
        status: 'success',
        data: {
            addresses: user.addresses
        }
    });
});

/**
 * @desc    Update address
 * @route   PATCH /api/v1/users/addresses/:id
 */
exports.updateAddress = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
        return next(new AppError('No address found with that ID', 404));
    }

    // Handle isDefault logic
    if (req.body.isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
    }

    Object.assign(address, req.body);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        data: {
            addresses: user.addresses
        }
    });
});

/**
 * @desc    Remove address
 * @route   DELETE /api/v1/users/addresses/:id
 */
exports.removeAddress = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);

    // If we removed a default address, make another one default if available
    if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault)) {
        user.addresses[0].isDefault = true;
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        data: {
            addresses: user.addresses
        }
    });
});
