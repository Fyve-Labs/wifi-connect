#!/usr/bin/env bash

# Function to cleanup all network services
cleanup_network_services() {
    echo "Cleaning up network services..."
    
    # Stop any running dnsmasq processes
    if command -v systemctl >/dev/null 2>&1; then
        systemctl stop dnsmasq 2>/dev/null || true
    fi
    
    # Kill any remaining dnsmasq processes
    pkill -f dnsmasq 2>/dev/null || true
    
    # Kill any process using port 80
    if command -v lsof >/dev/null 2>&1; then
        local PORT_80_PIDS=$(lsof -ti:80 2>/dev/null || true)
        if [ -n "$PORT_80_PIDS" ]; then
            echo "Killing processes using port 80: $PORT_80_PIDS"
            kill -TERM $PORT_80_PIDS 2>/dev/null || true
            sleep 2
            kill -KILL $PORT_80_PIDS 2>/dev/null || true
        fi
    fi
    
    # Alternative method using netstat if lsof is not available
    if command -v netstat >/dev/null 2>&1 && ! command -v lsof >/dev/null 2>&1; then
        local PORT_80_PIDS=$(netstat -tlnp 2>/dev/null | grep ':80 ' | awk '{print $7}' | cut -d'/' -f1 | grep -v '-' | sort -u || true)
        if [ -n "$PORT_80_PIDS" ]; then
            echo "Killing processes using port 80: $PORT_80_PIDS"
            kill -TERM $PORT_80_PIDS 2>/dev/null || true
            sleep 2
            kill -KILL $PORT_80_PIDS 2>/dev/null || true
        fi
    fi
    
    # Wait for ports to be released
    sleep 3
}

# Set up services for captive portal
setup_network_services() {
    echo "Setting up network services..."
    
    # First cleanup any previous services
    cleanup_network_services
    
    # Ensure dnsmasq is ready for the captive portal
    if command -v dnsmasq >/dev/null 2>&1; then
        # Configure dnsmasq for captive portal
        # Create a temporary configuration file
        DNSMASQ_CONF=$(mktemp)
        
        # Write configuration
        cat > "$DNSMASQ_CONF" << EOF
# Don't use /etc/hosts or /etc/resolv.conf
no-resolv
no-hosts

# Serve the captive portal for all domain requests
address=/#/192.168.42.1

# Interface to bind to
interface=wlan0

# Enable DHCP server
dhcp-range=192.168.42.2,192.168.42.254,255.255.255.0,12h

# Set router and DNS server
dhcp-option=option:router,192.168.42.1
dhcp-option=option:dns-server,192.168.42.1
EOF
        
        # Start dnsmasq with our configuration
        if dnsmasq -C "$DNSMASQ_CONF"; then
            echo "dnsmasq started successfully"
        else
            echo "Failed to start dnsmasq, attempting cleanup and retry..."
            cleanup_network_services
            sleep 5
            if dnsmasq -C "$DNSMASQ_CONF"; then
                echo "dnsmasq started successfully on retry"
            else
                echo "ERROR: Failed to start dnsmasq after cleanup and retry"
                rm -f "$DNSMASQ_CONF"
                return 1
            fi
        fi
        
        # Clean up temp file
        rm -f "$DNSMASQ_CONF"
    else
        echo "WARNING: dnsmasq not found. Captive portal may not function correctly."
        return 1
    fi
    
    return 0
}

# Check if wifi-connect is already running
is_wifi_connect_running() {
    if pgrep -f "wifi-connect" >/dev/null; then
        echo "wifi-connect is already running"
        return 0
    fi
    return 1
}

# Check if port 80 is available
is_port_80_available() {
    if command -v netstat >/dev/null 2>&1; then
        if netstat -tlnp 2>/dev/null | grep -q ':80 '; then
            echo "Port 80 is in use"
            return 1
        fi
    fi
    
    # Alternative check using nc if available
    if command -v nc >/dev/null 2>&1; then
        if nc -z localhost 80 2>/dev/null; then
            echo "Port 80 is in use"
            return 1
        fi
    fi
    
    echo "Port 80 is available"
    return 0
}

# Attempt to restore last known good connection
restore_last_connection() {
    echo "Attempting to restore last known connection..."
    
    # Use NetworkManager to try to reconnect to the last successful connection
    if command -v nmcli >/dev/null 2>&1; then
        # Get the last used connection that's not the access point
        local LAST_CONNECTION=$(nmcli -t -f NAME,TYPE,TIMESTAMP-REAL connection show | \
            grep "802-11-wireless" | \
            grep -v "$PORTAL_SSID" | \
            sort -t: -k3 -n | \
            tail -1 | \
            cut -d: -f1)
        
        if [ -n "$LAST_CONNECTION" ]; then
            echo "Attempting to reconnect to: $LAST_CONNECTION"
            if nmcli connection up "$LAST_CONNECTION" 2>/dev/null; then
                echo "Successfully restored connection to: $LAST_CONNECTION"
                return 0
            else
                echo "Failed to restore connection to: $LAST_CONNECTION"
            fi
        else
            echo "No previous WiFi connections found"
        fi
    fi
    
    return 1
}

# Verify captive portal functionality
verify_captive_portal() {
    local PORTAL_IP="localhost" # "192.168.42.1"
    local PORTAL_PORT="80"
    
    # First check if port is available
    if ! is_port_80_available; then
        echo "Port 80 is not available for captive portal"
        return 1
    fi
    
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
    local PING_ADDRESS=${CONNECTIVITY_PING_ADDRESS:-8.8.8.8}
    if ping -c 1 -W 5 $PING_ADDRESS >/dev/null 2>&1; then
        echo "Successfully pinged $PING_ADDRESS"
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
export -f cleanup_network_services
export -f setup_network_services
export -f is_wifi_connect_running
export -f is_port_80_available
export -f restore_last_connection
export -f verify_captive_portal
export -f check_internet

# Run setup if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    setup_network_services
fi 