const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon must have a code'],
        unique: true,
        uppercase: true,
        trim: true
    },
    discount: {
        type: Number,
        required: [true, 'Coupon must have a discount value']
    },
    discountType: {
        type: String,
        enum: ['flat', 'percentage'],
        default: 'percentage'
    },
    expiryDate: {
        type: Date,
        required: [true, 'Coupon must have an expiry date']
    },
    usageLimit: {
        type: Number,
        default: 100
    },
    usageCount: {
        type: Number,
        default: 0
    },
    minCartValue: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
