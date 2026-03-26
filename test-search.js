const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./src/models/productModel');

async function testSearch() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB connected');

        const searchTerm = '1234';
        const searchRegex = { $regex: searchTerm, $options: 'i' };

        const products = await Product.find({
            $or: [
                { name: searchRegex },
                { barcode: searchRegex }
            ]
        });

        console.log(`Found ${products.length} products for search term "${searchTerm}"`);
        products.forEach(p => console.log(`- ${p.name} (Barcode: ${p.barcode})`));

        // Let's also check if it exists at all
        const allWith1234 = await Product.find({ barcode: '1234' });
        console.log(`Direct match for "1234": ${allWith1234.length} found`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testSearch();
