const Product = require('../models/productModel');
const catchAsync = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc    Add or remove stock based on barcode
 * @route   POST /api/v1/inventory/update
 */
exports.updateInventory = catchAsync(async (req, res, next) => {
    const { barcode, action, quantity } = req.body;

    if (!barcode || !action || quantity === undefined) {
        return next(new AppError('Please provide barcode, action, and quantity', 400));
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
        return next(new AppError('Quantity must be a positive number', 400));
    }

    const product = await Product.findOne({ barcode });

    if (!product) {
        return next(new AppError('No product found with that barcode', 404));
    }

    if (action === 'add') {
        product.stock += qty;
    } else if (action === 'remove') {
        if (product.stock < qty) {
            return next(new AppError('Insufficient stock to remove', 400));
        }
        product.stock -= qty;
    } else {
        return next(new AppError('Invalid action. Use "add" or "remove"', 400));
    }

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    });
});
