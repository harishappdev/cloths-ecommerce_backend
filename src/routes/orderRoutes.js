const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.post('/', orderController.createOrder);
router.get('/myorders', orderController.getMyOrders);
router.get('/:id', orderController.getOrder);

// Admin Only Routes
router.use(authMiddleware.restrictTo('admin'));

router.get('/', orderController.getAllOrders);
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
