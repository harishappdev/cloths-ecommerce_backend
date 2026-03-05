const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);

// Publicly accessible for users during checkout
router.post('/validate', couponController.validateCoupon);

// Admin only
router.use(restrictTo('admin'));

router.route('/')
    .get(couponController.getAllCoupons)
    .post(couponController.createCoupon);

router.delete('/:id', couponController.deleteCoupon);

module.exports = router;
