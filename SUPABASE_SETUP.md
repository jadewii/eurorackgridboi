# Supabase Storage Setup Instructions

## Steps to fix the broken images:

### Option 1: Create folder structure in eurogrid bucket
1. Click on the `eurogrid` bucket
2. Click "Upload files" or similar button
3. Create these folders:
   - `modules` folder
   - Inside `modules`, create `art` folder
   - Inside `modules`, create `live` folder  
   - Back at root, create `icons` folder

4. Upload your files:
   - Upload 01.png through 36.png to `eurogrid/modules/art/`
   - Upload 01.gif through 17.gif to `eurogrid/modules/live/`
   - Upload jacknut.png to `eurogrid/icons/`

### Option 2: Keep using existing buckets (simpler for now)
If you want to keep using your existing buckets (eurorackgif, eurorackart, icons), I can revert the code back to use those paths instead.

## Current Issue:
The code is looking for:
- `/storage/v1/object/public/eurogrid/modules/art/01.png` (etc.)
- `/storage/v1/object/public/eurogrid/modules/live/01.gif` (etc.)
- `/storage/v1/object/public/eurogrid/icons/jacknut.png`

But your files are currently in:
- `/storage/v1/object/public/eurorackart/01.png`
- `/storage/v1/object/public/eurorackgif/01.gif`
- `/storage/v1/object/public/icons/jacknut.png` (if uploaded)

Let me know which option you prefer:
1. Create the folder structure in eurogrid bucket (better long-term)
2. Revert code to use existing buckets (quicker fix)