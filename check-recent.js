const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./src/models/productModel');

async function checkRecent() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB connected');

        const products = await Product.find().sort('-createdAt').limit(5);

        console.log(`Last 5 products:`);
        products.forEach(p => {
            console.log(`- ${p.name} | Barcode: ${p.barcode} | Slug: ${p.slug}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkRecent();
