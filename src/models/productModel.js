const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A product must have a name'],
        unique: true,
        trim: true,
        maxlength: [100, 'A product name must have less or equal than 100 characters'],
        minlength: [5, 'A product name must have more or equal than 5 characters']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'A product must have a description'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'A product must have a price']
    },
    discountPrice: {
        type: Number,
        validate: {
            validator: function (val) {
                // this only points to current doc on NEW document creation
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    category: {
        type: String,
        required: [true, 'A product must have a category']
    },
    sizes: {
        type: [String],
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Universal'],
        default: ['Universal']
    },
    colors: [String],
    stock: {
        type: Number,
        required: [true, 'A product must have a stock count'],
        default: 0
    },
    images: {
        type: [String],
        required: [true, 'A product must have at least one image']
    },
    ratings: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0']
    },
    numReviews: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Product must belong to a user (admin)']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
productSchema.pre('save', function () {
    this.slug = slugify(this.name, { lower: true });
});

// INDEXES
productSchema.index({ slug: 1 });
productSchema.index({ price: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
