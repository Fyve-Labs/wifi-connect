#!/bin/bash

set -e

# Detect system and configure network manager accordingly
export DBUS_SYSTEM_BUS_ADDRESS=unix:path=/host/run/dbus/system_bus_socket

# Function to check if command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Function to detect distribution
detect_distribution() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        echo "$ID"
    elif [ -f /etc/debian_version ]; then
        echo "debian"
    elif [ -f /etc/redhat-release ]; then
        echo "redhat"
    else
        echo "unknown"
    fi
}

DISTRO=$(detect_distribution)
echo "Detected distribution: $DISTRO"

# Check if NetworkManager is installed
if ! command_exists nmcli; then
    echo "NetworkManager is not installed. Installing..."
    
    case "$DISTRO" in
        raspbian|debian|ubuntu)
            apt-get update
            apt-get install -y network-manager
            ;;
        fedora|centos|rhel)
            dnf install -y NetworkManager
            ;;
        alpine)
            apk add networkmanager
            ;;
        *)
            echo "Unsupported distribution for automatic NetworkManager installation."
            echo "Please install NetworkManager manually and try again."
            exit 1
            ;;
    esac
    
    # Enable and start NetworkManager
    if command_exists systemctl; then
        systemctl enable NetworkManager
        systemctl start NetworkManager
    elif command_exists service; then
        service NetworkManager start
    else
        echo "Could not start NetworkManager. Please start it manually."
    fi
fi

# Wait for NetworkManager to be fully functional
if command_exists nmcli; then
    echo "Waiting for NetworkManager to be ready..."
    max_retries=10
    counter=0
    
    while ! nmcli general status &> /dev/null && [ $counter -lt $max_retries ]; do
        echo "NetworkManager not ready yet. Waiting..."
        sleep 2
        counter=$((counter+1))
    done
    
    if [ $counter -eq $max_retries ]; then
        echo "Warning: NetworkManager did not become ready in time."
    else
        echo "NetworkManager is ready."
    fi
fi

# Start wifi-connect with correct permissions
exec ./wifi-connect "$@" 