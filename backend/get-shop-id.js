const axios = require('axios');
require('dotenv').config();

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;

async function getShopId() {
    console.log('🔍 Finding your Shop ID...\n');
    
    try {
        // Get list of shops for this account
        const response = await axios.get(
            'https://api.printify.com/v1/shops.json',
            {
                headers: {
                    'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const shops = response.data;
        
        if (shops && shops.length > 0) {
            console.log('✅ Found your shop(s):\n');
            shops.forEach((shop, index) => {
                console.log(`Shop ${index + 1}:`);
                console.log(`  ID: ${shop.id}`);
                console.log(`  Title: ${shop.title}`);
                console.log(`  Sales Channel: ${shop.sales_channel || 'Manual'}\n`);
            });
            
            if (shops.length === 1) {
                console.log(`\n📝 Your Shop ID is: ${shops[0].id}`);
                console.log('\nAdd this to your .env file:');
                console.log(`PRINTIFY_SHOP_ID=${shops[0].id}`);
            } else {
                console.log('You have multiple shops. Use the ID of the shop you want to connect.');
            }
            
            return shops[0].id;
        } else {
            console.log('❌ No shops found. Make sure you have created a shop in Printify.');
        }
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.log('\n⚠️  Authentication failed. Make sure your API token is correct in .env');
        }
    }
}

getShopId();