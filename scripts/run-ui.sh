#!/bin/bash

# Helper script for running UI commands from the project root
# Usage: ./.cursor/run-ui.sh [command]
# Examples:
#   ./.cursor/run-ui.sh dev
#   ./.cursor/run-ui.sh build
#   ./.cursor/run-ui.sh lint
#   ./.cursor/run-ui.sh audit

# Ensure script is run from project root
if [ ! -d "ui" ]; then
  echo "Error: Please run this script from the project root"
  exit 1
fi

# Default command
COMMAND=${1:-"dev"}

echo "Running 'npm run $COMMAND' in the UI directory..."
cd ui && npm run $COMMAND

# Check for success
if [ $? -eq 0 ]; then
  echo "Command completed successfully!"
else
  echo "Command failed with error code $?"
  exit 1
fi 