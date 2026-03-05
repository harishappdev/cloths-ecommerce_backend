const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const userId = '69a16d215b9f9b22360c1fae';
const secret = process.env.JWT_SECRET;

const token = jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN
});

console.log('TOKEN=' + token);
