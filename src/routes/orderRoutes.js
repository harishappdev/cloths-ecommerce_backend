const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.post('/', orderController.createOrder);
router.get('/myorders', orderController.getMyOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/cancel', orderController.cancelOrder);
router.patch('/:id/return', orderController.requestReturn);

// Admin Only Routes
router.use(authMiddleware.restrictTo('admin'));

router.get('/', orderController.getAllOrders);
router.patch('/:id/status', authMiddleware.restrictTo('admin'), orderController.updateOrderStatus);
router.patch('/:id/process-return', authMiddleware.restrictTo('admin'), orderController.processReturn);

module.exports = router;
