# How to Organize Multiple Product Types

## ✅ Your Store Now Supports Categories!

I've set up your store to handle multiple product types with easy filtering. Here's how it works:

## Current Categories Available

1. **T-Shirts** - Your main eurorack/synth shirts
2. **Hoodies** - Premium hoodies and sweatshirts  
3. **Accessories** - Mugs, tote bags, phone cases
4. **Art Prints** - Canvas prints, posters
5. **Stickers** - Vinyl stickers, sticker packs

## How Customers Use It

When someone visits your store:
1. They see **ALL products** by default
2. They can click category buttons to filter (T-Shirts, Hoodies, etc.)
3. The page instantly shows only that category
4. Product count updates to show how many items in each category

## Adding Products to Categories

### In Your Code (store.js):
Each product needs a `category` field:

```javascript
{
    id: 'your_product_id',
    title: 'Eurorack Oscillator Shirt',
    category: 'shirts',  // ← This determines the category!
    price: 29.99,
    // ... rest of product info
}
```

### Category Values to Use:
- `'shirts'` - For all t-shirts
- `'hoodies'` - For hoodies and sweatshirts
- `'accessories'` - For mugs, bags, phone cases
- `'prints'` - For posters, canvas prints
- `'stickers'` - For stickers

## Setting Up Your Product Mix

### Recommended Starting Lineup:

**T-Shirts (Your Main Focus)**
- 5-10 different eurorack/synth designs
- Multiple color options per design
- Sizes S-3XL

**Hoodies (Higher Profit)**
- 3-5 of your best designs
- Great for cold studios!
- $45-55 price point

**Accessories (Easy Add-ons)**
- Coffee mugs with synth jokes
- Tote bags for carrying cables
- Phone cases with module designs

**Stickers (Impulse Buys)**
- Individual synth brand parodies
- Patch point labels
- "No Input" warning stickers

## How to Add Products from Printify

### Method 1: Automatic Sync
1. In Printify, add tags to your products:
   - Tag shirts with "shirts"
   - Tag hoodies with "hoodies"
   - etc.
2. Run the sync script:
   ```bash
   cd backend
   node sync-products.js
   ```

### Method 2: Manual Setup
1. Get your product info from Printify
2. Edit `frontend/store.js`
3. Add to the correct category section:

```javascript
// Example: Adding a new eurorack shirt
{
    id: 'printify_123456',
    title: 'VCO Life T-Shirt',
    category: 'shirts',  // Important!
    price: 27.99,
    image: 'your-product-image-url',
    printifyId: 'printify_123456',
    variants: [
        { id: 'v1', name: 'Small - Black' },
        { id: 'v2', name: 'Medium - Black' },
        // etc.
    ]
}
```

## Managing Different Product Types

### Different Base Costs
- T-Shirts: ~$8-12 base cost → Sell for $25-30
- Hoodies: ~$20-25 base cost → Sell for $45-55
- Mugs: ~$7-9 base cost → Sell for $15-20
- Stickers: ~$2-3 base cost → Sell for $5-10

### Different Shipping Times
- Apparel: 3-5 business days
- Accessories: 4-7 business days
- Stickers: 2-3 business days

## Smart Product Strategy

### Start Small
Begin with:
- 5 t-shirt designs
- 2 hoodie designs
- 2 accessories
- 1 sticker pack

### Test What Works
- See which categories sell best
- Add more products to popular categories
- Remove underperforming items

### Seasonal Considerations
- **Summer**: Focus on t-shirts, stickers
- **Winter**: Push hoodies, long sleeves
- **Holidays**: Gift sets, bundles

## Creating Product Bundles

You can create "bundle" products in Printify:
1. "Starter Pack" - Shirt + Stickers
2. "Studio Essentials" - Hoodie + Mug + Tote
3. "Gift Set" - 2 Shirts + Accessories

## FAQ

**Q: Can I add more categories?**
A: Yes! Just add new buttons in index.html and update the filter function.

**Q: Can products be in multiple categories?**
A: Currently one category per product, but you could modify the code to support multiple.

**Q: How do I remove a category?**
A: Just remove the button from index.html and stop adding products to that category.

**Q: Should I show prices in different currencies?**
A: You can add a currency switcher later if you get international customers.

## Next Steps

1. **Decide your product mix** - Which categories to focus on
2. **Create your designs** - Upload to Printify
3. **Set your prices** - Remember to factor in your profit margin
4. **Test the filters** - Make sure categories work smoothly
5. **Launch!** - Start with a few products, add more as you grow

## Pro Tips

- **Hero Products**: Put your best sellers in multiple formats (shirt, hoodie, mug)
- **Limited Editions**: Create seasonal or limited designs to drive urgency
- **Cross-Sell**: Suggest accessories when someone buys apparel
- **Bundle Deals**: Offer discounts for multiple items

Remember: You're not locked into anything! Add/remove categories and products anytime based on what sells! 🚀