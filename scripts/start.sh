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
echo "- CONNECTIVITY_PING_ADDRESS: ${CONNECTIVITY_PING_ADDRESS:-8.8.8.8}"
echo "- CONNECTIVITY_CHECK_INTERVAL: ${CONNECTIVITY_CHECK_INTERVAL:-300} seconds"

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
    
    # Pre-flight checks
    if is_wifi_connect_running; then
        echo "WiFi Connect is already running, stopping existing instance..."
        pkill -f "wifi-connect" 2>/dev/null || true
        sleep 3
    fi
    
    # Ensure port 80 is available
    if ! is_port_80_available; then
        echo "Port 80 is not available, cleaning up..."
        cleanup_network_services
        sleep 2
        
        if ! is_port_80_available; then
            echo "ERROR: Unable to free port 80. Attempting to restore last connection..."
            if restore_last_connection; then
                echo "Successfully restored last connection. WiFi Connect not needed."
                return 0
            else
                echo "ERROR: Failed to restore connection and port 80 is still blocked."
                return 1
            fi
        fi
    fi
    
    # Setup network services (dnsmasq, etc.)
    if ! setup_network_services; then
        echo "ERROR: Failed to setup network services. Attempting to restore last connection..."
        cleanup_network_services
        if restore_last_connection; then
            echo "Successfully restored last connection. WiFi Connect not needed."
            return 0
        else
            echo "ERROR: Failed to setup network services and restore connection."
            return 1
        fi
    fi
    
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
    
    # Execute with timeout and error handling
    local WIFI_CONNECT_RESULT=0
    timeout 30 eval "$CMD" || WIFI_CONNECT_RESULT=$?
    
    # Handle different failure scenarios
    if [ $WIFI_CONNECT_RESULT -ne 0 ]; then
        echo "WiFi Connect failed with exit code: $WIFI_CONNECT_RESULT"
        
        # Cleanup any leftover processes/services
        cleanup_network_services
        
        # Specific error handling based on exit code
        case $WIFI_CONNECT_RESULT in
            17) # Port binding error (StartHTTPServer)
                echo "Port binding error detected. Attempting cleanup and restoration..."
                ;;
            3) # Dnsmasq error
                echo "DNS service error detected. Attempting cleanup and restoration..."
                ;;
            124) # Timeout
                echo "WiFi Connect startup timed out. Attempting cleanup and restoration..."
                ;;
            *) # Other errors
                echo "General WiFi Connect error. Attempting cleanup and restoration..."
                ;;
        esac
        
        # Attempt to restore last connection
        if restore_last_connection; then
            echo "Successfully restored last connection after WiFi Connect failure."
            return 0
        else
            echo "Failed to restore connection after WiFi Connect failure."
            return 1
        fi
    fi
    
    echo "WiFi Connect started successfully."
    return 0
}

# Enhanced connectivity check with better error handling
enhanced_connectivity_check() {
    echo "Performing enhanced connectivity check..."
    
    # First, quick check if we're already connected
    if check_wifi_connection; then
        echo "WiFi connectivity confirmed."
        return 0
    fi
    
    # If no connectivity, try to restore last connection first
    echo "No connectivity detected. Attempting to restore last connection..."
    if restore_last_connection; then
        # Wait a moment for connection to establish
        sleep 10
        if check_wifi_connection; then
            echo "Successfully restored connectivity."
            return 0
        fi
    fi
    
    echo "No connectivity available."
    return 1
}

# Check if we're online
if enhanced_connectivity_check; then
    echo "WiFi already connected. Skipping WiFi Connect."
else
    # If we're not online, start WiFi Connect with error handling
    echo "Network not connected. Starting WiFi Connect."
    if ! start_wifi_connect; then
        echo "CRITICAL: WiFi Connect failed to start and unable to restore connectivity."
        echo "The system may be in an unrecoverable state."
        # Continue to monitoring loop - maybe connectivity will return
    fi
fi

# This script should never exit
echo "WiFi Connect completed."

# Keep the container running
CHECK_INTERVAL=${CONNECTIVITY_CHECK_INTERVAL:-300}
echo "Starting monitoring loop with ${CHECK_INTERVAL}s intervals..."

while true; do
    sleep $CHECK_INTERVAL
    echo "Checking connectivity status..."
    
    if ! enhanced_connectivity_check; then
        echo "WiFi connection lost. Attempting recovery..."
        
        # First try to restore last connection
        if restore_last_connection; then
            echo "Successfully restored connection via NetworkManager."
            sleep 10  # Give connection time to stabilize
            if check_wifi_connection; then
                echo "Connection restored and stable."
                continue
            fi
        fi
        
        # If restore failed, try WiFi Connect
        echo "NetworkManager restore failed. Starting WiFi Connect..."
        if ! start_wifi_connect; then
            echo "WARNING: WiFi Connect failed to start. Will retry in next cycle."
            # Clean up any stuck processes
            cleanup_network_services
        else
            echo "WiFi Connect started successfully."
        fi
    else
        echo "Connectivity check passed."
    fi
done
