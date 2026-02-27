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
                recentOrders
            }
        });
    } catch (err) {
        console.error('❌ Error in getDashboardStats:', err);
        return next(err);
    }
});
