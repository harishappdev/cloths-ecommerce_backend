const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./src/models/productModel');

async function checkRecentFull() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB connected');

        const products = await Product.find().sort('-createdAt').limit(5);

        console.log(`Last 5 products full info:`);
        products.forEach(p => {
            console.log(`- NAME: ${p.name}`);
            console.log(`  BARCODE: "${p.barcode}"`);
            console.log(`  CREATED AT: ${p.createdAt}`);
            console.log(`  ---`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkRecentFull();
