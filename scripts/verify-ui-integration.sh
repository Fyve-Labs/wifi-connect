#!/usr/bin/env bash

# Verify that the UI is properly integrated with the backend
verify_ui_backend_integration() {
    echo "Verifying UI and backend integration..."
    
    # Check if the wifi-connect binary exists
    if [ ! -x ./wifi-connect ]; then
        echo "ERROR: wifi-connect binary not found or not executable"
        return 1
    fi
    
    # Check if the UI build exists
    UI_DIR="./ui"
    if [ ! -d "$UI_DIR" ]; then
        echo "ERROR: UI directory not found at $UI_DIR"
        return 1
    fi
    
    # Check if necessary static files exist in the UI directory
    if [ ! -f "$UI_DIR/index.html" ]; then
        echo "ERROR: index.html not found in UI directory"
        return 1
    fi
    
    # Check for Next.js static files
    if [ ! -d "$UI_DIR/_next" ]; then
        echo "WARNING: _next directory not found in UI directory. This may be an issue with the Next.js static export."
    fi
    
    echo "UI files verified successfully"
    return 0
}

# Verify that the captive portal redirects properly
verify_captive_portal_redirect() {
    echo "Verifying captive portal redirection..."
    
    # Check if dnsmasq is installed
    if ! command -v dnsmasq >/dev/null 2>&1; then
        echo "WARNING: dnsmasq not found. Captive portal DNS redirection cannot be verified."
        return 1
    fi
    
    # Check dnsmasq configuration
    DNSMASQ_CONF=$(ps aux | grep dnsmasq | grep -v grep)
    if [ -z "$DNSMASQ_CONF" ]; then
        echo "WARNING: dnsmasq not running. Captive portal redirection may not be active."
        return 1
    fi
    
    # Check for address redirection in dnsmasq
    if echo "$DNSMASQ_CONF" | grep -q "address=/#/"; then
        echo "Captive portal DNS redirection is properly configured"
        return 0
    else
        echo "WARNING: Captive portal DNS redirection configuration not detected"
        return 1
    fi
}

# Run the verification if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    verify_ui_backend_integration
    verify_captive_portal_redirect
fi 