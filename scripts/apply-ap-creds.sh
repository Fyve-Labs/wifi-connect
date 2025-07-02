#!/usr/bin/env bash

# apply-ap-creds.sh
# ----------------------------------------------
# One-time helper sourced by start.sh at container start-up.
# If WIFI_FORCE_SSID is set, the script attempts to connect
# to that AP (using nmcli) before the usual WiFi-Connect flow.
#
# Environment variables
#   WIFI_FORCE_SSID      – SSID to connect to (required to trigger logic)
#   WIFI_FORCE_PSK       – passphrase (optional, leave empty for open networks)
#   WIFI_FORCE_IDENTITY  – 802.1x identity (optional)
#   WIFI_FORCE_MAX_RETRIES – attempts (default 3)
#   WIFI_FORCE_RETRY_WAIT – seconds between attempts (default 10)
# ----------------------------------------------

# Do nothing when SSID is not provided
if [ -z "$WIFI_FORCE_SSID" ]; then
    return 0
fi

# Ensure nmcli exists
if ! command -v nmcli >/dev/null 2>&1; then
    echo "apply-ap-creds: nmcli not found – skipping forced WiFi connect"
    return 1
fi

MAX_RETRIES=${WIFI_FORCE_MAX_RETRIES:-3}
WAIT_BETWEEN=${WIFI_FORCE_RETRY_WAIT:-10}
ATTEMPT=1

# Quick short-circuit: already connected?
CURRENT_SSID="$(iwgetid -r 2>/dev/null || true)"
if [ "$CURRENT_SSID" == "$WIFI_FORCE_SSID" ]; then
    echo "apply-ap-creds: already connected to $WIFI_FORCE_SSID"
    return 0
fi

echo "apply-ap-creds: Attempting forced connection to '$WIFI_FORCE_SSID' (max $MAX_RETRIES tries)"

while [ $ATTEMPT -le $MAX_RETRIES ]; do
    echo "apply-ap-creds: attempt $ATTEMPT/$MAX_RETRIES"

    if [ -n "$WIFI_FORCE_PSK" ]; then
        nmcli --wait 10 dev wifi connect "$WIFI_FORCE_SSID" password "$WIFI_FORCE_PSK" ${WIFI_FORCE_IDENTITY:+identity "$WIFI_FORCE_IDENTITY"} 2>/dev/null
    else
        nmcli --wait 10 dev wifi connect "$WIFI_FORCE_SSID" 2>/dev/null
    fi

    # Allow connection to settle
    sleep 5

    # Connectivity verification
    if command -v check_wifi_connection >/dev/null 2>&1; then
        if check_wifi_connection; then
            echo "apply-ap-creds: Successfully connected to $WIFI_FORCE_SSID"
            return 0
        fi
    else
        # Fallback: basic ping test
        if ping -c 1 -W 5 8.8.8.8 >/dev/null 2>&1; then
            echo "apply-ap-creds: Connectivity verified via ping"
            return 0
        fi
    fi

    echo "apply-ap-creds: Connection attempt $ATTEMPT failed"
    ATTEMPT=$((ATTEMPT + 1))
    [ $ATTEMPT -le $MAX_RETRIES ] && sleep $WAIT_BETWEEN
done

echo "apply-ap-creds: Unable to connect to $WIFI_FORCE_SSID after $MAX_RETRIES attempts – will fall back to captive portal if needed."
return 1 