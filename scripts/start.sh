#!/usr/bin/env bash

export DBUS_SYSTEM_BUS_ADDRESS=unix:path=/host/run/dbus/system_bus_socket

# Source network functions
source ./start-network.sh

# Optional step - it takes couple of seconds (or longer) to establish a WiFi connection
# sometimes. In this case, following checks will fail and wifi-connect
# will be launched even if the device will be able to connect to a WiFi network.
# If this is your case, you can wait for a while and then check for the connection.
# sleep 15


# Choose a condition for running WiFi Connect according to your use case:

# 1. Is there a default gateway?
# ip route | grep default

# 2. Is there Internet connectivity?
# nmcli -t g | grep full

# 3. Is there Internet connectivity via a google ping?
# wget --spider http://google.com 2>&1

# 4. Is there an active WiFi connection?
iwgetid -r

# Function to check if WiFi is connected
check_wifi_connection() {
    iwgetid -r >/dev/null 2>&1
    local WIFI_CONNECTED=$?
    
    if [ $WIFI_CONNECTED -eq 0 ]; then
        # Double check with internet connectivity
        if check_internet; then
            return 0
        fi
    fi
    return 1
}

# Function to start wifi-connect captive portal
start_wifi_connect() {
    echo "Starting WiFi Connect captive portal..."
    
    # Set up required network services
    setup_network_services
    
    # Start the wifi-connect application
    ./wifi-connect &
    WIFI_CONNECT_PID=$!
    echo "WiFi Connect started with PID: $WIFI_CONNECT_PID"
    
    # Wait a moment for the portal to initialize
    sleep 5
    
    # Verify the portal is working
    verify_captive_portal
    if [ $? -eq 0 ]; then
        echo "Captive portal verified working correctly"
    else
        echo "Warning: Captive portal may not be working properly"
    fi
}

# Function to kill the captive portal if it's running
kill_wifi_connect() {
    if [ ! -z "$WIFI_CONNECT_PID" ]; then
        echo "Stopping previous WiFi Connect instance (PID: $WIFI_CONNECT_PID)"
        kill $WIFI_CONNECT_PID 2>/dev/null || true
        WIFI_CONNECT_PID=""
    fi
}

echo "Starting WiFi monitoring service..."

# Initial connection check
if check_wifi_connection; then
    echo "WiFi is already connected. Monitoring for disconnections."
else
    echo "No WiFi connection detected. Starting captive portal."
    start_wifi_connect
fi

# Monitor WiFi connection continuously
while true; do
    if check_wifi_connection; then
        if [ ! -z "$WIFI_CONNECT_PID" ]; then
            echo "WiFi connected. Stopping captive portal."
            kill_wifi_connect
        fi
    else
        if [ -z "$WIFI_CONNECT_PID" ] || ! kill -0 $WIFI_CONNECT_PID 2>/dev/null; then
            echo "WiFi disconnected. Starting captive portal."
            kill_wifi_connect  # Clean up any zombie process
            start_wifi_connect
        fi
    fi
    
    # Sleep for one minute before checking again
    sleep 60
done

# Start your application here.
sleep infinity
