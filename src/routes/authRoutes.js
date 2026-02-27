const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const AppError = require('../utils/AppError');

const router = express.Router();

// validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const message = errors.array().map(err => err.msg).join(', ');
        return next(new AppError(message, 400));
    }
    next();
};

router.post(
    '/signup',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    ],
    validate,
    authController.signup
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    validate,
    authController.login
);

router.get('/refresh', authController.refresh);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword', authController.resetPassword);

module.exports = router;
