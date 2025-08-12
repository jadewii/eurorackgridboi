# How to Set Up Your Printify Products

## Understanding How This Works (Simple Version!)

Think of this setup like having two parts:
1. **Your Store** (the website customers see)
2. **Printify** (handles printing and shipping)

When someone buys from your store, it automatically tells Printify to make and ship the product. You don't touch anything!

## Step 1: Choose Your Products in Printify

1. **Log into Printify** at printify.com
2. Click "Catalog" to see all available products
3. For Eurorack shirts, search for "T-Shirt" or "Unisex"
4. Popular choices:
   - Bella + Canvas 3001 (most popular, soft)
   - Gildan 64000 (budget-friendly)
   - Next Level 3600 (premium feel)

## Step 2: Add Your Designs

1. Click on a product you like
2. Upload your Eurorack designs (PNG or JPG, at least 300 DPI)
3. Position your design on the shirt
4. Choose which colors you want to offer
5. Click "Save Product"

## Step 3: Set Your Prices

1. In Printify, go to "My Products"
2. Click on your product
3. You'll see the base cost (what Printify charges you)
4. Set your selling price (typically 2-3x the base cost)
   - Example: Base cost $12 → You sell for $25-30

## Step 4: Get Your Product IDs

This is how your website knows which products to show:

1. In Printify, go to "My Products"
2. Click on a product
3. Look in the URL - you'll see something like: `printify.com/app/products/12345678`
4. That number (12345678) is your Product ID
5. Write these down for each product!

## Step 5: Connect Products to Your Store

### Easy Way (Automatic):
1. Run the sync script:
   ```bash
   cd backend
   node sync-products.js
   ```
2. This will fetch all your Printify products automatically!

### Manual Way:
1. Edit `frontend/store.js`
2. Find the `sampleProducts` section
3. Replace with your products:
   ```javascript
   const sampleProducts = [
       {
           id: 'your_product_id_here',
           title: 'Your Eurorack Shirt Name',
           price: 29.99,  // Your selling price
           image: 'URL_to_product_image',
           printifyId: 'printify_product_id',
           variants: [
               { id: 'variant_id', name: 'Small - Black' },
               // Add all sizes/colors
           ]
       }
   ];
   ```

## What Products Should You Start With?

For Eurorack/synth enthusiasts, consider:

1. **Basic Logo Tees** ($25-30)
   - Your brand logo
   - Simple, clean designs
   - Multiple color options

2. **Technical Diagram Shirts** ($30-35)
   - Circuit diagrams
   - Module layouts
   - Patch cable art

3. **Funny Synth Sayings** ($25-30)
   - "No Filter"
   - "Modular Not Moderation"
   - "Patch Cable Management? Never Heard of It"

4. **Hoodies** ($45-55)
   - Same designs as shirts
   - Great profit margins
   - Popular in winter

## How to Decide Which Products to Show

Start small! Choose:
- 4-6 best designs
- 2-3 product types (shirts, hoodies, maybe mugs)
- Most popular colors (black, white, gray)

You can always add more later!

## Setting Up Categories (Optional)

If you want different pages for different products:
1. Create separate HTML files (eurorack-shirts.html, accessories.html)
2. Copy the main index.html structure
3. Filter products by category in the JavaScript

## Testing Your Products

1. Start your store in demo mode
2. Try adding products to cart
3. Go through checkout (won't charge anything in demo)
4. Make sure everything looks good
5. When ready, add real API keys!

## Pro Tips

- **Start with Print-on-Demand classics**: T-shirts and hoodies have best profit margins
- **Use mockup images**: Printify provides these automatically
- **Price competitively**: Check what similar stores charge
- **Quality over quantity**: Better to have 5 great designs than 50 mediocre ones

## Common Questions

**Q: How much money do I need to start?**
A: $0! Printify only charges when someone buys. You just need to pay for your domain/hosting.

**Q: What if a product is out of stock?**
A: Printify automatically handles this and won't let customers order unavailable items.

**Q: Can I change products later?**
A: Yes! Add, remove, or modify products anytime in Printify.

**Q: How do I handle returns?**
A: Set your return policy. Printify handles defective products, you handle "changed my mind" returns.

## Next Steps

1. Create 3-5 products in Printify
2. Get your API keys
3. Run the store in demo mode to test
4. When happy, switch to live mode
5. Start promoting your store!

Remember: You're not stuck with Wix anymore! This is YOUR store that YOU control! 🎉