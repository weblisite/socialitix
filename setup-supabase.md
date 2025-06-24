# Supabase MCP Setup Guide

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project name: `socialitix`
5. Enter a strong database password
6. Choose your region (closest to you)
7. Click "Create new project"

## Step 2: Get Your Supabase Credentials

Once your project is created:

1. Go to **Settings > API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **Anon key** (public key, starts with `eyJ...`)
   - **Service role key** (secret key, starts with `eyJ...`)

## Step 3: Create Environment Files

### Backend Environment (.env in backend folder):
```bash
# Create backend/.env file with these values:
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

NODE_ENV=development
PORT=5000
JWT_SECRET=your-jwt-secret-here
```

### Frontend Environment (.env in frontend folder):
```bash
# Create frontend/.env file with these values:
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Run Database Migration

1. Go to your Supabase project dashboard
2. Click on **SQL Editor**
3. Copy the entire contents from `backend/src/database/migrations/001_initial_schema.sql`
4. Paste it into the SQL Editor
5. Click **RUN** to execute the migration

## Step 5: Configure Supabase MCP for Cursor

1. **Get your Project Reference ID**:
   - In Supabase dashboard, go to **Settings > General**
   - Copy the **Reference ID** (short string like `abcdefghij`)

2. **Create Personal Access Token**:
   - Go to https://supabase.com/dashboard/account/tokens
   - Click **Generate new token**
   - Name: `Cursor MCP`
   - Copy the token (starts with `sbp_...`)

3. **Create MCP Configuration**:
   Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=YOUR_PROJECT_REF_ID"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_PERSONAL_ACCESS_TOKEN"
      }
    }
  }
}
```

Replace:
- `YOUR_PROJECT_REF_ID` with your project reference ID
- `YOUR_PERSONAL_ACCESS_TOKEN` with your personal access token

## Step 6: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend  
cd frontend
npm install
```

## Step 7: Test the Setup

1. **Start Backend**:
```bash
cd backend
npm run dev
```

2. **Start Frontend** (in new terminal):
```bash
cd frontend
npm run dev
```

## Step 8: Verify MCP Connection

1. Open Cursor
2. Go to **Settings > MCP**
3. You should see the Supabase server with a green "Active" status
4. Try asking Cursor: "Show me the database schema" or "List all tables"

## Troubleshooting

### Backend Error: "Missing SUPABASE_URL environment variable"
- Make sure you created `backend/.env` with the correct Supabase URL

### Frontend Error: "Cannot find module '@tailwindcss/typography'"
- Run: `cd frontend && npm install @tailwindcss/typography`

### MCP Not Connecting
- Verify your Personal Access Token is correct
- Check that your Project Reference ID is correct
- Restart Cursor after adding the MCP configuration

## Quick Commands

```bash
# Create environment files (run these commands):
echo "SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NODE_ENV=development
PORT=5000" > backend/.env

echo "VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here" > frontend/.env

# Install missing dependency
cd frontend && npm install @tailwindcss/typography

# Create MCP directory and config
mkdir -p .cursor
echo '{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=YOUR_PROJECT_REF_ID"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_PERSONAL_ACCESS_TOKEN"
      }
    }
  }
}' > .cursor/mcp.json
```

Remember to replace the placeholder values with your actual Supabase credentials! 