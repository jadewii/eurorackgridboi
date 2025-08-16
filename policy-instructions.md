# Supabase RLS Policy Setup Instructions

## Steps to Enable Access to Private Bucket:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/jqxshcyqxhbmvqrrthxy/storage/buckets

2. Click on "eurorackgif" bucket

3. Click on "Policies" tab (not the Configuration tab)

4. Click "New policy" button

5. Choose "For full customization" option (not from template)

6. Fill in these EXACT values:

   **Policy name:** 
   `Allow anonymous read access`

   **Target roles:** 
   Check only: `anon` (anonymous)

   **WITH CHECK expression:**
   Leave empty (delete any text there)

   **USING expression:**
   ```
   true
   ```

7. Under "Allowed operations" check ONLY:
   - SELECT (for reading)
   - INSERT (might be needed for signed URLs)

8. Click "Review"

9. Click "Save policy"

## Alternative: Make Bucket Public (Simpler)

If the RLS policy doesn't work, you can make the bucket public instead:

1. Go to Storage > eurorackgif bucket
2. Click "Edit bucket" 
3. Toggle "Public bucket" to ON
4. Save

This is simpler but less secure. Since you mentioned this is a paid product, the RLS policy approach is better.

## Verify It's Working

After saving the policy, go back to:
http://localhost:8080/test-policy.html

Click "Test Bucket Access" - you should see 17 files listed.