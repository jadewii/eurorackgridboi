# FIREBASE TEST SETUP - NOT THE REAL SITE!

## ⚠️ IMPORTANT: This does NOT touch your main site!

Your actual site files are safe:
- `/eurogrid/frontend/starters.html` ✅ UNTOUCHED
- All your racks and designs ✅ SAFE
- Your WebP animations ✅ STILL WORKING

## What this folder is:
Just a TEST environment to set up:
1. User authentication (login/signup)
2. Module ownership tracking
3. Jamnutz balance system
4. Payment processing

## Once it works here, we'll:
1. Take ONLY the auth/payment code
2. Add it to your existing starters.html
3. Keep your design EXACTLY the same
4. Just add login button and purchase functionality

## To test this:
1. Set up Firebase (instructions below)
2. Open `/firebase/index.html` in browser
3. Test login and purchases work
4. Then we integrate into your real site

---

# Firebase Setup Instructions

## Step 1: Create Firebase Project
1. Go to: https://console.firebase.google.com
2. Click "Add Project"
3. Name: `eurorack-grid`
4. Disable Google Analytics
5. Create Project

## Step 2: Enable Authentication
1. In Firebase Console → Authentication
2. Click "Get Started"
3. Enable "Email/Password"
4. Enable "Google" (optional but nice)

## Step 3: Create Firestore Database
1. In Firebase Console → Firestore Database
2. Click "Create Database"
3. Start in "Test Mode" (we'll secure later)
4. Choose your region

## Step 4: Get Your Config
1. Click gear ⚙️ → Project Settings
2. Scroll to "Your apps"
3. Click "</>" Web button
4. Register app name: "eurorack-web"
5. Copy the config

## Step 5: Add Config to firebase-config.js
Replace the placeholder in firebase-config.js with your real config.

That's it! The test environment will work.