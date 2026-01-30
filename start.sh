#!/bin/bash

# Start the Finance Compliance Dashboard
echo "🚀 Starting Finance Compliance Dashboard..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🌐 Starting frontend server..."
npm run dev
