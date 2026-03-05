const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes
router.use(protect);

router.route('/')
    .get(restrictTo('admin'), reviewController.getAllReviews)
    .post(reviewController.createReview);

router.route('/:id')
    .patch(reviewController.updateReview)
    .delete(reviewController.deleteReview);

router.patch('/:id/toggle-approval', restrictTo('admin'), reviewController.toggleApproval);

module.exports = router;
