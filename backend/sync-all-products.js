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

// Category mapping
const categoryMapping = {
    'T-Shirt': 'shirts',
    'Tee': 'shirts',
    'Shirt': 'shirts',
    'Tank': 'shirts',
    'Hoodie': 'hoodies',
    'Sweatshirt': 'hoodies',
    'Crewneck': 'hoodies',
    'Pullover': 'hoodies',
    'Mug': 'accessories',
    'Tote': 'accessories',
    'Bag': 'accessories',
    'Phone': 'accessories',
    'Case': 'accessories',
    'Hat': 'accessories',
    'Canvas': 'prints',
    'Poster': 'prints',
    'Print': 'prints',
    'Pillow': 'prints',
    'Sticker': 'stickers',
    'Decal': 'stickers',
    'Vinyl': 'stickers'
};

function determineCategory(product) {
    const title = product.title.toLowerCase();
    
    for (const [keyword, category] of Object.entries(categoryMapping)) {
        if (title.includes(keyword.toLowerCase())) {
            return category;
        }
    }
    
    return 'accessories';
}

async function fetchAllProducts() {
    console.log('🔄 Fetching ALL products from Printify...\n');
    
    let allProducts = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
        try {
            console.log(`📡 Fetching page ${page}...`);
            
            const response = await axios.get(
                `${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/products.json?page=${page}&limit=50`,
                { headers: printifyHeaders }
            );
            
            const products = response.data.data || [];
            
            if (products.length > 0) {
                allProducts = allProducts.concat(products);
                console.log(`   Found ${products.length} products on page ${page}`);
                page++;
                
                // Add a small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            } else {
                hasMore = false;
            }
            
            // Safety check - stop after 10 pages (500 products)
            if (page > 10) {
                hasMore = false;
            }
        } catch (error) {
            console.error(`Error on page ${page}:`, error.response?.data || error.message);
            hasMore = false;
        }
    }
    
    return allProducts;
}

async function syncAllProducts() {
    try {
        const products = await fetchAllProducts();
        
        console.log(`\n✅ Total products found: ${products.length}\n`);
        
        if (products.length === 0) {
            console.log('⚠️  No products found!');
            return;
        }
        
        // Format products
        const formattedProducts = [];
        const categoryCounts = {};
        
        console.log('📦 Processing products...\n');
        
        for (const product of products) {
            const category = determineCategory(product);
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            
            const variants = [];
            let basePrice = 0;
            
            for (const variant of product.variants || []) {
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
                // Get the best image URL
                let imageUrl = 'https://via.placeholder.com/300x400?text=No+Image';
                
                if (product.images && product.images.length > 0) {
                    // Try to find a mockup image first
                    const mockupImage = product.images.find(img => img.src && img.src.includes('mockup'));
                    if (mockupImage) {
                        imageUrl = mockupImage.src;
                    } else if (product.images[0]?.src) {
                        imageUrl = product.images[0].src;
                    }
                }
                
                formattedProducts.push({
                    id: product.id,
                    title: product.title,
                    category: category,
                    description: product.description || '',
                    price: basePrice,
                    image: imageUrl,
                    printifyId: product.id,
                    variants: variants
                });
                
                console.log(`✓ ${product.title} (${category})`);
            }
        }
        
        // Show summary
        console.log('\n📊 Category Summary:');
        for (const [category, count] of Object.entries(categoryCounts)) {
            console.log(`   ${category}: ${count} products`);
        }
        
        // Save to file
        const jsContent = `// Auto-generated from Printify - ${new Date().toISOString()}
// Total products: ${formattedProducts.length}

const printifyProducts = ${JSON.stringify(formattedProducts, null, 2)};

// Category counts:
// ${Object.entries(categoryCounts).map(([k, v]) => `${k}: ${v}`).join('\n// ')}
`;
        
        fs.writeFileSync('printify-products-all.js', jsContent);
        console.log('\n✅ Saved to printify-products-all.js');
        
        // Copy to frontend
        fs.copyFileSync('printify-products-all.js', '../frontend/printify-products.js');
        console.log('✅ Copied to frontend/printify-products.js');
        
        console.log('\n🎉 Sync complete! Refresh your browser to see all products.');
        
    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
    }
}

// Run sync
syncAllProducts();