const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// Printify API configuration
const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const PRINTIFY_API_URL = 'https://api.printify.com/v1';

const printifyHeaders = {
    'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
    'Content-Type': 'application/json'
};

// Category mapping based on Printify product types
const categoryMapping = {
    // T-Shirts
    'Unisex Softstyle T-Shirt': 'shirts',
    'Bella + Canvas Unisex T-Shirt': 'shirts',
    'Unisex Heavy Cotton Tee': 'shirts',
    'Premium T-Shirt': 'shirts',
    'T-Shirt': 'shirts',
    'Tee': 'shirts',
    
    // Hoodies & Sweatshirts
    'Hoodie': 'hoodies',
    'Unisex Heavy Blend Hoodie': 'hoodies',
    'Sweatshirt': 'hoodies',
    'Pullover': 'hoodies',
    'Crewneck': 'hoodies',
    
    // Accessories
    'Mug': 'accessories',
    'Coffee Mug': 'accessories',
    'Tote Bag': 'accessories',
    'Phone Case': 'accessories',
    'Hat': 'accessories',
    'Cap': 'accessories',
    'Beanie': 'accessories',
    
    // Prints
    'Canvas': 'prints',
    'Poster': 'prints',
    'Print': 'prints',
    'Wall Art': 'prints',
    'Framed': 'prints',
    
    // Stickers
    'Sticker': 'stickers',
    'Stickers': 'stickers',
    'Decal': 'stickers',
    'Label': 'stickers'
};

// Function to parse title and category
// Format: "Display Name - eurorack category"
// Example: "mod-01 - eurorack sticker" → displays as "mod-01 sticker", category: "stickers"
function parseProductInfo(product) {
    let displayTitle = product.title;
    let category = 'accessories'; // default
    
    // Check if title has " - " separator
    if (product.title.includes(' - ')) {
        const parts = product.title.split(' - ');
        const namePart = parts[0].trim(); // Everything before the dash
        const categoryPart = parts[1].toLowerCase().trim(); // Everything after the dash
        
        // Remove "eurorack" from the category part but keep the category word
        let cleanCategory = categoryPart.replace('eurorack', '').trim();
        
        // Build display title: name + category word (like "sticker")
        displayTitle = namePart;
        if (cleanCategory) {
            displayTitle = `${namePart} ${cleanCategory}`;
        }
        
        // Check category part for keywords to determine category
        for (const [keyword, cat] of Object.entries(categoryMapping)) {
            if (categoryPart.includes(keyword.toLowerCase())) {
                category = cat;
                break;
            }
        }
    } else {
        // Fallback to old method if no separator found
        const title = product.title.toLowerCase();
        for (const [keyword, cat] of Object.entries(categoryMapping)) {
            if (title.includes(keyword.toLowerCase())) {
                category = cat;
                break;
            }
        }
    }
    
    return { displayTitle, category };
}

async function syncProducts() {
    console.log('🔄 Starting Printify Product Sync...\n');
    
    // Check if API key is configured
    if (!PRINTIFY_API_KEY || PRINTIFY_API_KEY === 'your_printify_api_key_here') {
        console.log('❌ Printify API key not configured!');
        console.log('\n📝 Instructions:');
        console.log('1. Log into Printify.com');
        console.log('2. Go to Account > Connections > API Access');
        console.log('3. Generate a Personal Access Token');
        console.log('4. Copy your Shop ID');
        console.log('5. Add them to backend/.env file:');
        console.log('   PRINTIFY_API_KEY=your_actual_api_key');
        console.log('   PRINTIFY_SHOP_ID=your_actual_shop_id');
        console.log('6. Set DEMO_MODE=false in .env');
        console.log('7. Run this script again!');
        return;
    }
    
    try {
        console.log('📡 Fetching products from Printify...');
        console.log(`   Shop ID: ${PRINTIFY_SHOP_ID}`);
        
        // Get all products (max 50 per request)
        const response = await axios.get(
            `${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/products.json?limit=50`,
            { headers: printifyHeaders }
        );
        
        const products = response.data.data;
        console.log(`✅ Found ${products.length} products\n`);
        
        if (products.length === 0) {
            console.log('⚠️  No products found in your Printify store.');
            console.log('   Make sure you have published products in Printify!');
            return;
        }
        
        // Format products for frontend
        const formattedProducts = [];
        const categoryCounts = {};
        
        console.log('📦 Processing products:\n');
        
        for (const product of products) {
            const { displayTitle, category } = parseProductInfo(product);
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            
            console.log(`  • ${product.title}`);
            console.log(`    → Displays as: "${displayTitle}"`);
            console.log(`    Category: ${category}`);
            console.log(`    Variants: ${product.variants.length}`);
            console.log(`    ID: ${product.id}`);
            
            const variants = [];
            let basePrice = 0;
            
            for (const variant of product.variants) {
                if (variant.is_enabled) {
                    const price = variant.price / 100;
                    if (basePrice === 0 || price < basePrice) {
                        basePrice = price;
                    }
                    
                    variants.push({
                        id: variant.id.toString(),
                        name: variant.title,
                        price: price,
                        size: variant.options?.size || '',
                        color: variant.options?.color || ''
                    });
                }
            }
            
            if (variants.length > 0) {
                // ONLY add products that have "- eurorack" in their name
                if (product.title.includes('- eurorack')) {
                    formattedProducts.push({
                        id: product.id,
                        title: displayTitle,  // Use cleaned display title
                        originalTitle: product.title,  // Keep original for reference
                        category: category,
                        description: product.description || '',
                        price: basePrice,
                        image: product.images[0]?.src || 'https://via.placeholder.com/300x400',
                        printifyId: product.id,
                        variants: variants
                    });
                    console.log(`    ✓ Added with ${variants.length} variants\n`);
                } else {
                    console.log(`    ⚠️  Skipped (not eurorack product)\n`);
                }
            } else {
                console.log(`    ⚠️  Skipped (no enabled variants)\n`);
            }
        }
        
        // Show category summary
        console.log('\n📊 Category Summary:');
        for (const [category, count] of Object.entries(categoryCounts)) {
            console.log(`   ${category}: ${count} products`);
        }
        
        // Generate JavaScript file for frontend
        const jsContent = `// Auto-generated from Printify - ${new Date().toISOString()}
// Total products: ${formattedProducts.length}

// Replace the sampleProducts array in frontend/store.js with this:
const printifyProducts = ${JSON.stringify(formattedProducts, null, 2)};

// Category counts:
// ${Object.entries(categoryCounts).map(([k, v]) => `${k}: ${v}`).join('\n// ')}
`;
        
        fs.writeFileSync('printify-products.js', jsContent);
        console.log('\n✅ Product data saved to printify-products.js');
        console.log('\n💡 TIP: Name your Printify products like this:');
        console.log('   "Display Name - eurorack category"');
        console.log('   Examples:');
        console.log('   • "mod-01 - eurorack sticker" → Shows as "mod-01 sticker" in Stickers');
        console.log('   • "vcf-2 - eurorack shirt" → Shows as "vcf-2 shirt" in T-Shirts');
        console.log('   • "bt-808 - eurorack print" → Shows as "bt-808 print" in Art Prints');
        
        // Generate update instructions
        console.log('\n📝 Next Steps:');
        console.log('1. Open printify-products.js');
        console.log('2. Copy the entire printifyProducts array');
        console.log('3. Open frontend/store.js');
        console.log('4. Replace the sampleProducts array with printifyProducts');
        console.log('5. Update frontend/store.js line 3:');
        console.log('   const DEMO_MODE = false;  // Change from true to false');
        console.log('6. Restart your store and test!');
        
        // Check for missing categories
        const missingCategories = formattedProducts.filter(p => p.category === 'accessories' && !p.title.toLowerCase().includes('mug') && !p.title.toLowerCase().includes('bag'));
        if (missingCategories.length > 0) {
            console.log('\n⚠️  Some products defaulted to "accessories" category.');
            console.log('   You may want to manually adjust their categories in the output file.');
        }
        
    } catch (error) {
        console.error('\n❌ Error syncing products:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.log('\n🔑 Authentication failed. Please check:');
            console.log('   - Your API key is correct');
            console.log('   - The token hasn\'t expired');
            console.log('   - You\'ve saved the .env file');
        } else if (error.response?.status === 404) {
            console.log('\n🏪 Shop not found. Please check:');
            console.log('   - Your Shop ID is correct');
            console.log('   - The shop exists in your Printify account');
        } else {
            console.log('\n💡 Troubleshooting tips:');
            console.log('   - Make sure you have products in Printify');
            console.log('   - Check your internet connection');
            console.log('   - Try regenerating your API token');
        }
    }
}

// Run the sync
console.log('🎨 Printify Product Sync Tool\n');
console.log('This will fetch all your products from Printify and format them for your store.\n');

syncProducts();