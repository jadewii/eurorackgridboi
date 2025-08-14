# Firebase Setup for EURORACK.GRID (10 minutes!)

## Why Firebase over Supabase:
- ✅ Actually works and doesn't crash
- ✅ Google's infrastructure (super reliable)
- ✅ Generous free tier (50K reads/day, 20K writes/day)
- ✅ Built-in auth that just works
- ✅ Real-time updates for rack building

## Step 1: Create Firebase Project (2 min)

1. Go to: https://console.firebase.google.com
2. Click "Create Project"
3. Name it: `eurorack-grid`
4. Disable Google Analytics (you don't need it)
5. Click "Create"

## Step 2: Enable Services (1 min)

In your Firebase Console:

1. **Authentication** (left sidebar)
   - Click "Get Started"
   - Enable "Email/Password" provider
   - Enable "Google" provider (optional, but nice)

2. **Firestore Database** (left sidebar)
   - Click "Create Database"
   - Choose "Start in test mode" (we'll secure it later)
   - Pick location closest to you

## Step 3: Get Your Config (1 min)

1. Click the gear icon → "Project Settings"
2. Scroll down to "Your apps"
3. Click "</>" (Web app)
4. Name it "eurorack-web"
5. Copy the config object:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## Step 4: Your Database Structure

```
Firestore Collections:

users/
  userId/
    - email
    - username
    - jamnutz_balance: 1000
    - subscription_tier: "free" | "monthly" | "yearly"
    - subscription_expires: timestamp
    - created_at: timestamp

modules/
  moduleId/
    - name: "Function Synthesizer"
    - price_usd: 5
    - price_jamnutz: 500
    - static_url: "https://cdn.../function-static.png"
    - animated_url: "https://cdn.../function-animated.webp"
    - is_exclusive: false

ownership/
  userId/
    modules/
      moduleId/
        - purchased_at: timestamp
        - purchase_method: "cash" | "jamnutz"

user_racks/
  rackId/
    - user_id: userId
    - name: "My Acid Rack"
    - case_size: "12U"
    - case_color: "black" (locked to subscribers)
    - modules: [
        {slot: 0, module_id: "..."},
        {slot: 1, module_id: "..."}
      ]
    - is_public: true
    - created_at: timestamp

subscriptions/
  userId/
    - tier: "monthly" | "yearly"
    - unlocked_colors: ["pink", "gold", "rainbow"]
    - unlocked_sizes: ["18U", "24U", "MEGA"]
    - exclusive_modules: ["module1", "module2"]
```

## Step 5: Quick Test HTML

Save this as `firebase-test.html` and open it:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Firebase Test</title>
</head>
<body>
    <h1>Firebase Connection Test</h1>
    <div id="status">Connecting...</div>
    
    <script type="module">
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
        import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
        import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
        
        // YOUR CONFIG HERE
        const firebaseConfig = {
            // Paste your config from Step 3
        };
        
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        
        // Test connection
        signInAnonymously(auth).then(() => {
            document.getElementById('status').innerHTML = '✅ Connected to Firebase!';
            
            // Test write
            addDoc(collection(db, 'test'), {
                message: 'Hello from Eurorack!',
                timestamp: new Date()
            }).then(() => {
                document.getElementById('status').innerHTML += '<br>✅ Database write successful!';
            });
        });
    </script>
</body>
</html>
```

## What About Your WebP Files?

For now, you can:
1. **Leave them on Supabase storage** (it's working, just slow)
2. **Move to Cloudflare R2 later** (way faster, but Firebase is priority)
3. **Or upload to Firebase Storage** (also works great)

## Next Steps:

Once Firebase is connected:
1. ✅ Build login/signup page
2. ✅ Create module inventory page  
3. ✅ Build rack builder with drag-drop
4. ✅ Connect Stripe for payments
5. ✅ Add subscription tiers

Firebase will be SO much more stable than Supabase! Want me to help you through the setup?