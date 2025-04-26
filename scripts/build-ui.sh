#!/bin/bash

set -e

echo "Building WiFi Connect UI..."

# Navigate to UI directory
cd ui

# Install Node.js if needed
if ! command -v npm &> /dev/null; then
    echo "Node.js not installed. Installing..."
    apt-get update
    apt-get install -y nodejs npm
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the UI
echo "Building UI..."
npm run build

# Clean up node_modules to reduce size
echo "Cleaning up..."
rm -rf node_modules

echo "UI build completed successfully!" 