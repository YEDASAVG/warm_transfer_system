#!/bin/bash

echo "🚀 Setting up Warm Transfer System..."

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your API keys"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend .env.local file..."
    cp frontend/.env.local.example frontend/.env.local
    echo "✅ Frontend environment file created"
fi

echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your API keys:"
echo "   - LIVEKIT_API_KEY"
echo "   - LIVEKIT_API_SECRET" 
echo "   - LIVEKIT_WS_URL"
echo "   - OPENAI_API_KEY"
echo "   - GROQ_API_KEY"
echo ""
echo "2. Run the development servers:"
echo "   ./scripts/run-dev.sh"