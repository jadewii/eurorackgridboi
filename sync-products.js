const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './backend/.env' });

const PRINTIFY_API_TOKEN = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_API_KEY;
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;

async function syncProducts() {
    console.log('🔄 Syncing products from Printify...\n');
    
    // Check configuration
    if (!PRINTIFY_API_TOKEN || PRINTIFY_API_TOKEN.includes('YOUR_')) {
        console.log('❌ Printify API token not configured');
        console.log('   Add your PRINTIFY_API_TOKEN to backend/.env');
        console.log('\n💡 Using demo products for now...');
        return;
    }
    
    if (!PRINTIFY_SHOP_ID || PRINTIFY_SHOP_ID.includes('YOUR_')) {
        console.log('❌ Printify Shop ID not configured');
        console.log('   Add your PRINTIFY_SHOP_ID to backend/.env');
        return;
    }
    
    try {
        // Fetch products from Printify
        const response = await axios.get(
            `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json`,
            {
                headers: {
                    'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const products = response.data.data;
        console.log(`✅ Found ${products.length} products in Printify\n`);
        
        // Transform products to match our format
        const transformedProducts = products.map(product => {
            // Get first image
            const image = product.images && product.images.length > 0 
                ? product.images[0].src 
                : 'https://via.placeholder.com/400x400?text=No+Image';
            
            // Determine category based on product tags or title
            let category = 'other'; // default
            const title = product.title.toLowerCase();
            const tags = (product.tags || []).join(' ').toLowerCase();
            
            // IMPORTANT: Only products ending with "- eurorack sticker" are stickers
            if (product.title.endsWith('- eurorack sticker')) {
                category = 'stickers';
            } else if (title.includes('shirt') || tags.includes('shirt')) {
                category = 'shirts';
            } else if (title.includes('hoodie') || tags.includes('hoodie')) {
                category = 'hoodies';
            } else if (title.includes('mug') || title.includes('bag') || tags.includes('accessories')) {
                category = 'accessories';
            } else if (title.includes('print') || title.includes('poster') || tags.includes('print')) {
                category = 'prints';
            }
            
            // Get variants with prices
            const variants = product.variants.map(variant => ({
                id: variant.id,
                name: variant.title,
                price: variant.price / 100, // Convert cents to dollars
                isEnabled: variant.is_enabled
            })).filter(v => v.isEnabled);
            
            // Get base price (lowest variant price)
            const price = variants.length > 0 
                ? Math.min(...variants.map(v => v.price))
                : 10;
            
            return {
                id: product.id,
                title: product.title,
                description: product.description || '',
                category: category,
                price: price,
                image: image,
                variants: variants,
                tags: product.tags || [],
                printifyId: product.id
            };
        });
        
        // Separate stickers from other products
        const stickers = transformedProducts.filter(p => p.category === 'stickers');
        const otherProducts = transformedProducts.filter(p => p.category !== 'stickers');
        
        console.log('📊 Product breakdown:');
        console.log(`   - Stickers: ${stickers.length}`);
        console.log(`   - T-Shirts: ${transformedProducts.filter(p => p.category === 'shirts').length}`);
        console.log(`   - Hoodies: ${transformedProducts.filter(p => p.category === 'hoodies').length}`);
        console.log(`   - Accessories: ${transformedProducts.filter(p => p.category === 'accessories').length}`);
        console.log(`   - Prints: ${transformedProducts.filter(p => p.category === 'prints').length}`);
        console.log('');
        
        // List all products
        console.log('📦 Eurorack stickers found:');
        stickers.forEach(p => {
            console.log(`   ✅ ${p.title} ($${p.price})`);
        });
        
        if (stickers.length === 0) {
            console.log('   ❌ No products ending with "- eurorack sticker" found');
        }
        
        console.log('\n📦 Other products:');
        otherProducts.forEach(p => {
            console.log(`   - [${p.category}] ${p.title}`);
        });
        
        // Generate JavaScript file
        const jsContent = `// Auto-generated from Printify - ${new Date().toISOString()}
// Run sync-products.js to update

const printifyProducts = ${JSON.stringify(transformedProducts, null, 2)};

// Make available globally
if (typeof window !== 'undefined') {
    window.printifyProducts = printifyProducts;
}
`;
        
        // Write to frontend directory
        const outputPath = path.join(__dirname, 'frontend', 'printify-products.js');
        fs.writeFileSync(outputPath, jsContent);
        
        console.log('\n✅ Successfully synced products!');
        console.log(`   Updated: ${outputPath}`);
        console.log('\n🎉 Your new stickers should now appear on the site!');
        console.log('   Refresh the page to see them: http://localhost:8000/stickers.html');
        
    } catch (error) {
        console.error('❌ Error syncing products:');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Message:', error.response.data?.message || error.response.statusText);
            
            if (error.response.status === 401) {
                console.log('\n💡 Check your API token is correct in backend/.env');
            } else if (error.response.status === 404) {
                console.log('\n💡 Check your Shop ID is correct in backend/.env');
            }
        } else {
            console.error('   ', error.message);
        }
    }
}

// Run sync
syncProducts();