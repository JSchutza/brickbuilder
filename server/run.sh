#!/bin/bash

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing server dependencies..."
  npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo "Creating default .env file..."
  echo "PORT=5000" > .env
  echo "MONGODB_URI=mongodb://localhost:27017/brickbuilder" >> .env
  echo "JWT_SECRET=brickbuilder_jwt_secret" >> .env
  echo "JWT_EXPIRES_IN=1d" >> .env
  echo "Created default .env file. Please update with your MongoDB connection string if needed."
fi

# Start the server
echo "Starting BrickBuilder server..."
npm run dev 