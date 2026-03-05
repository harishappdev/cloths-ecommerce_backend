const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Order = require('./src/models/orderModel');
const User = require('./src/models/userModel');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const firstOrder = await Order.findOne();
        if (!firstOrder) {
            console.log('⚠️ No orders found in database.');
            process.exit(0);
        }

        console.log('✅ Found an order:', firstOrder._id);
        console.log('Subtotal:', firstOrder.subtotal); // Should be undefined or 0 (if default works)

        const allOrders = await Order.find().limit(10);
        console.log(`✅ Fetched ${allOrders.length} orders successfully.`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error during diagnostic:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

test();
