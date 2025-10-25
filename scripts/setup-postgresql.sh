#!/bin/bash

# PostgreSQL Setup Script for Crypto Wallet
echo "🐘 Setting up PostgreSQL for Crypto Wallet..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database configuration
DB_NAME="crypto_wallet"
DB_USER="wallet_user"
DB_PASSWORD="secure_password"
DB_HOST="localhost"
DB_PORT="5432"

echo -e "${BLUE}📋 Database Configuration:${NC}"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Host: $DB_HOST:$DB_PORT"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed!${NC}"
    echo "Please install PostgreSQL first:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    echo "  CentOS: sudo yum install postgresql postgresql-server"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is installed${NC}"

# Check if PostgreSQL service is running
if ! pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL service is not running. Starting it...${NC}"
    
    # Try to start PostgreSQL service
    if command -v brew &> /dev/null; then
        # macOS with Homebrew
        brew services start postgresql
    elif command -v systemctl &> /dev/null; then
        # Linux with systemd
        sudo systemctl start postgresql
    elif command -v service &> /dev/null; then
        # Linux with service
        sudo service postgresql start
    else
        echo -e "${RED}❌ Cannot start PostgreSQL service automatically${NC}"
        echo "Please start PostgreSQL manually and run this script again."
        exit 1
    fi
    
    # Wait a moment for service to start
    sleep 3
    
    # Check again
    if ! pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; then
        echo -e "${RED}❌ PostgreSQL service failed to start${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ PostgreSQL service is running${NC}"

# Create database and user
echo -e "${BLUE}🔧 Setting up database and user...${NC}"

# Create user (ignore error if user already exists)
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true

# Create database (ignore error if database already exists)
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || true

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true

echo -e "${GREEN}✅ Database and user created${NC}"

# Test connection
echo -e "${BLUE}🔍 Testing database connection...${NC}"
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" &> /dev/null; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo "Please check your PostgreSQL configuration and try again."
    exit 1
fi

# Create tables
echo -e "${BLUE}📊 Creating database tables...${NC}"

# Read SQL from database schema file if it exists
if [ -f "backend/schema.sql" ]; then
    echo "Using existing schema file..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f backend/schema.sql
else
    echo "Creating basic schema..."
    
    # Create basic tables
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) UNIQUE NOT NULL,
    balance DECIMAL(20,8) DEFAULT 0,
    currency VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER REFERENCES wallets(id) ON DELETE CASCADE,
    tx_hash VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    fee DECIMAL(20,8) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trading orders table
CREATE TABLE IF NOT EXISTS trading_orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pair VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    price DECIMAL(20,8),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market data table
CREATE TABLE IF NOT EXISTS market_data (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    volume DECIMAL(20,8),
    change_24h DECIMAL(10,4),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_trading_orders_user_id ON trading_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data(symbol);

-- Insert sample data
INSERT INTO users (email, name, password_hash) VALUES 
('sudo.de@xcryptovault.com', 'Sudo De', 'hashed_password_here')
ON CONFLICT (email) DO NOTHING;

INSERT INTO wallets (user_id, name, address, balance, currency) VALUES 
(1, 'Bitcoin Wallet', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 2.5, 'BTC'),
(1, 'Ethereum Wallet', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 15.8, 'ETH'),
(1, 'Cardano Wallet', 'addr1q9rl0...', 5000, 'ADA')
ON CONFLICT (address) DO NOTHING;

INSERT INTO market_data (symbol, price, volume, change_24h) VALUES 
('BTC', 43250.00, 2500000000, 8.2),
('ETH', 2850.75, 1500000000, -2.1),
('ADA', 0.45, 500000000, 5.7)
ON CONFLICT DO NOTHING;
EOF
fi

echo -e "${GREEN}✅ Database tables created${NC}"

# Show database info
echo -e "${BLUE}📊 Database Information:${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
"

echo ""
echo -e "${GREEN}🎉 PostgreSQL setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Connection Details:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  Username: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
echo -e "${YELLOW}💡 Next Steps:${NC}"
echo "1. Update your backend configuration to use PostgreSQL"
echo "2. Run the backend server: ./scripts/build.sh"
echo "3. Test the database connection from your application"
echo ""
echo -e "${GREEN}✅ Ready to use PostgreSQL with your crypto wallet!${NC}"
