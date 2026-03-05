const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const userId = '69a1675d2ec7382d58e0bed8';
const secret = process.env.JWT_SECRET;

const token = jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN
});

console.log('TOKEN=' + token);
