const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const userId = '69a9209322caa7bfdc234feb';
const secret = process.env.JWT_SECRET;

const token = jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN
});

console.log('TOKEN=' + token);
