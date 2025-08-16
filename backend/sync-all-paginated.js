const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const PRINTIFY_API_URL = 'https://api.printify.com/v1';

const printifyHeaders = {
    'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
    'Content-Type': 'application/json'
};

// Better category detection
function determineCategory(product) {
    const title = product.title.toLowerCase();
    const tags = product.tags || [];
    
    // Check tags first (if you've added them in Printify)
    for (const tag of tags) {
        const tagLower = tag.toLowerCase();
        if (tagLower === 'shirts' || tagLower === 'apparel') return 'shirts';
        if (tagLower === 'hoodies') return 'hoodies';
        if (tagLower === 'home') return 'home';
        if (tagLower === 'accessories') return 'accessories';
        if (tagLower === 'prints') return 'prints';
        if (tagLower === 'stickers') return 'stickers';
    }
    
    // Check title keywords
    if (title.match(/\b(shirt|tee|tank|jersey)\b/)) return 'shirts';
    if (title.match(/\b(hoodie|sweat|crew|pullover)\b/)) return 'hoodies';
    if (title.match(/\b(blanket|pillow|rug|tapestry|curtain)\b/)) return 'home';
    if (title.match(/\b(sticker|decal|vinyl|kiss-cut)\b/)) return 'stickers';
    if (title.match(/\b(poster|canvas|print|art)\b/) && !title.includes('shirt')) return 'prints';
    if (title.match(/\b(mug|cup|bottle|tumbler|bag|tote|case|phone|hat|cap|backpack)\b/)) return 'accessories';
    
    // Default
    return 'accessories';
}

async function syncAllPaginated() {
    console.log('🔄 Syncing ALL products from Printify...\n');
    
    let allProducts = [];
    let page = 1;
    let hasMore = true;
    
    // Fetch ALL pages
    while (hasMore) {
        try {
            console.log(`📦 Fetching page ${page}...`);
            
            const response = await axios.get(
                `${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/products.json?page=${page}&limit=50`,
                { headers: printifyHeaders }
            );
            
            const products = response.data.data || [];
            
            if (products.length > 0) {
                allProducts = allProducts.concat(products);
                console.log(`   ✓ Found ${products.length} products`);
                page++;
                await new Promise(resolve => setTimeout(resolve, 200));
            } else {
                hasMore = false;
            }
            
            if (page > 20) hasMore = false; // Safety
        } catch (error) {
            console.error(`Error on page ${page}:`, error.message);
            hasMore = false;
        }
    }
    
    console.log(`\n✅ Total products fetched: ${allProducts.length}\n`);
    
    // Process and format products
    const formattedProducts = [];
    const categoryCounts = {};
    
    for (const product of allProducts) {
        const category = determineCategory(product);
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        
        // Get enabled variants
        const variants = [];
        let basePrice = 999999;
        
        for (const variant of product.variants || []) {
            if (variant.is_enabled) {
                const price = variant.price / 100;
                if (price < basePrice) {
                    basePrice = price;
                }
                
                variants.push({
                    id: variant.id.toString(),
                    name: variant.title,
                    price: price
                });
            }
        }
        
        // Skip if no enabled variants
        if (variants.length === 0) continue;
        
        // Get best image
        let imageUrl = 'https://via.placeholder.com/400x400?text=No+Image';
        if (product.images && product.images.length > 0) {
            const mockup = product.images.find(img => img.src && img.src.includes('mockup'));
            imageUrl = mockup ? mockup.src : (product.images[0]?.src || imageUrl);
        }
        
        formattedProducts.push({
            id: product.id,
            title: product.title,
            category: category,
            price: basePrice,
            image: imageUrl,
            printifyId: product.id,
            variants: variants.slice(0, 30) // Limit variants
        });
    }
    
    console.log('📊 Category Distribution:');
    Object.entries(categoryCounts).forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} products`);
    });
    
    // Save all products to single file
    const jsContent = `// Printify Products - ${new Date().toISOString()}
// Total: ${formattedProducts.length} products

const printifyProducts = ${JSON.stringify(formattedProducts, null, 2)};

// Category counts:
// ${Object.entries(categoryCounts).map(([k, v]) => `${k}: ${v}`).join(', ')}
`;
    
    fs.writeFileSync('all-products.js', jsContent);
    fs.copyFileSync('all-products.js', '../frontend/printify-products.js');
    
    console.log('\n✅ All products saved!');
    console.log('📁 Files created:');
    console.log('   • backend/all-products.js');
    console.log('   • frontend/printify-products.js');
    
    // Also create paginated files (50 per page)
    const PRODUCTS_PER_PAGE = 50;
    const totalPages = Math.ceil(formattedProducts.length / PRODUCTS_PER_PAGE);
    
    console.log(`\n📄 Creating ${totalPages} page files...`);
    
    for (let i = 0; i < totalPages; i++) {
        const start = i * PRODUCTS_PER_PAGE;
        const end = start + PRODUCTS_PER_PAGE;
        const pageProducts = formattedProducts.slice(start, end);
        
        const pageContent = `const productsPage${i + 1} = ${JSON.stringify(pageProducts, null, 2)};`;
        fs.writeFileSync(`products-page-${i + 1}.js`, pageContent);
    }
    
    console.log(`✅ Created ${totalPages} page files`);
    console.log('\n🎉 Sync complete! Refresh your browser.');
}

syncAllPaginated().catch(console.error);