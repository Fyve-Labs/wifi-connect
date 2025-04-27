#!/usr/bin/env bash

# In Docker, we might not have direct access to the host's D-Bus
# Only set this if not already set and if the socket exists
if [ -z "$DBUS_SYSTEM_BUS_ADDRESS" ] && [ -e /host/run/dbus/system_bus_socket ]; then
    export DBUS_SYSTEM_BUS_ADDRESS=unix:path=/host/run/dbus/system_bus_socket
fi

# Source network functions
source ./start-network.sh

# Source UI verification functions if the script exists
if [ -f ./verify-ui-integration.sh ]; then
    source ./verify-ui-integration.sh
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

# Function to start wifi-connect captive portal
start_wifi_connect() {
    echo "Starting WiFi Connect captive portal..."
    
    # Check if already running
    if is_wifi_connect_running; then
        echo "wifi-connect is already running, not starting a new instance"
        return 0
    fi
    
    # Verify UI integration
    if type verify_ui_backend_integration >/dev/null 2>&1; then
        verify_ui_backend_integration
        if [ $? -ne 0 ]; then
            echo "WARNING: UI integration check failed. The captive portal UI may not function correctly."
        fi
    fi
    
    # Set up required network services
    setup_network_services
    
    # Start the wifi-connect application with error handling
    if [ -x ./wifi-connect ]; then
        ./wifi-connect &
        WIFI_CONNECT_PID=$!
        echo "WiFi Connect started with PID: $WIFI_CONNECT_PID"
        
        # Wait a moment for the portal to initialize
        sleep 5
        
        # Check if process is still running after 5 seconds
        if kill -0 $WIFI_CONNECT_PID 2>/dev/null; then
            echo "WiFi Connect is running"
            
            # Verify the portal is working
            verify_captive_portal
            if [ $? -eq 0 ]; then
                echo "Captive portal verified working correctly"
                
                # Verify captive portal redirection if the function exists
                if type verify_captive_portal_redirect >/dev/null 2>&1; then
                    verify_captive_portal_redirect
                    if [ $? -ne 0 ]; then
                        echo "WARNING: Captive portal redirection may not be working correctly."
                        echo "Users might not be automatically redirected to the portal."
                    fi
                fi
            else
                echo "Warning: Captive portal may not be working properly"
            fi
        else
            echo "ERROR: WiFi Connect failed to start or crashed immediately"
            # Log any output that might help debugging
            echo "Check logs for errors"
            WIFI_CONNECT_PID=""
        fi
    else
        echo "ERROR: wifi-connect binary not found or not executable"
    fi
}

# Function to kill the captive portal if it's running
kill_wifi_connect() {
    if [ ! -z "$WIFI_CONNECT_PID" ] && kill -0 $WIFI_CONNECT_PID 2>/dev/null; then
        echo "Stopping previous WiFi Connect instance (PID: $WIFI_CONNECT_PID)"
        kill $WIFI_CONNECT_PID 2>/dev/null || true
        WIFI_CONNECT_PID=""
        
        # Give it a moment to shut down
        sleep 2
    elif is_wifi_connect_running; then
        echo "Stopping any running wifi-connect instances"
        pkill -f "wifi-connect" || true
        WIFI_CONNECT_PID=""
        
        # Give it a moment to shut down
        sleep 2
    fi
}

echo "Starting WiFi monitoring service..."

# Initial connection check
if check_wifi_connection; then
    echo "WiFi is already connected. Monitoring for disconnections."
    # Make sure no captive portal is running
    kill_wifi_connect
else
    echo "No WiFi connection detected. Starting captive portal."
    # Start the captive portal only if there's no connection
    start_wifi_connect
fi

# Monitor WiFi connection continuously
while true; do
    if check_wifi_connection; then
        if is_wifi_connect_running; then
            echo "WiFi connected. Stopping captive portal."
            kill_wifi_connect
        fi
    else
        if ! is_wifi_connect_running; then
            echo "WiFi disconnected. Starting captive portal."
            start_wifi_connect
        fi
    fi
    
    # Sleep for one minute before checking again
    sleep 60
done

# Start your application here.
sleep infinity
