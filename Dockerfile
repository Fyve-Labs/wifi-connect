FROM rust:1.70-slim-buster as builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libdbus-1-dev \
    pkg-config \
    git \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy project files and scripts
COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY ui ./ui
COPY scripts ./scripts

# Make scripts executable
RUN chmod +x ./scripts/*.sh

# Build UI
RUN ./scripts/build-ui.sh

# Build WiFi Connect binary
RUN ./scripts/build-binary.sh

# Create the final lightweight image
FROM debian:buster-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    dnsmasq \
    wireless-tools \
    network-manager \
    dbus \
    procps \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create necessary directories
WORKDIR /usr/src/app
RUN mkdir -p ui

# Copy the binary and UI from builder stage
COPY --from=builder /usr/src/app/target/release/wifi-connect /usr/src/app/
COPY --from=builder /usr/src/app/ui/build /usr/src/app/ui
COPY --from=builder /usr/src/app/scripts/start.sh /usr/src/app/

# Create a script to setup for different environments
COPY scripts/start-network.sh /usr/src/app/

# Make scripts executable
RUN chmod +x /usr/src/app/start.sh /usr/src/app/start-network.sh

# Command to run when container starts
CMD ["bash", "start.sh"] 