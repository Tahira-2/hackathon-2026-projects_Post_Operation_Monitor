#!/bin/bash

echo "🚀 Starting CausalCare AI..."
echo ""

# Check if model exists
if [ ! -f "ml_service/disease_model.pkl" ]; then
    echo "❌ Model not found! Please run setup.sh first"
    exit 1
fi

# Check if database exists
if [ ! -f "database/causalcare.db" ]; then
    echo "❌ Database not found! Please run setup.sh first"
    exit 1
fi

# Start backend in background
echo "🔧 Starting Backend API..."
cd backend
python main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting Frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ CausalCare AI is running!"
echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
