const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../utils/multerConfig');

const router = express.Router();

// Public Routes
router.get('/', productController.getAllProducts);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/filters', productController.getFilterOptions);
router.get('/:id', productController.getProduct);

// Admin Only Routes - Protected
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

router.post(
    '/',
    upload.array('images', 5),
    [
        body('name').notEmpty().withMessage('Product name is required'),
        body('price').isNumeric().withMessage('Price must be a number'),
        body('description').notEmpty().withMessage('Description is required'),
        body('category').notEmpty().withMessage('Category is required'),
        body('stock').isNumeric().withMessage('Stock must be a number')
    ],
    productController.createProduct
);

router
    .route('/:id')
    .patch(upload.array('images', 5), productController.updateProduct)
    .delete(productController.deleteProduct);

module.exports = router;
