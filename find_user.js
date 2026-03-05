const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/userModel');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: /@/ });
        if (user) {
            console.log('USER_ID=' + user._id);
            console.log('USER_EMAIL=' + user.email);
        } else {
            console.log('No user found');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
