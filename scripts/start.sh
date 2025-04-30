#!/usr/bin/env bash

# Print banner
echo "================================"
echo "WiFi Connect - Starting Up"
echo "================================"

# Show environment variables
echo "Using environment configuration:"
echo "- PORTAL_SSID: ${PORTAL_SSID:-WiFi Connect}"
echo "- RECONNECT_INTERVAL: ${RECONNECT_INTERVAL:-300} seconds"
echo "- ACTIVITY_TIMEOUT: ${ACTIVITY_TIMEOUT:-0} seconds"

# In Docker, we might not have direct access to the host's D-Bus
# Only set this if not already set and if the socket exists
if [ -z "$DBUS_SYSTEM_BUS_ADDRESS" ] && [ -e /host/run/dbus/system_bus_socket ]; then
    export DBUS_SYSTEM_BUS_ADDRESS="unix:path=/host/run/dbus/system_bus_socket"
fi

# Source network functions
source ./start-network.sh

# Source UI verification functions if the script exists
if [ -f ./verify-ui-integration.sh ]; then
    source ./verify-ui-integration.sh
fi

# Check if the UI directory exists and has content
if [ ! -d "./ui" ] || [ -z "$(ls -A ./ui 2>/dev/null)" ]; then
    echo "ERROR: UI directory is missing or empty. WiFi Connect cannot start."
    exit 1
fi

# Optional step - it takes couple of seconds (or longer) to establish a WiFi connection
# sometimes. In this case, following checks will fail and wifi-connect
# will be launched even if the device will be able to connect to a WiFi network.
# If this is your case, you can wait for a while and then check for the connection.
# sleep 15

# Function to check if WiFi is connected
check_wifi_connection() {
    # Try iwgetid if available
    if command -v iwgetid >/dev/null 2>&1; then
        iwgetid -r >/dev/null 2>&1
        local WIFI_CONNECTED=$?
        
        if [ $WIFI_CONNECTED -eq 0 ]; then
            # Double check with internet connectivity
            if check_internet; then
                return 0
            fi
        fi
    else
        # Fallback to just internet check if iwgetid is not available
        if check_internet; then
            return 0
        fi
    fi
    return 1
}

# Start WiFi Connect with configured environment variables
start_wifi_connect() {
    echo "Starting WiFi Connect..."
    
    # Build command with environment variables
    local CMD="./wifi-connect"
    
    # Add access point name if set
    if [ -n "$PORTAL_SSID" ]; then
        CMD="$CMD --portal-ssid \"$PORTAL_SSID\""
    fi
    
    # Add passphrase if set
    if [ -n "$PORTAL_PASSPHRASE" ]; then
        CMD="$CMD --portal-passphrase \"$PORTAL_PASSPHRASE\""
    fi
    
    # Add activity timeout if set
    if [ -n "$ACTIVITY_TIMEOUT" ]; then
        CMD="$CMD --activity-timeout $ACTIVITY_TIMEOUT"
    fi
    
    # Add UI directory
    CMD="$CMD --ui-directory ./ui"
    
    # Log and execute the command
    echo "Executing: $CMD"
    eval "$CMD"
}

# Check if we're online
if check_wifi_connection; then
    echo "WiFi already connected. Skipping WiFi Connect."
else
    # If we're not online, start WiFi Connect
    echo "Network not connected. Starting WiFi Connect."
    start_wifi_connect
fi

# This script should never exit
echo "WiFi Connect completed."

# Keep the container running
while true; do
    sleep 60
    if ! check_wifi_connection; then
        echo "WiFi connection lost. Restarting WiFi Connect."
        start_wifi_connect
    fi
done
