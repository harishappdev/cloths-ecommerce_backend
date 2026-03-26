require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/productModel');

const seedBarcode = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const product = await Product.findOne();
        if (!product) {
            console.log('No products found to update');
            process.exit(0);
        }

        const testBarcode = '1234567890123';
        product.barcode = testBarcode;
        await product.save();

        console.log(`Updated product "${product.name}" with barcode: ${testBarcode}`);
        console.log('You can now use this barcode to test the Scanner.');
        
        process.exit(0);
    } catch (err) {
        console.error('Error seeding barcode:', err);
        process.exit(1);
    }
};

seedBarcode();
