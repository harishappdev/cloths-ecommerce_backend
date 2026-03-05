const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Only Admins allowed
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

router.get('/stats', adminController.getDashboardStats);
router.get('/analytics', adminController.getSalesAnalytics);
router.get('/analytics/daily', adminController.getDailySalesAnalytics);

module.exports = router;
