#!/bin/bash

echo "
🚀 QUICK DEPLOY TO NETLIFY
==========================

Since Netlify CLI needs login, here's the MANUAL way:

OPTION 1: DRAG & DROP (FASTEST!)
---------------------------------
1. Open: https://app.netlify.com/drop
2. Drag the 'frontend' folder onto the page
3. DONE! You get a URL instantly!
4. Click 'Site Settings' to add custom domain

OPTION 2: GITHUB DEPLOY
-----------------------
1. Push to GitHub:
   git add .
   git commit -m 'Launch EurorackGrid'
   git push

2. Go to: https://app.netlify.com
3. Click 'Import from Git'
4. Connect GitHub repo
5. Deploy!

OPTION 3: ZIP & UPLOAD
----------------------
1. Zip the frontend folder:
   zip -r eurorackgrid.zip frontend/

2. Go to: https://app.netlify.com/drop
3. Upload the zip file
4. Done!

"

# Create a zip for easy upload
echo "Creating zip file for manual upload..."
cd /Users/jade/eurogrid
zip -r eurorackgrid-deploy.zip frontend/ -x "*.DS_Store" "*/\.git/*"
echo "
✅ Created eurorackgrid-deploy.zip

You can now:
1. Go to https://app.netlify.com/drop
2. Upload eurorackgrid-deploy.zip
3. Your site will be LIVE in seconds!

The URL will be something like:
https://amazing-goldberg-abc123.netlify.app

You can then:
- Add custom domain (eurorackgrid.com)
- Set up environment variables
- Enable form handling

"