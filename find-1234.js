const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./src/models/productModel');

async function find1234() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB connected');

        const products = await Product.find({
            $or: [
                { name: /1234/i },
                { barcode: /1234/i }
            ]
        });

        console.log(`Found ${products.length} matching products:`);
        products.forEach(p => {
            console.log(`- NAME: ${p.name}`);
            console.log(`  BARCODE: ${p.barcode}`);
            console.log(`  ID: ${p._id}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

find1234();
