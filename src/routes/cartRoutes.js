const express = require('express');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware.protect);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.patch('/update', cartController.updateQuantity);
router.delete('/remove', cartController.removeItem);
router.delete('/clear', cartController.clearCart);

module.exports = router;
