#!/bin/bash

set -e

echo "Building wifi-connect binary..."

# Detect architecture or use provided one
if [ -z "$1" ]; then
    ARCH=$(uname -m)
    case "$ARCH" in
        x86_64)
            TARGET="x86_64-unknown-linux-gnu"
            ;;
        aarch64)
            TARGET="aarch64-unknown-linux-gnu"
            ;;
        armv7*)
            TARGET="armv7-unknown-linux-gnueabihf"
            ;;
        *)
            echo "Unsupported architecture: $ARCH"
            exit 1
            ;;
    esac
else
    TARGET="$1"
fi

echo "Building for target: $TARGET"

# Install build dependencies if needed
if ! command -v cargo &> /dev/null; then
    echo "Rust not installed. Installing..."
    apt-get update
    apt-get install -y build-essential curl
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
fi

# Build the binary
cargo build --release --target=$TARGET || cargo build --release

# Strip the binary to reduce size
if command -v strip &> /dev/null; then
    echo "Stripping binary..."
    strip target/release/wifi-connect || strip target/$TARGET/release/wifi-connect
fi

echo "Build completed successfully!" 