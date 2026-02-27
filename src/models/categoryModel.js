const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A category must have a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'A category name must have less or equal than 50 characters'],
        minlength: [3, 'A category name must have more or equal than 3 characters']
    },
    slug: String,
    description: {
        type: String,
        trim: true
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
categorySchema.pre('save', function () {
    this.slug = slugify(this.name, { lower: true });
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
