const Coupon = require('../models/couponModel');
const catchAsync = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc    Get all coupons (Admin only)
 */
exports.getAllCoupons = catchAsync(async (req, res, next) => {
    const coupons = await Coupon.find().sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: coupons.length,
        data: {
            coupons
        }
    });
});

/**
 * @desc    Create new coupon (Admin only)
 */
exports.createCoupon = catchAsync(async (req, res, next) => {
    const coupon = await Coupon.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            coupon
        }
    });
});

/**
 * @desc    Validate coupon and get discount
 */
exports.validateCoupon = catchAsync(async (req, res, next) => {
    const { code, cartTotal } = req.body;

    const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        expiryDate: { $gt: Date.now() },
        $expr: { $lt: ['$usageCount', '$usageLimit'] }
    });

    if (!coupon) {
        return next(new AppError('Invalid or expired coupon code', 404));
    }

    if (cartTotal < coupon.minCartValue) {
        return next(new AppError(`Minimum cart value for this coupon is ₹${coupon.minCartValue}`, 400));
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
        discountAmount = (cartTotal * coupon.discount) / 100;
    } else {
        discountAmount = coupon.discount;
    }

    res.status(200).json({
        status: 'success',
        data: {
            code: coupon.code,
            discountAmount,
            discountType: coupon.discountType,
            discount: coupon.discount
        }
    });
});

/**
 * @desc    Delete coupon (Admin only)
 */
exports.deleteCoupon = catchAsync(async (req, res, next) => {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
        return next(new AppError('No coupon found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});
