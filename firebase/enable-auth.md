# Fix Firebase Authentication Error

## The Problem
You're getting "auth/api-key-not-valid" error because Firebase Authentication needs to be enabled and configured.

## Quick Fix Steps:

1. **Go to Firebase Console**
   - https://console.firebase.google.com/project/eurorackgrid/authentication

2. **Enable Email/Password Authentication**
   - Click "Get started" if you see it
   - Go to "Sign-in method" tab
   - Click "Email/Password"
   - Toggle ON the first option (Email/Password)
   - Click "Save"

3. **Add Authorized Domain (if needed)**
   - Still in Authentication section
   - Go to "Settings" tab
   - Under "Authorized domains"
   - Make sure your domain is listed (localhost should be there by default)

4. **That's it!**
   - The authentication should now work
   - Try signing up again on your site

## Alternative: Use the localStorage Version
If you want to skip Firebase setup for now, the site already has a working fallback:
- The `purchase-integration-fixed.js` file uses localStorage
- It works without any setup
- Perfect for testing and demo purposes

Just update your HTML to use the fixed version:
```html
<script src="purchase-integration-fixed.js" defer></script>
```
Instead of:
```html
<script src="purchase-integration.js" defer></script>
```