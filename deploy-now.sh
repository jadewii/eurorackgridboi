#!/bin/bash

echo "Deploying Eurorack Images Worker"
echo "================================="
echo ""

cd /Users/jade/eurogrid/frontend

echo "Logging in to Cloudflare..."
wrangler login

echo ""
echo "Deploying worker..."
wrangler deploy --config wrangler-simple.toml

echo ""
echo "Deployment complete!"
echo ""
echo "Your worker will be available at:"
echo "https://eurorack-images.dawlessjammin.workers.dev/api/plant-image?plant_id=p1"
echo ""
echo "Test it with:"
echo "curl https://eurorack-images.dawlessjammin.workers.dev/api/plant-image?plant_id=p1"