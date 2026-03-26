const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./src/models/productModel');

async function checkToday() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB connected');

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const products = await Product.find({ createdAt: { $gte: startOfToday } });

        console.log(`Found ${products.length} products created today (March 26):`);
        products.forEach(p => {
            console.log(`- NAME: ${p.name}`);
            console.log(`  BARCODE: "${p.barcode}"`);
        });

        if (products.length === 0) {
            console.log('No products created today. The "1234" product might not have been saved.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkToday();
