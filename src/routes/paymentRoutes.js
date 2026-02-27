const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Webhook must be accessible by Stripe (No Auth Middleware here)
// Note: This route should use express.raw() in app.js
router.post('/webhook', paymentController.webhookCheckout);

// Protected routes
router.use(authMiddleware.protect);
router.post('/checkout-session/:orderId', paymentController.getCheckoutSession);

module.exports = router;
