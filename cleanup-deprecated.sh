#!/bin/bash

# 🧹 Cleanup Script - Remove Deprecated Files and Directories
# This script removes old backend infrastructure now that we're using Vercel serverless

echo "🧹 Starting cleanup of deprecated files..."
echo ""

# Function to safely remove files/directories
safe_remove() {
    if [ -e "$1" ]; then
        echo "Removing: $1"
        rm -rf "$1"
    else
        echo "Already removed: $1"
    fi
}

echo "📁 Removing deprecated directories..."

# Remove old backend Express.js server
safe_remove "backend/"

# Remove Netlify functions (replaced by Vercel)
safe_remove "netlify/"

# Remove Docker setup (no longer needed)
safe_remove "docker-compose.yml"
safe_remove "backend/Dockerfile"

# Remove other platform deployment configs
safe_remove "render.yaml"
safe_remove "railway.json"

# Remove old build scripts
safe_remove "setup-env.sh"

echo ""
echo "📋 Deprecated files removed:"
echo "  ❌ backend/ - Express.js server"
echo "  ❌ netlify/ - Netlify functions"
echo "  ❌ docker-compose.yml - Docker setup"
echo "  ❌ render.yaml - Render deployment"
echo "  ❌ railway.json - Railway deployment"
echo ""

echo "✅ Cleanup complete!"
echo ""
echo "🎯 Next steps:"
echo "  1. git add ."
echo "  2. git commit -m 'Clean up deprecated backend infrastructure'"
echo "  3. Deploy to Vercel: vercel"
echo ""
echo "📊 Benefits of this cleanup:"
echo "  🚀 Simpler project structure"
echo "  🎯 Single source of truth for API"
echo "  ⚡ Better performance with serverless"
echo "  💰 Lower costs with pay-per-use"
echo "  🔧 Zero server maintenance"
echo ""

echo "Your project is now fully serverless! 🎉" 