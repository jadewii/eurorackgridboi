# 🚀 Quick Setup Checklist - Connect Your Printify Products!

## ✅ Step 1: Get Printify Credentials (5 minutes)

□ Go to [Printify.com](https://printify.com) → Log in  
□ Click your profile (top right) → **Connections**  
□ Click **"Manage API Access"**  
□ Click **"Generate Token"**  
□ Name it: "My Store" → Generate  
□ **COPY THE TOKEN** (starts with `eyJ...`)  
□ Find your **Shop ID** on same page  
□ Keep this tab open!  

## ✅ Step 2: Add Credentials to Your Store (2 minutes)

□ Open file: `backend/.env`  
□ Replace these lines with your actual values:
```
PRINTIFY_API_KEY=paste_your_token_here
PRINTIFY_SHOP_ID=paste_your_shop_id_here
DEMO_MODE=false
```
□ Save the file  

## ✅ Step 3: Sync Your Products (1 minute)

□ In terminal, run:
```bash
cd backend
node sync-printify-products.js
```
□ You'll see all your products being fetched  
□ Check the file `printify-products.js` was created  

## ✅ Step 4: Add Products to Store (2 minutes)

□ Open `backend/printify-products.js`  
□ Copy everything between `const printifyProducts = [` and `];`  
□ Open `frontend/store.js`  
□ Find line with `const sampleProducts = [`  
□ Replace entire sampleProducts array with your printifyProducts  
□ Change line 4: `const DEMO_MODE = false;`  
□ Save the file  

## ✅ Step 5: Restart & Test (1 minute)

□ Stop server (Ctrl+C in terminal)  
□ Start it again:
```bash
npm start
```
□ Refresh your browser  
□ You should see YOUR products!  

## ✅ Step 6: Get Stripe Keys (5 minutes) - For Real Payments

□ Go to [stripe.com](https://stripe.com) → Sign up/Log in  
□ Go to **Developers → API Keys**  
□ Copy **Publishable key** (starts with `pk_`)  
□ Copy **Secret key** (starts with `sk_`)  
□ Add to `backend/.env`:
```
STRIPE_SECRET_KEY=your_secret_key_here
```
□ Update `frontend/store.js` line 3:
```javascript
const STRIPE_PUBLIC_KEY = 'your_publishable_key_here';
```

## 🎯 That's It! Your Store is Live!

### Test Everything:
□ Products load from Printify ✓  
□ Categories filter correctly ✓  
□ Add items to cart ✓  
□ Checkout process works ✓  

### Ready to Launch?
□ Get a domain name ($12/year from Namecheap)  
□ Deploy backend to Render.com (free)  
□ Deploy frontend to Netlify (free)  
□ Point domain to your site  
□ Start selling! 💰  

## 🆘 Troubleshooting

**"No products found"**
- Make sure products are PUBLISHED in Printify
- Check API key is correct
- Verify Shop ID matches

**"Authentication failed"**
- Regenerate your API token
- Make sure you saved .env file
- No extra spaces in the token

**Products showing wrong category**
- Edit the category field in printify-products.js
- Categories: shirts, hoodies, accessories, prints, stickers

## 📞 Still Stuck?

Run this to see what's happening:
```bash
cd backend
cat .env  # Check your keys (hide token when sharing!)
node sync-printify-products.js  # Try syncing again
```

Remember: You're almost there! Just need those API keys! 🎉