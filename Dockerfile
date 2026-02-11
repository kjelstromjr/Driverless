FROM node:20-bookworm

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    liblua5.3-dev \
    lua-socket \
    lua-json \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Create necessary directory structure
RUN mkdir -p beammp/Resources/Server/DriverlessPlugin \
    && mkdir -p beammp/Resources/Disabled

# Copy application files
COPY . .

# # Download BeamMP Server using curl
# RUN mkdir -p beammp && \
#     curl -L -o beammp/BeamMP-Server.ubuntu.22.04.x86_64 \
#       https://github.com/BeamMP/BeamMP-Server/releases/download/v3.9.0/BeamMP-Server.ubuntu.22.04.x86_64 && \
#     chmod +x beammp/BeamMP-Server.ubuntu.22.04.x86_64

# Make road-finder executable
RUN chmod +x /app/road-finder

# Debug: List what was copied
RUN echo "Contents of /app:" && ls -la && \
    echo "Contents of /app/plugins:" && ls -la plugins/ || echo "plugins directory not found"

# Copy the Driverless plugin to the correct location
RUN cp plugins/Driverless.lua beammp/Resources/Server/DriverlessPlugin/ && \
    echo "Successfully copied Driverless.lua" && \
    ls -la beammp/Resources/Server/DriverlessPlugin/

# Expose ports
EXPOSE 80 30814

# Start the server
CMD ["node", "main.js"]