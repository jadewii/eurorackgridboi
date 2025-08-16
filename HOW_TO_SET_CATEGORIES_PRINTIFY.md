# How to Set Product Categories in Printify

## The Problem
Printify doesn't have built-in categories, but we can use **Tags** or **Product Titles** to organize them!

## Method 1: Using Tags (Recommended)

### In Printify:
1. Go to **My Products**
2. Click on a product (like your t-shirts)
3. Click **Edit Product**
4. Scroll down to **Tags** section
5. Add a tag like: `shirts`, `hoodies`, `accessories`, `prints`, or `stickers`
6. Save the product

### Tag Examples:
- **T-Shirts**: Add tag `shirts`
- **Hoodies/Sweatshirts**: Add tag `hoodies`
- **Mugs/Bags/Phone Cases**: Add tag `accessories`
- **Posters/Canvas**: Add tag `prints`
- **Stickers/Decals**: Add tag `stickers`

## Method 2: Using Product Titles

Name your products with the category at the end:
- "Eurorack Design - Shirt"
- "Synth Cat - Hoodie"
- "Modular - Mug"
- "BT-808 - Poster"

## Method 3: Update the Sync Script

I can modify the sync script to better detect categories:

```javascript
// In sync-printify-products.js, the script looks for:
// - Product type (from Printify's blueprint)
// - Title keywords (shirt, hoodie, mug, etc.)
// - Tags you've added
```

## Quick Fix for Your Current Products

Since you have 50 products already, here's the fastest way:

1. **In Printify**, bulk edit products:
   - Select multiple t-shirts → Add tag "shirts"
   - Select hoodies → Add tag "hoodies"
   - Select accessories → Add tag "accessories"

2. **Re-sync your products**:
   ```bash
   cd backend
   node sync-printify-products.js
   ```

3. **The script will now use your tags!**

## Auto-Detection Keywords

The sync script already looks for these keywords:

### T-Shirts (category: 'shirts')
- "T-Shirt", "Tee", "Softstyle", "Garment-Dyed"

### Hoodies (category: 'hoodies')
- "Hoodie", "Sweatshirt", "Pullover", "Crewneck"

### Accessories (category: 'accessories')
- "Mug", "Tote", "Phone Case", "Hat", "Bag", "Backpack"

### Prints (category: 'prints')
- "Canvas", "Poster", "Print", "Wall Art", "Pillow"

### Stickers (category: 'stickers')
- "Sticker", "Decal", "Kiss-Cut", "Vinyl"

## Your Specific Products

Looking at your products, here's what I noticed:
- **"One O One"** → Should be in shirts (currently accessories)
- **"Batuums Shirt"** → Correctly in shirts ✓
- **"Evil Yami"** → Correctly in shirts ✓
- **"SP404 Backpack"** → Correctly in accessories ✓
- **"BT-808 Poster"** → Correctly in prints ✓

## To Fix Miscategorized Products

Edit `backend/printify-products.js` and change the category:
```javascript
{
  "id": "6896aa7e6eb2dfbdb20a7a19",
  "title": "Copy of One O One",
  "category": "shirts",  // Change from "accessories" to "shirts"
  ...
}
```

Then refresh your browser!

## Pro Tip: Product Naming Convention

For future products, use this naming:
- **[Design Name] Tee** → Auto-detects as shirt
- **[Design Name] Hoodie** → Auto-detects as hoodie
- **[Design Name] Mug** → Auto-detects as accessory
- **[Design Name] Poster** → Auto-detects as print

This way, categories work automatically! 🎯