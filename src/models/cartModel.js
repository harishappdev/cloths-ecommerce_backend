const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'Cart item must belong to a product']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity cannot be less than 1'],
        default: 1
    },
    size: String,
    color: String,
    price: {
        type: Number,
        required: [true, 'Price at time of adding is required']
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Cart must belong to a user'],
        unique: true
    },
    items: [cartItemSchema],
    totalPrice: {
        type: Number,
        default: 0
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
}, {
    timestamps: true
});

// Middleware to calculate total price before saving
cartSchema.pre('save', function () {
    this.totalPrice = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    this.updatedAt = Date.now();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
