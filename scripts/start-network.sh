#!/usr/bin/env bash

# Set up Network Manager and dnsmasq for captive portal
setup_network_services() {
    echo "Setting up network services..."
    
    # Ensure Network Manager is running
    if ! systemctl is-active --quiet NetworkManager; then
        echo "Starting NetworkManager..."
        systemctl start NetworkManager || true
    fi
    
    # Ensure dnsmasq is ready for the captive portal
    systemctl stop dnsmasq 2>/dev/null || true
    
    # Make sure forwarding is enabled
    echo 1 > /proc/sys/net/ipv4/ip_forward
}

# Verify captive portal functionality
verify_captive_portal() {
    local PORTAL_IP="192.168.42.1"
    local PORTAL_PORT="80"
    
    # Check if the captive portal server is responding
    if curl -s --connect-timeout 5 http://$PORTAL_IP:$PORTAL_PORT >/dev/null; then
        echo "Captive portal server is running correctly"
        return 0
    else
        echo "Captive portal server is not responding"
        return 1
    fi
}

# Check for internet connectivity
check_internet() {
    # Use multiple methods to verify connection
    
    # Method 1: Check network connectivity state
    if nmcli -t g | grep -q "full"; then
        echo "Network Manager reports full connectivity"
        return 0
    fi
    
    # Method 2: Try to reach a reliable internet host
    if ping -c 1 -W 5 8.8.8.8 >/dev/null 2>&1; then
        echo "Successfully pinged 8.8.8.8"
        return 0
    fi
    
    # Method 3: Try DNS resolution
    if host -W 5 google.com >/dev/null 2>&1; then
        echo "Successfully resolved DNS"
        return 0
    fi
    
    echo "No internet connectivity detected"
    return 1
}

# Export functions for use in other scripts
export -f setup_network_services
export -f verify_captive_portal
export -f check_internet

# Run setup if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    setup_network_services
fi 