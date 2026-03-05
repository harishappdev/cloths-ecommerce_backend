const User = require('../models/userModel');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc    Toggle product in wishlist
 * @route   PATCH /api/v1/users/wishlist
 * @access  Private
 */
exports.toggleWishlist = asyncHandler(async (req, res, next) => {
    const { productId } = req.body;

    if (!productId) {
        return next(new AppError('Please provide a product ID', 400));
    }

    const user = await User.findById(req.user.id);

    const isWishlisted = user.wishlist.includes(productId);

    if (isWishlisted) {
        // Remove from wishlist
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());
    } else {
        // Add to wishlist
        user.wishlist.push(productId);
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        data: {
            wishlist: user.wishlist
        }
    });
});

/**
 * @desc    Get user wishlist
 * @route   GET /api/v1/users/wishlist
 * @access  Private
 */
exports.getWishlist = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate({
        path: 'wishlist',
        select: 'name price discountPrice images slug category brand ratings numReviews'
    });

    res.status(200).json({
        status: 'success',
        data: {
            wishlist: user.wishlist
        }
    });
});
