const axios = require('axios');

async function verifyAPI() {
    try {
        const url = 'http://localhost:5000/api/v1/products?search=1234';
        console.log(`GET ${url}`);
        const response = await axios.get(url);
        
        console.log('Status:', response.status);
        console.log('Results Count:', response.data.results);
        console.log('Total Results:', response.data.totalResults);
        
        const products = response.data.data.products;
        products.forEach(p => {
            console.log(`- FOUND: ${p.name} [Barcode: ${p.barcode}]`);
        });

        if (products.length > 0) {
            console.log('Verification Success: API is correctly searching barcodes.');
        } else {
            console.log('Verification Failure: API returned no results for "1234".');
        }
    } catch (err) {
        console.error('API Error:', err.response?.status, err.response?.data || err.message);
    }
}

verifyAPI();
