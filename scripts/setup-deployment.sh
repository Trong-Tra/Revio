#!/bin/bash
#
# Revio Deployment Setup Script
# Helps configure environment variables for production deployment
#

set -e

echo "🚀 Revio Deployment Setup"
echo "========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in project root (look for backend directory)
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}Error: Please run this script from the project root${NC}"
    echo "  Correct: ./scripts/setup-deployment.sh"
    echo "  Wrong:   cd scripts && ./setup-deployment.sh"
    exit 1
fi

echo "This script will help you set up production environment variables."
echo "You'll need accounts on:"
echo "  - Neon (PostgreSQL)"
echo "  - Cloudflare (R2 Storage)"
echo "  - OpenRouter (Free AI)"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo ""
echo "📋 Step 1: Database (Neon)"
echo "--------------------------"
echo "1. Go to https://neon.tech and create a project"
echo "2. Copy the connection string from Dashboard → Connection Details"
echo ""
read -p "Enter Neon DATABASE_URL: " DATABASE_URL

if [[ ! $DATABASE_URL == postgresql* ]]; then
    echo -e "${YELLOW}Warning: DATABASE_URL should start with 'postgresql://'${NC}"
fi

echo ""
echo "📋 Step 2: Storage (Cloudflare R2)"
echo "----------------------------------"
echo "1. Go to https://dash.cloudflare.com → R2 Object Storage"
echo "2. Create bucket 'revio-papers'"
echo "3. Go to Manage R2 API Tokens → Create API Token"
echo ""
read -p "Enter R2_ENDPOINT (e.g., https://xxx.r2.cloudflarestorage.com): " R2_ENDPOINT
read -p "Enter R2_ACCESS_KEY_ID: " R2_ACCESS_KEY_ID
read -p "Enter R2_SECRET_ACCESS_KEY: " R2_SECRET_ACCESS_KEY

echo ""
echo "📋 Step 3: AI Service (OpenRouter)"
echo "----------------------------------"
echo "1. Go to https://openrouter.ai/keys"
echo "2. Create API Key (free models available)"
echo ""
read -p "Enter OPENROUTER_API_KEY: " OPENROUTER_API_KEY

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | LC_ALL=C tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)

echo ""
echo "📋 Step 4: Frontend URL"
echo "----------------------"
echo "Enter your frontend URL (e.g., https://revio.vercel.app)"
echo "Leave blank to use default: http://localhost:3000"
read -p "FRONTEND_URL: " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-"http://localhost:3000"}

# Create backend .env.production
echo ""
echo "📝 Creating backend/.env.production..."
cat > backend/.env.production << EOF
# Server
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=$DATABASE_URL

# Storage
R2_ENDPOINT=$R2_ENDPOINT
R2_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME=revio-papers

# Authentication
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# AI Services
OPENROUTER_API_KEY=$OPENROUTER_API_KEY
OPENROUTER_MODEL=arcee-ai/trinity-large-preview:free

# CORS
FRONTEND_URL=$FRONTEND_URL
EOF

echo -e "${GREEN}✓ Created backend/.env.production${NC}"

# Create frontend .env.production
echo ""
echo "Enter your backend API URL"
echo "Leave blank to use default: http://localhost:3001"
read -p "VITE_API_URL: " VITE_API_URL
VITE_API_URL=${VITE_API_URL:-"http://localhost:3001/api/v1"}

echo "📝 Creating frontend/.env.production..."
cat > frontend/.env.production << EOF
VITE_API_URL=$VITE_API_URL
EOF

echo -e "${GREEN}✓ Created frontend/.env.production${NC}"

# Create local .env for development (if doesn't exist)
if [ ! -f "backend/.env" ]; then
    echo ""
    echo "📝 Creating backend/.env for development..."
    cp backend/.env.production backend/.env
    # Try to use sed with different syntax for Mac/Linux
    sed -i '' 's/NODE_ENV=production/NODE_ENV=development/' backend/.env 2>/dev/null || sed -i 's/NODE_ENV=production/NODE_ENV=development/' backend/.env 2>/dev/null || true
    echo -e "${GREEN}✓ Created backend/.env${NC}"
fi

echo ""
echo "========================="
echo "✅ Setup Complete!"
echo "========================="
echo ""
echo "Next steps:"
echo ""
echo "1. 🗄️  Run database migration:"
echo "   cd backend && npx prisma migrate deploy"
echo ""
echo "2. 🚀 Deploy backend to Render:"
echo "   - Go to https://render.com"
echo "   - Connect your GitHub repo"
echo "   - Copy variables from backend/.env.production"
echo ""
echo "3. 🎨 Deploy frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repo"
echo "   - Copy variables from frontend/.env.production"
echo ""
echo "📖 Full guide: DEPLOYMENT.md"
echo ""

# Security warning
echo -e "${YELLOW}⚠️  Security Notes:${NC}"
echo "  - Keep .env.production files secret (add to .gitignore)"
echo "  - Never commit API keys to Git"
echo "  - Use strong JWT_SECRET in production"
echo "  - Enable 2FA on all cloud accounts"
echo ""
