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

# First make a clean cargo build to download all dependencies
if [ ! -f "Cargo.toml" ]; then
    echo "Cargo.toml not found. Running from src directory."
    cd src
fi
cargo clean
cargo build --release

# If target was specified and is different from host, try cross-compiling
if [ "$TARGET" != "$(rustc -Vv | grep host | cut -d' ' -f2)" ]; then
    echo "Cross-compiling for $TARGET"
    rustup target add $TARGET
    cargo build --release --target=$TARGET
fi

# Strip the binary to reduce size
if command -v strip &> /dev/null; then
    echo "Stripping binary..."
    if [ -f "target/$TARGET/release/wifi-connect" ]; then
        strip "target/$TARGET/release/wifi-connect"
    elif [ -f "target/release/wifi-connect" ]; then
        strip "target/release/wifi-connect"
    fi
fi

# Ensure binary is in the expected location for the Docker build
if [ -f "target/$TARGET/release/wifi-connect" ]; then
    mkdir -p target/release/
    cp "target/$TARGET/release/wifi-connect" "target/release/"
fi

echo "Build completed successfully!" 