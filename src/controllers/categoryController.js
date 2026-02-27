const Category = require('../models/categoryModel');
const catchAsync = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc    Get all categories
 * @route   GET /api/v1/categories
 */
exports.getAllCategories = catchAsync(async (req, res, next) => {
    const categories = await Category.find();

    res.status(200).json({
        status: 'success',
        results: categories.length,
        data: {
            categories
        }
    });
});

/**
 * @desc    Create new category (Admin Only)
 * @route   POST /api/v1/categories
 */
exports.createCategory = catchAsync(async (req, res, next) => {
    const newCategory = await Category.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            category: newCategory
        }
    });
});

/**
 * @desc    Update category (Admin Only)
 * @route   PATCH /api/v1/categories/:id
 */
exports.updateCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!category) {
        return next(new AppError('No category found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            category
        }
    });
});

/**
 * @desc    Delete category (Admin Only)
 * @route   DELETE /api/v1/categories/:id
 */
exports.deleteCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
        return next(new AppError('No category found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});
