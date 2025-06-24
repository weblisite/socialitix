echo "🚀 Migrating Socialitix to Vercel..."

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-deps

# Install Vercel CLI if not already installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set your environment variables in Vercel:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo ""
echo "2. Run 'npm run dev' to test locally with Vercel dev server"
echo "3. Run 'npm run deploy' to deploy to production"
echo ""
echo "📚 See VERCEL_DEPLOYMENT.md for detailed instructions" 