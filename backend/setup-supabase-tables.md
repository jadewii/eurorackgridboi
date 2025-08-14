# Setting Up Database Tables in Your EXISTING Supabase Project

You already have Supabase running at: `https://jqxshcyqxhbmvqrrthxy.supabase.co`

## Steps to add the database:

1. **Go to your Supabase Dashboard**
   - https://app.supabase.com
   - Select your project (jqxshcyqxhbmvqrrthxy)

2. **Go to SQL Editor** (left sidebar)

3. **Copy and paste the database-schema.sql file**
   - It will create all the tables you need
   - Click "Run" 

4. **Enable Row Level Security (RLS)**
   Go to Authentication > Policies and add:
   - Users can only see their own data
   - Public racks are visible to everyone

5. **Get your API keys** (Settings > API)
   - `anon key` - for frontend (safe to expose)
   - `service_role key` - for backend (keep secret!)

## What you already have:
✅ Supabase project running
✅ Storage bucket with all WebP files
✅ Public URLs working

## What this adds:
- User accounts & authentication
- Module ownership tracking  
- Jamnutz balance system
- Purchase history
- Saved racks

## Frontend Connection Example:
```javascript
// In your frontend code
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://jqxshcyqxhbmvqrrthxy.supabase.co',
    'your-anon-key-here'
)

// Check if user owns a module
async function checkOwnership(userId, moduleName) {
    const { data } = await supabase
        .from('user_modules')
        .select('*')
        .eq('user_id', userId)
        .eq('module_name', moduleName)
        .single()
    
    return !!data // true if they own it
}

// Get user's jamnutz balance
async function getBalance(userId) {
    const { data } = await supabase
        .from('users')
        .select('jamnutz_balance')
        .eq('id', userId)
        .single()
    
    return data.jamnutz_balance
}
```

That's it! Your existing Supabase project just needs the database tables added to track everything!