#!/bin/bash

# Build script for crypto wallet C++ project

set -e

echo "🔨 Building Crypto Wallet Backend..."

# Create build directory
mkdir -p backend/build
cd backend/build

# Configure with CMake
echo "📋 Configuring with CMake..."
cmake .. -DCMAKE_BUILD_TYPE=Release

# Build the project
echo "🔨 Building..."
# Use sysctl on macOS, nproc on Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    make -j$(sysctl -n hw.ncpu)
else
    make -j$(nproc)
fi

echo "✅ Backend build completed successfully!"
echo "📦 Executable: backend/build/crypto_wallet"
echo ""
echo "Usage:"
echo "  ./crypto_wallet create -n <name>"
echo "  ./crypto_wallet import -n <name> -s <seed>"
echo "  ./crypto_wallet send -w <wallet> -t <address> -a <amount>"
echo "  ./crypto_wallet balance -w <wallet>"
echo "  ./crypto_wallet addresses -w <wallet>"
echo "  ./crypto_wallet server"