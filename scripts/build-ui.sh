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

# Build the UI with static export
echo "Building UI with static export..."
npm run build

# Verify the output directory exists
if [ -d "out" ]; then
    echo "Static export generated successfully in 'out' directory"
    
    # Create a build directory if it doesn't exist
    mkdir -p build
    
    # Move contents from 'out' to 'build' to maintain compatibility with existing code
    cp -r out/* build/
    
    # Ensure static directory structure in build
    mkdir -p build/static/img build/static/css build/static/js
    
    # Copy static assets from public to build/static if needed
    if [ -d "public/static" ]; then
        echo "Copying static assets to build directory..."
        cp -r public/static/* build/static/
    fi
    
    echo "Copied static export to build directory for backend to serve"
else
    echo "Warning: 'out' directory not found after build, checking if content is in 'build'"
    if [ ! -d "build" ]; then
        echo "Error: No static build found. Build process may have failed."
        exit 1
    fi
fi

# Clean up node_modules to reduce size
echo "Cleaning up..."
rm -rf node_modules

echo "UI build completed successfully!" 