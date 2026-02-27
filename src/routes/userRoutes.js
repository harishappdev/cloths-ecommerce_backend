const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.get('/me', protect, userController.getMe);

module.exports = router;
