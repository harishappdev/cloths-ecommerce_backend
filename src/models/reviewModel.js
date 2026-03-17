const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cannot be empty!']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Review must have a rating.']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'Review must belong to a product.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.']
    },
    isApproved: {
        type: Boolean,
        default: true // Set to false if you want moderation by default
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Prevent user from leaving multiple reviews for the same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Populating user on find
reviewSchema.pre(/^find/, function () {
    this.populate({
        path: 'user',
        select: 'name'
    });
});

// Static method to calculate average rating
reviewSchema.statics.calcAverageRatings = async function (productId) {
    const stats = await this.aggregate([
        {
            $match: { product: productId, isApproved: true }
        },
        {
            $group: {
                _id: '$product',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            numReviews: stats[0].nRating,
            ratings: stats[0].avgRating.toFixed(1)
        });
    } else {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            numReviews: 0,
            ratings: 4.5 // Default back to 4.5 or whatever base is
        });
    }
};

reviewSchema.post('save', function () {
    // this points to current review
    this.constructor.calcAverageRatings(this.product);
});

// findByIdAndUpdate, findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function () {
    this.r = await this.findOne();
});

reviewSchema.post(/^findOneAnd/, async function () {
    await this.r.constructor.calcAverageRatings(this.r.product);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
