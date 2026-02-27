const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');

const router = express.Router();

// Public Routes
router.get('/', categoryController.getAllCategories);

// Admin Only Routes - Protected
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

router.post(
    '/',
    [
        body('name').notEmpty().withMessage('Category name is required')
    ],
    validate,
    categoryController.createCategory
);

router
    .route('/:id')
    .patch(categoryController.updateCategory)
    .delete(categoryController.deleteCategory);

module.exports = router;
