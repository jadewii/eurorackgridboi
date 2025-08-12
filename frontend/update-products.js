// Script to update products from Printify
// Run this with Node.js to fetch latest products

const fs = require('fs');

async function updateProducts() {
    console.log('Fetching updated products from Printify...');
    
    // You'll need to add your Printify API token here
    const PRINTIFY_API_TOKEN = 'YOUR_PRINTIFY_API_TOKEN';
    const SHOP_ID = 'YOUR_SHOP_ID';
    
    try {
        const response = await fetch(`https://api.printify.com/v1/shops/${SHOP_ID}/products.json`, {
            headers: {
                'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`
            }
        });
        
        const data = await response.json();
        console.log(`Found ${data.data.length} products`);
        
        // Transform products to our format
        const products = data.data.map(product => {
            // Get the first variant's price as default
            const defaultPrice = product.variants[0]?.price / 100 || 0;
            
            // Determine category
            let category = 'accessories';
            const title = product.title.toLowerCase();
            if (title.includes('sticker')) category = 'stickers';
            else if (title.includes('shirt') || title.includes('tee')) category = 'shirts';
            else if (title.includes('hoodie')) category = 'hoodies';
            else if (title.includes('print') || title.includes('poster')) category = 'prints';
            else if (title.includes('mug') || title.includes('pillow')) category = 'home';
            
            return {
                id: product.id,
                printifyId: product.id,
                title: product.title,
                description: product.description,
                price: defaultPrice,
                image: product.images[0]?.src || '',
                category: category,
                variants: product.variants.map(v => ({
                    id: v.id,
                    name: v.title,
                    price: v.price / 100,
                    inStock: v.is_enabled
                }))
            };
        });
        
        // Write to file
        const jsContent = `// Printify Products - Updated ${new Date().toISOString()}
const printifyProducts = ${JSON.stringify(products, null, 2)};`;
        
        fs.writeFileSync('printify-products-updated.js', jsContent);
        console.log('✅ Products updated and saved to printify-products-updated.js');
        console.log('Categories found:', {
            stickers: products.filter(p => p.category === 'stickers').length,
            shirts: products.filter(p => p.category === 'shirts').length,
            hoodies: products.filter(p => p.category === 'hoodies').length,
            accessories: products.filter(p => p.category === 'accessories').length,
            prints: products.filter(p => p.category === 'prints').length,
            home: products.filter(p => p.category === 'home').length
        });
        
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Instructions
console.log(`
To update your products:
1. Get your Printify API token from: https://printify.com/app/account/api
2. Get your Shop ID from: https://printify.com/app/stores
3. Replace YOUR_PRINTIFY_API_TOKEN and YOUR_SHOP_ID in this file
4. Run: node update-products.js
5. Replace printify-products.js with printify-products-updated.js
`);

// Uncomment this line after adding your credentials
// updateProducts();