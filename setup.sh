#!/bin/bash

echo "🚀 Setting up Fortis Cryptocurrency Wallet"
echo "============================================="

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust is not installed. Please install Rust first:"
    echo "   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Build Rust application
echo "🔨 Building Rust wallet core..."
cargo build --release

if [ $? -eq 0 ]; then
    echo "✅ Rust wallet core built successfully"
else
    echo "❌ Failed to build Rust wallet core"
    exit 1
fi

# Setup Python blockchain bridge
echo "🐍 Setting up Python blockchain bridge..."
cd python_bridge
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Python blockchain bridge setup complete"
else
    echo "❌ Failed to setup Python blockchain bridge"
    exit 1
fi
cd ..

# Setup web GUI
echo "🌐 Setting up web GUI..."
cd web_gui
npm install

if [ $? -eq 0 ]; then
    echo "✅ Web GUI dependencies installed"
else
    echo "❌ Failed to install web GUI dependencies"
    exit 1
fi

# Build web GUI
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Web GUI built successfully"
else
    echo "❌ Failed to build web GUI"
    exit 1
fi
cd ..

echo ""
echo "🎉 Setup complete! Your advanced cryptocurrency wallet is ready."
echo ""
echo "📋 Available commands:"
echo "  ./target/release/crypto-wallet create --name my-wallet"
echo "  ./target/release/crypto-wallet server"
echo ""
echo "🌐 To start the web interface:"
echo "  ./target/release/crypto-wallet server"
echo "  Then open http://localhost:8080 in your browser"
echo ""
echo "🔧 For development:"
echo "  cargo run -- server"
echo ""
