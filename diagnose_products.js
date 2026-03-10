const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./src/models/productModel');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const products = await Product.find({});
        console.log(`Total products: ${products.length}`);
        
        products.forEach(p => {
            console.log(`- ${p.name} (Category: ${p.category}, Brand: ${p.brand})`);
            console.log(`  Colors: ${JSON.stringify(p.colors)}`);
            console.log(`  Sizes: ${JSON.stringify(p.sizes)}`);
        });

        const distinctColors = await Product.distinct('colors');
        console.log(`Distinct colors found: ${JSON.stringify(distinctColors)}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
