const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./src/models/productModel');

async function auditUfffff() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const p = await Product.findOne({ name: 'ufffff' });
        
        if (p) {
            console.log('Product Found:');
            console.log(`- Name: ${p.name}`);
            console.log(`- Barcode Value: "${p.barcode}"`);
            console.log(`- Barcode Type: ${typeof p.barcode}`);
            console.log(`- Barcode Length: ${p.barcode ? p.barcode.length : 'N/A'}`);
            
            const regex = /1234/i;
            console.log(`- /1234/i.test(barcode): ${regex.test(p.barcode)}`);
        } else {
            console.log('Product "ufffff" not found');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

auditUfffff();
