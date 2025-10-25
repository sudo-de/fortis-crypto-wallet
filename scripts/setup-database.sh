#!/bin/bash

# Database Setup Script for Crypto Wallet
# This script sets up the database infrastructure for the wallet application

set -e

echo "🗄️  Setting up Database Infrastructure..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Create necessary directories
print_status "Creating database directories..."
mkdir -p data
mkdir -p backups
mkdir -p logs
mkdir -p migrations

# Set permissions
chmod 755 data
chmod 755 backups
chmod 755 logs
chmod 755 migrations

print_success "Directories created successfully"

# Check for required dependencies
print_status "Checking dependencies..."

# Check for SQLite3
if command -v sqlite3 &> /dev/null; then
    print_success "SQLite3 is installed"
else
    print_warning "SQLite3 not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install sqlite3
        else
            print_error "Homebrew not found. Please install SQLite3 manually."
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y sqlite3
        elif command -v yum &> /dev/null; then
            sudo yum install -y sqlite3
        else
            print_error "Package manager not found. Please install SQLite3 manually."
            exit 1
        fi
    else
        print_error "Unsupported operating system. Please install SQLite3 manually."
        exit 1
    fi
fi

# Check for PostgreSQL (optional)
if command -v psql &> /dev/null; then
    print_success "PostgreSQL is installed"
    POSTGRES_AVAILABLE=true
else
    print_warning "PostgreSQL not found. SQLite will be used as default."
    POSTGRES_AVAILABLE=false
fi

# Check for Python dependencies
print_status "Checking Python dependencies..."

if command -v python3 &> /dev/null; then
    print_success "Python3 is installed"
    
    # Check for required Python packages
    python3 -c "import sqlite3" 2>/dev/null && print_success "sqlite3 module available" || print_warning "sqlite3 module not available"
    python3 -c "import psycopg2" 2>/dev/null && print_success "psycopg2 module available" || print_warning "psycopg2 module not available"
    
    # Install Python dependencies if requirements.txt exists
    if [ -f "python_bridge/requirements.txt" ]; then
        print_status "Installing Python dependencies..."
        pip3 install -r python_bridge/requirements.txt
        print_success "Python dependencies installed"
    fi
else
    print_warning "Python3 not found. Some features may not work."
fi

# Create database configuration files
print_status "Creating database configuration..."

# Create SQLite database
if [ ! -f "data/wallet.db" ]; then
    print_status "Creating SQLite database..."
    sqlite3 data/wallet.db "SELECT 1;" 2>/dev/null || {
        print_error "Failed to create SQLite database"
        exit 1
    }
    print_success "SQLite database created at data/wallet.db"
else
    print_success "SQLite database already exists"
fi

# Create backup script
print_status "Creating backup script..."
cat > scripts/backup-database.sh << 'EOF'
#!/bin/bash

# Database Backup Script
BACKUP_DIR="./backups"
DB_PATH="./data/wallet.db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/wallet_backup_$TIMESTAMP.db"

echo "🗄️  Creating database backup..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
if [ -f "$DB_PATH" ]; then
    cp "$DB_PATH" "$BACKUP_FILE"
    echo "✅ Backup created: $BACKUP_FILE"
    
    # Compress backup
    gzip "$BACKUP_FILE"
    echo "✅ Backup compressed: $BACKUP_FILE.gz"
    
    # Keep only last 10 backups
    ls -t "$BACKUP_DIR"/wallet_backup_*.db.gz | tail -n +11 | xargs -r rm
    echo "✅ Old backups cleaned up"
else
    echo "❌ Database file not found: $DB_PATH"
    exit 1
fi
EOF

chmod +x scripts/backup-database.sh
print_success "Backup script created"

# Create restore script
print_status "Creating restore script..."
cat > scripts/restore-database.sh << 'EOF'
#!/bin/bash

# Database Restore Script
if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 ./backups/wallet_backup_20231201_120000.db.gz"
    exit 1
fi

BACKUP_FILE="$1"
DB_PATH="./data/wallet.db"

echo "🗄️  Restoring database from backup..."

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Create backup of current database
if [ -f "$DB_PATH" ]; then
    cp "$DB_PATH" "${DB_PATH}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Current database backed up"
fi

# Restore database
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" > "$DB_PATH"
else
    cp "$BACKUP_FILE" "$DB_PATH"
fi

echo "✅ Database restored from: $BACKUP_FILE"
EOF

chmod +x scripts/restore-database.sh
print_success "Restore script created"

# Create database initialization script
print_status "Creating database initialization script..."
cat > scripts/init-database.py << 'EOF'
#!/usr/bin/env python3

import sqlite3
import os
import sys

def init_database():
    """Initialize the database with schema"""
    db_path = "./data/wallet.db"
    
    if not os.path.exists(db_path):
        print("❌ Database file not found. Please run setup-database.sh first.")
        sys.exit(1)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create tables
    schema_sql = """
    -- Wallets table
    CREATE TABLE IF NOT EXISTS wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        public_key TEXT NOT NULL,
        encrypted_private_key TEXT NOT NULL,
        network TEXT NOT NULL,
        balance REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Transactions table
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_id INTEGER NOT NULL,
        tx_hash TEXT UNIQUE NOT NULL,
        from_address TEXT NOT NULL,
        to_address TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        status TEXT NOT NULL,
        fee REAL DEFAULT 0.0,
        network TEXT NOT NULL,
        timestamp DATETIME NOT NULL,
        memo TEXT,
        FOREIGN KEY (wallet_id) REFERENCES wallets (id) ON DELETE CASCADE
    );
    
    -- Trading orders table
    CREATE TABLE IF NOT EXISTS trading_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_id INTEGER NOT NULL,
        order_id TEXT UNIQUE NOT NULL,
        pair TEXT NOT NULL,
        type TEXT NOT NULL,
        side TEXT NOT NULL,
        amount REAL NOT NULL,
        price REAL NOT NULL,
        filled_amount REAL DEFAULT 0.0,
        remaining_amount REAL NOT NULL,
        status TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        error_message TEXT,
        FOREIGN KEY (wallet_id) REFERENCES wallets (id) ON DELETE CASCADE
    );
    
    -- Trades table
    CREATE TABLE IF NOT EXISTS trades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        trade_id TEXT UNIQUE NOT NULL,
        pair TEXT NOT NULL,
        side TEXT NOT NULL,
        amount REAL NOT NULL,
        price REAL NOT NULL,
        fee REAL DEFAULT 0.0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES trading_orders (id) ON DELETE CASCADE
    );
    
    -- Market data table
    CREATE TABLE IF NOT EXISTS market_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        price REAL NOT NULL,
        change_24h REAL DEFAULT 0.0,
        volume_24h REAL DEFAULT 0.0,
        high_24h REAL DEFAULT 0.0,
        low_24h REAL DEFAULT 0.0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Address book table
    CREATE TABLE IF NOT EXISTS address_book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        label TEXT,
        notes TEXT,
        is_favorite BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (wallet_id) REFERENCES wallets (id) ON DELETE CASCADE
    );
    
    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_wallets_name ON wallets (name);
    CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions (wallet_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions (tx_hash);
    CREATE INDEX IF NOT EXISTS idx_trading_orders_wallet_id ON trading_orders (wallet_id);
    CREATE INDEX IF NOT EXISTS idx_trading_orders_order_id ON trading_orders (order_id);
    CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data (symbol);
    CREATE INDEX IF NOT EXISTS idx_address_book_wallet_id ON address_book (wallet_id);
    """
    
    try:
        cursor.executescript(schema_sql)
        conn.commit()
        print("✅ Database schema initialized successfully")
        
        # Insert sample data
        cursor.execute("""
            INSERT OR IGNORE INTO wallets (name, public_key, encrypted_private_key, network, balance)
            VALUES ('Sample Wallet', 'sample_public_key', 'encrypted_private_key', 'bitcoin', 0.0)
        """)
        
        cursor.execute("""
            INSERT OR IGNORE INTO market_data (symbol, price, change_24h, volume_24h, high_24h, low_24h)
            VALUES ('BTC', 50000.0, 2.5, 1000000.0, 51000.0, 49000.0)
        """)
        
        conn.commit()
        print("✅ Sample data inserted")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    init_database()
EOF

chmod +x scripts/init-database.py
print_success "Database initialization script created"

# Run database initialization
print_status "Initializing database schema..."
python3 scripts/init-database.py

# Create database status script
print_status "Creating database status script..."
cat > scripts/database-status.sh << 'EOF'
#!/bin/bash

# Database Status Script
DB_PATH="./data/wallet.db"

echo "🗄️  Database Status Report"
echo "=========================="

if [ -f "$DB_PATH" ]; then
    echo "✅ Database file exists: $DB_PATH"
    
    # Get database size
    DB_SIZE=$(du -h "$DB_PATH" | cut -f1)
    echo "📊 Database size: $DB_SIZE"
    
    # Get table counts
    echo ""
    echo "📈 Table Statistics:"
    sqlite3 "$DB_PATH" << 'SQL'
.mode table
.headers on
SELECT 'Wallets' as Table_Name, COUNT(*) as Count FROM wallets
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'Trading Orders', COUNT(*) FROM trading_orders
UNION ALL
SELECT 'Trades', COUNT(*) FROM trades
UNION ALL
SELECT 'Market Data', COUNT(*) FROM market_data
UNION ALL
SELECT 'Address Book', COUNT(*) FROM address_book;
SQL
    
    echo ""
    echo "🔍 Recent Activity:"
    sqlite3 "$DB_PATH" << 'SQL'
.mode table
.headers on
SELECT 'Recent Wallets' as Type, name, created_at FROM wallets ORDER BY created_at DESC LIMIT 3;
SQL
    
else
    echo "❌ Database file not found: $DB_PATH"
    echo "Please run setup-database.sh first"
fi
EOF

chmod +x scripts/database-status.sh
print_success "Database status script created"

# Final status
print_success "Database setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Run './scripts/database-status.sh' to check database status"
echo "2. Run './scripts/backup-database.sh' to create a backup"
echo "3. Start the backend server to use the database"
echo ""
echo "🗄️  Database files created:"
echo "   - Database: ./data/wallet.db"
echo "   - Backups: ./backups/"
echo "   - Logs: ./logs/"
echo "   - Migrations: ./migrations/"
echo ""
echo "🔧 Available scripts:"
echo "   - ./scripts/backup-database.sh - Create database backup"
echo "   - ./scripts/restore-database.sh <backup_file> - Restore from backup"
echo "   - ./scripts/database-status.sh - Check database status"
echo "   - ./scripts/init-database.py - Initialize database schema"
