#!/bin/bash

echo "
🚀 CLOUDFLARE R2 SETUP - The Smart Way
======================================

1. CREATE R2 BUCKET:
-------------------
- Go to: https://dash.cloudflare.com/sign-up/r2
- Create bucket: 'eurorackgrid-modules'
- Enable public access
- Note your account ID

2. UPLOAD MODULES WITH HASHED NAMES:
------------------------------------
# Instead of: module1.webp
# Use: 7f3a8b_function-synth.webp (hash prefix prevents guessing)

3. USE TRANSFORM URLs (futureproof!):
-------------------------------------
Instead of: https://eurorackgrid.r2.dev/modules/module.webp
Use: https://eurorackgrid.r2.dev/cdn-cgi/image/width=300,format=webp/modules/7f3a8b_module.webp

This gives you:
✅ Auto WebP conversion
✅ Responsive sizing
✅ Edge caching
✅ Can add signed URLs later without changing frontend
"