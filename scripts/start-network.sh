#!/usr/bin/env bash

# Set up services for captive portal
setup_network_services() {
    echo "Setting up network services..."
    
    # Ensure dnsmasq is ready for the captive portal
    if command -v dnsmasq >/dev/null 2>&1; then
        systemctl stop dnsmasq 2>/dev/null || pkill dnsmasq 2>/dev/null || true
    fi
}

# Check if wifi-connect is already running
is_wifi_connect_running() {
    if pgrep -f "wifi-connect" >/dev/null; then
        echo "wifi-connect is already running"
        return 0
    fi
    return 1
}

# Verify captive portal functionality
verify_captive_portal() {
    local PORTAL_IP="localhost" # "192.168.42.1"
    local PORTAL_PORT="80"
    
    # Check if the captive portal server is responding
    if curl -s --connect-timeout 5 http://$PORTAL_IP:$PORTAL_PORT >/dev/null; then
        echo "Captive portal server is running correctly"
        
        # Check if UI is accessible through wifi-connect
        # The UI should be served by wifi-connect itself
        if curl -s --connect-timeout 5 http://$PORTAL_IP:$PORTAL_PORT/static/index.html >/dev/null; then
            echo "UI is being served correctly by wifi-connect"
            return 0
        else
            echo "UI is not being served correctly by wifi-connect"
            return 1
        fi
        
        return 0
    else
        echo "Captive portal server is not responding"
        return 1
    fi
}

# Check for internet connectivity
check_internet() {
    # Use multiple methods to verify connection
    
    # Method 1: Try to reach a reliable internet host with ping
    if ping -c 1 -W 5 8.8.8.8 >/dev/null 2>&1; then
        echo "Successfully pinged 8.8.8.8"
        return 0
    fi
    
    # Method 2: Try DNS resolution
    if nslookup google.com >/dev/null 2>&1 || host -W 5 google.com >/dev/null 2>&1; then
        echo "Successfully resolved DNS"
        return 0
    fi
    
    # Method 3: Try HTTP request
    if curl -s --connect-timeout 5 https://www.google.com >/dev/null 2>&1; then
        echo "Successfully connected to google.com"
        return 0
    fi
    
    echo "No internet connectivity detected"
    return 1
}

# Export functions for use in other scripts
export -f setup_network_services
export -f is_wifi_connect_running
export -f verify_captive_portal
export -f check_internet

# Run setup if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    setup_network_services
fi 