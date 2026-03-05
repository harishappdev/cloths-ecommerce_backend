const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false // Don't show password by default
    },
    isActive: {
        type: Boolean,
        default: true,
        select: false
    },
    passwordChangedAt: Date,
    passwordResetOTP: String,
    passwordResetOTPExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now()
    },
    wishlist: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Product'
        }
    ],
    addresses: [
        {
            name: String,
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: { type: String, default: 'India' },
            isDefault: { type: Boolean, default: false }
        }
    ]
});

const crypto = require('crypto');

// Hash password before saving
userSchema.pre('save', async function () {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return;

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
});

// Instance method to check if password is correct
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    // False means NOT changed
    return false;
};

userSchema.methods.createPasswordResetOTP = function () {
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP and save to database
    this.passwordResetOTP = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    // Token expires in 10 minutes
    this.passwordResetOTPExpires = Date.now() + 10 * 60 * 1000;

    return otp;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
