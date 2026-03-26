const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./src/models/productModel');

async function deepSearch() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- DIAGNOSTIC START ---');

        const allProducts = await Product.find({}, 'name barcode');
        console.log(`Total products in DB: ${allProducts.length}`);

        const searchTerm = '1234';
        const searchRegex = new RegExp(searchTerm, 'i');

        console.log(`\nSearching for regex: ${searchRegex}`);
        const matches = allProducts.filter(p => {
            const nameMatch = searchRegex.test(p.name);
            const barcodeMatch = p.barcode && searchRegex.test(p.barcode);
            return nameMatch || barcodeMatch;
        });

        console.log(`Manual JS Filter match count: ${matches.length}`);
        matches.forEach(m => console.log(`- MATCH: ${m.name} [${m.barcode}]`));

        const mongoMatches = await Product.find({
            $or: [
                { name: searchRegex },
                { barcode: searchRegex }
            ]
        });

        console.log(`\nMongo $or match count: ${mongoMatches.length}`);
        mongoMatches.forEach(m => console.log(`- MONGO: ${m.name} [${m.barcode}]`));

        console.log('--- DIAGNOSTIC END ---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

deepSearch();
