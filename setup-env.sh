#!/bin/bash

echo "🚀 Setting up Supabase environment files..."

# Check if Supabase credentials are provided
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
    echo "❌ Missing Supabase credentials!"
    echo "Usage: ./setup-env.sh <SUPABASE_URL> <ANON_KEY> <SERVICE_ROLE_KEY>"
    echo ""
    echo "Example:"
    echo "./setup-env.sh https://abc123.supabase.co eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9... eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    echo ""
    echo "Get these values from your Supabase project dashboard:"
    echo "1. Go to Settings > API"
    echo "2. Copy Project URL, anon key, and service_role key"
    exit 1
fi

SUPABASE_URL=$1
ANON_KEY=$2
SERVICE_ROLE_KEY=$3

# Generate a random JWT secret
JWT_SECRET=$(openssl rand -base64 32)

echo "📝 Creating backend/.env..."
cp backend/env.example backend/.env
sed -i '' "s|https://your-project-ref.supabase.co|$SUPABASE_URL|g" backend/.env
sed -i '' "s|your-anon-key-here|$ANON_KEY|g" backend/.env
sed -i '' "s|your-service-role-key-here|$SERVICE_ROLE_KEY|g" backend/.env
sed -i '' "s|your-jwt-secret-here|$JWT_SECRET|g" backend/.env

echo "📝 Creating frontend/.env..."
cp frontend/env.example frontend/.env
sed -i '' "s|https://your-project-ref.supabase.co|$SUPABASE_URL|g" frontend/.env
sed -i '' "s|your-anon-key-here|$ANON_KEY|g" frontend/.env

echo "✅ Environment files created successfully!"
echo ""
echo "Next steps:"
echo "1. Run the database migration in Supabase SQL Editor"
echo "2. Configure MCP in .cursor/mcp.json with your project ref and access token"
echo "3. Start the development servers:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Frontend: cd frontend && npm run dev"
echo ""
echo "🔧 Don't forget to update other environment variables as needed!" 