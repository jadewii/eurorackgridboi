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

async function analyzeAllProducts() {
    console.log('📊 ANALYZING YOUR PRINTIFY CATALOG\n');
    console.log('=' .repeat(50));
    
    let allProducts = [];
    let page = 1;
    let hasMore = true;
    
    // Fetch all products
    while (hasMore) {
        try {
            const response = await axios.get(
                `${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/products.json?page=${page}&limit=50`,
                { headers: printifyHeaders }
            );
            
            const products = response.data.data || [];
            
            if (products.length > 0) {
                allProducts = allProducts.concat(products);
                console.log(`📦 Page ${page}: Found ${products.length} products`);
                page++;
                await new Promise(resolve => setTimeout(resolve, 300));
            } else {
                hasMore = false;
            }
            
            if (page > 20) hasMore = false; // Safety limit
        } catch (error) {
            console.error(`Error on page ${page}:`, error.message);
            hasMore = false;
        }
    }
    
    console.log(`\n✅ TOTAL PRODUCTS: ${allProducts.length}\n`);
    console.log('=' .repeat(50));
    
    // Analyze by product type
    const productTypes = {};
    const categorySuggestions = {
        shirts: [],
        hoodies: [],
        accessories: [],
        prints: [],
        stickers: [],
        uncategorized: []
    };
    
    allProducts.forEach(product => {
        const title = product.title.toLowerCase();
        
        // Count product types
        const type = product.type || 'Unknown';
        productTypes[type] = (productTypes[type] || 0) + 1;
        
        // Categorize based on title
        if (title.includes('shirt') || title.includes('tee') || title.includes('tank')) {
            categorySuggestions.shirts.push(product.title);
        } else if (title.includes('hoodie') || title.includes('sweat') || title.includes('crewneck')) {
            categorySuggestions.hoodies.push(product.title);
        } else if (title.includes('mug') || title.includes('bag') || title.includes('tote') || 
                   title.includes('phone') || title.includes('case') || title.includes('hat') ||
                   title.includes('backpack')) {
            categorySuggestions.accessories.push(product.title);
        } else if (title.includes('poster') || title.includes('canvas') || title.includes('print') ||
                   title.includes('pillow')) {
            categorySuggestions.prints.push(product.title);
        } else if (title.includes('sticker') || title.includes('decal') || title.includes('vinyl')) {
            categorySuggestions.stickers.push(product.title);
        } else {
            categorySuggestions.uncategorized.push(product.title);
        }
    });
    
    // Display category breakdown
    console.log('\n📂 SUGGESTED CATEGORIES:\n');
    
    Object.entries(categorySuggestions).forEach(([category, products]) => {
        if (products.length > 0) {
            console.log(`\n${category.toUpperCase()} (${products.length} products):`);
            console.log('-'.repeat(40));
            products.slice(0, 10).forEach(title => {
                console.log(`  • ${title}`);
            });
            if (products.length > 10) {
                console.log(`  ... and ${products.length - 10} more`);
            }
        }
    });
    
    // Show products that need categorization
    if (categorySuggestions.uncategorized.length > 0) {
        console.log('\n⚠️  NEEDS MANUAL CATEGORIZATION:');
        console.log('-'.repeat(40));
        categorySuggestions.uncategorized.forEach(title => {
            console.log(`  • ${title}`);
        });
    }
    
    // Generate organized product list
    const organizedProducts = {
        shirts: [],
        hoodies: [],
        accessories: [],
        prints: [],
        stickers: []
    };
    
    allProducts.forEach(product => {
        const title = product.title.toLowerCase();
        let category = 'accessories'; // default
        
        if (title.includes('shirt') || title.includes('tee') || title.includes('tank')) {
            category = 'shirts';
        } else if (title.includes('hoodie') || title.includes('sweat') || title.includes('crewneck')) {
            category = 'hoodies';
        } else if (title.includes('sticker') || title.includes('decal') || title.includes('vinyl')) {
            category = 'stickers';
        } else if (title.includes('poster') || title.includes('canvas') || title.includes('print') || title.includes('pillow')) {
            category = 'prints';
        }
        
        organizedProducts[category].push({
            id: product.id,
            title: product.title,
            enabled: product.is_enabled !== false
        });
    });
    
    // Save organized list
    const report = `# PRINTIFY PRODUCT ORGANIZATION REPORT
Generated: ${new Date().toISOString()}
Total Products: ${allProducts.length}

## CATEGORY BREAKDOWN

### T-SHIRTS (${organizedProducts.shirts.length})
${organizedProducts.shirts.map(p => `- ${p.title} (${p.enabled ? '✅' : '❌'})`).join('\n')}

### HOODIES (${organizedProducts.hoodies.length})
${organizedProducts.hoodies.map(p => `- ${p.title} (${p.enabled ? '✅' : '❌'})`).join('\n')}

### ACCESSORIES (${organizedProducts.accessories.length})
${organizedProducts.accessories.map(p => `- ${p.title} (${p.enabled ? '✅' : '❌'})`).join('\n')}

### PRINTS (${organizedProducts.prints.length})
${organizedProducts.prints.map(p => `- ${p.title} (${p.enabled ? '✅' : '❌'})`).join('\n')}

### STICKERS (${organizedProducts.stickers.length})
${organizedProducts.stickers.map(p => `- ${p.title} (${p.enabled ? '✅' : '❌'})`).join('\n')}

## RECOMMENDATIONS

1. Add tags in Printify to products for better categorization
2. Consider disabling products you don't want to sell
3. Rename products with category keywords (e.g., "Design Name Tee" for shirts)
4. Group similar products together
`;
    
    fs.writeFileSync('product-organization-report.md', report);
    console.log('\n📄 Full report saved to: product-organization-report.md');
    
    // Show summary
    console.log('\n=' .repeat(50));
    console.log('📈 SUMMARY:');
    console.log(`   • T-Shirts: ${organizedProducts.shirts.length}`);
    console.log(`   • Hoodies: ${organizedProducts.hoodies.length}`);
    console.log(`   • Accessories: ${organizedProducts.accessories.length}`);
    console.log(`   • Prints: ${organizedProducts.prints.length}`);
    console.log(`   • Stickers: ${organizedProducts.stickers.length}`);
    console.log('=' .repeat(50));
    
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Review the product-organization-report.md file');
    console.log('2. Go to Printify and add tags to your products');
    console.log('3. Disable any products you don\'t want to show');
    console.log('4. Run sync-all-paginated.js to update your store');
}

analyzeAllProducts().catch(console.error);