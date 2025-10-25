#!/bin/bash

# Dependency installation script

set -e

echo "📦 Installing Crypto Wallet Dependencies..."

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Detected Linux"
    
    # Update package list
    sudo apt update
    
    # Install system dependencies
    sudo apt install -y \
        build-essential \
        cmake \
        libssl-dev \
        libcurl4-openssl-dev \
        pkg-config \
        git
    
    # Install Node.js (if not already installed)
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
    fi
    
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Detected macOS"
    
    # Install Homebrew if not present
    if ! command -v brew &> /dev/null; then
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    # Install dependencies
    brew install cmake openssl curl pkg-config node
    
else
    echo "❌ Unsupported OS: $OSTYPE"
    exit 1
fi

# Install libsecp256k1
echo "🔐 Installing libsecp256k1..."
if [ ! -d "libsecp256k1" ]; then
    git clone https://github.com/bitcoin-core/secp256k1.git libsecp256k1
fi

cd libsecp256k1
./autogen.sh
./configure
make
sudo make install
cd ..

# Install frontend dependencies
echo "📱 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ All dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Run './scripts/build.sh' to build the backend"
echo "2. Run './scripts/dev.sh' to start development servers"
