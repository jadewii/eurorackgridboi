const axios = require('axios');
require('dotenv').config();

// Printify API configuration
const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const PRINTIFY_API_URL = 'https://api.printify.com/v1';

const printifyHeaders = {
    'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
    'Content-Type': 'application/json'
};

async function syncProducts() {
    try {
        console.log('Fetching products from Printify...');
        
        // Get all products
        const response = await axios.get(
            `${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/products.json`,
            { headers: printifyHeaders }
        );
        
        const products = response.data.data;
        console.log(`Found ${products.length} products\n`);
        
        // Format products for frontend
        const formattedProducts = [];
        
        for (const product of products) {
            console.log(`\nProduct: ${product.title}`);
            console.log(`ID: ${product.id}`);
            console.log(`Variants:`);
            
            const variants = [];
            
            for (const variant of product.variants) {
                if (variant.is_enabled) {
                    console.log(`  - ${variant.title}: $${variant.price / 100} (ID: ${variant.id})`);
                    variants.push({
                        id: variant.id,
                        name: variant.title,
                        price: variant.price / 100,
                        options: variant.options
                    });
                }
            }
            
            formattedProducts.push({
                id: product.id,
                title: product.title,
                description: product.description,
                price: variants[0]?.price || 0,
                image: product.images[0]?.src || '',
                printifyId: product.id,
                variants: variants
            });
        }
        
        // Save to file for easy copying to frontend
        const fs = require('fs');
        const productData = `// Auto-generated product data from Printify
// Copy this to your store.js file

const products = ${JSON.stringify(formattedProducts, null, 2)};`;
        
        fs.writeFileSync('product-data.js', productData);
        console.log('\n✅ Product data saved to product-data.js');
        console.log('Copy this data to your frontend/store.js file');
        
    } catch (error) {
        console.error('Error syncing products:', error.response?.data || error.message);
        console.log('\nMake sure you have:');
        console.log('1. Valid Printify API key in .env file');
        console.log('2. Correct Shop ID in .env file');
        console.log('3. Published products in your Printify store');
    }
}

// Run the sync
syncProducts();