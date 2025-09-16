#!/bin/bash

echo "🚀 Starting Warm Transfer System Development Servers..."

# Function to run backend
run_backend() {
    echo "Starting backend server..."
    cd backend
    python main.py
}

# Function to run frontend  
run_frontend() {
    echo "Starting frontend server..."
    cd frontend
    npm run dev
}

# Check if we're in the right directory
if [ ! -f "backend/main.py" ] || [ ! -f "frontend/package.json" ]; then
    echo "❌ Please run this script from the warm-transfer-system root directory"
    exit 1
fi

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "❌ Backend .env file not found. Please run ./scripts/setup.sh first"
    exit 1
fi

# Start both servers in background
echo "🖥️  Starting backend server on http://localhost:8000"
run_backend &
BACKEND_PID=$!

sleep 3

echo "🌐 Starting frontend server on http://localhost:3000"
run_frontend &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting..."
echo "📝 Backend API: http://localhost:8000"
echo "📝 API Docs: http://localhost:8000/docs"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait