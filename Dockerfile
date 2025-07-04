FROM rust:slim-bookworm as builder

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

# Copy backend files
COPY backend ./backend
COPY scripts/build-binary.sh ./scripts/build-binary.sh

# Build WiFi Connect binary
RUN cd backend && chmod +x ../scripts/build-binary.sh && ../scripts/build-binary.sh

# Copy project files and scripts
COPY scripts/build-ui.sh ./scripts/build-ui.sh
COPY ui ./ui

# Build UI
RUN chmod +x ./scripts/build-ui.sh && ./scripts/build-ui.sh

# Create the final lightweight image
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    dnsmasq \
    wireless-tools \
    curl \
    iputils-ping \
    host \
    net-tools \
    network-manager \
    && rm -rf /var/lib/apt/lists/*

# Create necessary directories
WORKDIR /usr/src/app
RUN mkdir -p ui

# Copy the binary and UI from builder stage
COPY --from=builder /usr/src/app/backend/target/release/wifi-connect /usr/src/app/
COPY --from=builder /usr/src/app/ui/out /usr/src/app/ui/
COPY scripts/start-network.sh scripts/start.sh scripts/verify-ui-integration.sh scripts/apply-ap-creds.sh /usr/src/app/

# Make scripts executable
RUN chmod +x /usr/src/app/*.sh 

# Create logs directory and set permissions
RUN mkdir -p /usr/src/app/logs && chmod 755 /usr/src/app/logs

# Healthcheck to verify WiFi monitoring is working
HEALTHCHECK --interval=2m --timeout=30s \
  CMD pgrep -f "bash.*start.sh" || exit 1

# Command to run when container starts - redirect output to log file
CMD ["bash", "-c", "bash start.sh | tee -a /usr/src/app/logs/wifi-connect.log"] 