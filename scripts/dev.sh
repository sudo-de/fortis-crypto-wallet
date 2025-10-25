#!/bin/bash

# Development script to run both backend and frontend

set -e

echo "🚀 Starting Crypto Wallet Development Environment..."

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server
echo "🔧 Starting C++ backend server..."
cd backend/build
./crypto_wallet server &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend development server
echo "🌐 Starting React frontend server..."
cd ../../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Development environment started!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for processes
wait
