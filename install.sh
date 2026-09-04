#!/bin/bash

# RMAX Mahjong - Complete Installation Script

echo "🎮 RMAX MAHJONG - Real Money Gambling System"
echo "============================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Install Node.js first."
    exit 1
fi

echo "✅ Node.js $(node -v) found"
echo ""

# Backend setup
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ ! -f .env ]; then
    echo "⚠️  Creating .env from example..."
    cp .env.example .env
    echo "📝 IMPORTANT: Edit backend/.env and set your NeonDB connection string!"
fi

echo ""
echo "🗄️  Setting up database..."
echo "Make sure you've configured DATABASE_URL in backend/.env"
read -p "Press Enter to continue with migration..."

npx prisma migrate dev --name init
npx prisma generate

echo ""
echo "👤 Creating admin user..."
node scripts/create-admin.js

cd ..

# Frontend setup
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

if [ ! -f .env ]; then
    echo "⚠️  Creating frontend .env..."
    echo "VITE_API_URL=http://localhost:5000/api" > .env
fi

cd ..

echo ""
echo "✅ Installation complete!"
echo ""
echo "🚀 To start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend && npm run dev"
echo ""
echo "📱 Access at: http://localhost:3000"
echo "🔑 Admin login: username=admin, password=admin123"
echo ""
echo "⚠️  Remember to:"
echo "  1. Set DATABASE_URL in backend/.env"
echo "  2. Set JWT_SECRET in backend/.env"
echo ""
