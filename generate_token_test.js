const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');

dotenv.config({ path: path.join(__dirname, '.env') });

const userId = '69a1675d2ec7382d58e0bed8';
const secret = process.env.JWT_SECRET;

const token = jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN
});

console.log('TOKEN=' + token);

async function test() {
    try {
        const response = await axios.get('http://localhost:5000/api/v1/orders/myorders', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('✅ Success! Data length:', response.data.results);
    } catch (err) {
        console.error('❌ Failed with status:', err.response?.status);
        console.error('Data:', JSON.stringify(err.response?.data, null, 2));
    }
}

test();
