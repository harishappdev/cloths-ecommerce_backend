const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/asyncHandler');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/v1/admin/stats
 * @access  Admin
 */
exports.getDashboardStats = catchAsync(async (req, res, next) => {
    try {
        console.log('📊 Fetching dashboard stats...');

        // 1) Total Revenue (sum of all paid orders)
        const revenueData = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
        ]);
        console.log('💰 Revenue data:', JSON.stringify(revenueData));

        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // 2) Total Orders
        const totalOrders = await Order.countDocuments();
        console.log('📦 Total orders:', totalOrders);

        // 3) Total Products
        const totalProducts = await Product.countDocuments();
        console.log('🏷️ Total products:', totalProducts);

        // 4) Total Users
        const totalUsers = await User.countDocuments();
        console.log('👥 Total users:', totalUsers);

        // 6) Total Reviews
        const Review = require('../models/reviewModel');
        const totalReviews = await Review.countDocuments();

        // 7) Total Coupons
        const Coupon = require('../models/couponModel');
        const totalCoupons = await Coupon.countDocuments();

        // 5) Recent Orders
        const recentOrders = await Order.find()
            .sort('-createdAt')
            .limit(5)
            .populate('user', 'name email');
        console.log('🕒 Recent orders fetched:', recentOrders.length);

        res.status(200).json({
            status: 'success',
            data: {
                totalRevenue,
                totalOrders,
                totalProducts,
                totalUsers,
                totalReviews,
                totalCoupons,
                recentOrders
            }
        });
    } catch (err) {
        console.error('❌ Error in getDashboardStats:', err);
        return next(err);
    }
});

/**
 * @desc    Get sales analytics (last 6 months)
 * @route   GET /api/v1/admin/analytics
 */
exports.getSalesAnalytics = catchAsync(async (req, res, next) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const analytics = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: sixMonthsAgo },
                isPaid: true
            }
        },
        {
            $group: {
                _id: { $month: '$createdAt' },
                revenue: { $sum: '$totalPrice' },
                orderCount: { $sum: 1 }
            }
        },
        { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            analytics
        }
    });
});

/**
 * @desc    Get daily sales analytics (last 7 days)
 * @route   GET /api/v1/admin/analytics/daily
 */
exports.getDailySalesAnalytics = catchAsync(async (req, res, next) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const analytics = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: sevenDaysAgo },
                isPaid: true
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                revenue: { $sum: '$totalPrice' }
            }
        },
        { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            analytics
        }
    });
});
