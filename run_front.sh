#!/bin/bash

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing client dependencies..."
  npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo "Creating default .env file..."
  echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env
  echo "Created default .env file. Please update if your API is running on a different URL."
fi

# Start the client application
echo "Starting BrickBuilder client..."
npm run dev 