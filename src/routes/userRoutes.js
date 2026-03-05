const express = require('express');
const userController = require('../controllers/userController');
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.get('/me', protect, userController.getMe);
router.patch('/updateMe', protect, userController.updateMe);

router.use(protect); // All routes after this are protected

router.route('/wishlist')
    .get(wishlistController.getWishlist)
    .patch(wishlistController.toggleWishlist);

router.route('/addresses')
    .get(userController.getAddresses)
    .post(userController.addAddress);

router.route('/addresses/:id')
    .patch(userController.updateAddress)
    .delete(userController.removeAddress);

module.exports = router;
