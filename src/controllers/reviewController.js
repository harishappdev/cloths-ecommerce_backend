const Review = require('../models/reviewModel');
const catchAsync = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc    Get all reviews for a product
 * @route   GET /api/v1/reviews/product/:productId
 */
exports.getProductReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true });

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

/**
 * @desc    Create new review
 * @route   POST /api/v1/reviews
 */
exports.createReview = catchAsync(async (req, res, next) => {
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
        user: req.user.id,
        product: req.body.product
    });

    if (existingReview) {
        return next(new AppError('You have already reviewed this product', 400));
    }

    const review = await Review.create({
        ...req.body,
        user: req.user.id
    });

    res.status(201).json({
        status: 'success',
        data: {
            review
        }
    });
});

/**
 * @desc    Update review
 * @route   PATCH /api/v1/reviews/:id
 */
exports.updateReview = catchAsync(async (req, res, next) => {
    const review = await Review.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!review) {
        return next(new AppError('No review found with that ID or you are not authorized', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    });
});

/**
 * @desc    Delete review
 * @route   DELETE /api/v1/reviews/:id
 */
exports.deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!review) {
        return next(new AppError('No review found with that ID or you are not authorized', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

/**
 * @desc    Get all reviews (Admin only)
 * @route   GET /api/v1/reviews
 */
exports.getAllReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find()
        .populate('product', 'name')
        .populate('user', 'name')
        .sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

/**
 * @desc    Toggle review approval (Admin only)
 */
exports.toggleApproval = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new AppError('No review found with that ID', 404));
    }

    review.isApproved = !review.isApproved;
    await review.save();

    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    });
});
