# Deployment Instructions for Eurogrid

## Step 1: Run Database Setup

1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy ALL the content from `database-setup.sql`
5. Paste it into the SQL Editor
6. Click "Run" button
7. You should see "Success. No rows returned"

## Step 2: Deploy Edge Functions

### Option A: Using Supabase Dashboard (Easier)

1. Go to your Supabase Dashboard
2. Click on "Edge Functions" in the left sidebar
3. Click "New function"
4. Name it: `get-module-preview`
5. Copy the content from `supabase/functions/get-module-preview/index.ts`
6. Paste it into the editor
7. Click "Deploy"

Repeat for:
- `get-module` 
- `purchase-module`

### Option B: Using Supabase CLI (More Professional)

First install Supabase CLI:
```bash
brew install supabase/tap/supabase
```

Then:
```bash
cd /Users/jade/eurogrid

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref jqxshcyqxhbmvqrrthxy

# Deploy functions
supabase functions deploy get-module-preview
supabase functions deploy get-module
supabase functions deploy purchase-module
```

## Step 3: Test the Setup

1. The database tables are created
2. Edge Functions are deployed
3. Your 17 GIF modules are in the database
4. Ready to test!

## Step 4: Update Frontend

The frontend needs to be updated to use Edge Functions instead of direct storage access.

## Free Tier Limits (You're Safe):

- **Database**: 500MB (you're using ~1KB)
- **Storage**: 1GB (17 GIFs = ~85MB)
- **Edge Functions**: 500,000 invocations/month (plenty)
- **Bandwidth**: 2GB/month (enough for testing)
- **Users**: Unlimited

You're well within free tier limits!