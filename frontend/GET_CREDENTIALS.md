# Quick Steps to Get Your Supabase Credentials

## Step 1: Get Your Project URL and Anon Key

1. **In your Supabase Dashboard** (where you are now)
2. **Click on "Settings"** (gear icon) in the left sidebar
3. **Click on "API"** in the settings menu

## Step 2: Copy These Two Values

You'll see a page with:

### 1. Project URL
- Look for: **Project URL**
- It looks like: `https://abcdefghijklmnop.supabase.co`
- Click the copy button next to it

### 2. Anon/Public Key  
- Look for: **anon public** 
- It's a long string starting with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Click the copy button next to it

## Step 3: Test Your Connection

1. **Open this file in your browser**:
   `/Users/jade/printify-store/frontend/test-supabase.html`

2. **Paste your credentials**:
   - First box: Paste your Project URL
   - Second box: Paste your Anon Key

3. **Click "Test Connection"**

## What You Should See

Since your bucket is empty, you'll see:
- ✅ Connection successful!
- ✅ eurorackgif bucket found!
- "No files found. Upload some GIF files to the eurorackgif bucket."

## Step 4: Upload a Test File

1. **Go back to Storage** in Supabase
2. **Click on your `eurorackgif` bucket**
3. **Click "Upload files"**
4. **Upload any GIF file** (or even a JPG/PNG for testing)
5. **Go back to test-supabase.html**
6. **Click "Load eurorackgif Bucket"**
7. You should see your image!

## Troubleshooting

If you see "Connection failed":
- Make sure URL starts with `https://`
- Make sure you copied the full Anon Key
- Check that there are no extra spaces

If you see "bucket not found":
- The bucket name must be exactly `eurorackgif`
- Go back to Storage and check the name

Let me know what happens!