const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Middleware to handle express-validator errors
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const message = errors.array().map(el => el.msg).join('. ');
        return next(new AppError(message, 400));
    }
    next();
};

module.exports = validate;
