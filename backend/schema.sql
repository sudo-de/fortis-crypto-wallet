-- PostgreSQL Schema for Crypto Wallet
-- This file contains the complete database schema for the crypto wallet application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(10) DEFAULT 'USD',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    theme VARCHAR(20) DEFAULT 'dark',
    notifications JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    security_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) UNIQUE NOT NULL,
    balance DECIMAL(20,8) DEFAULT 0,
    currency VARCHAR(10) NOT NULL,
    wallet_type VARCHAR(50) DEFAULT 'standard',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4(),
    wallet_id INTEGER REFERENCES wallets(id) ON DELETE CASCADE,
    tx_hash VARCHAR(255) UNIQUE NOT NULL,
    from_address VARCHAR(255),
    to_address VARCHAR(255),
    amount DECIMAL(20,8) NOT NULL,
    fee DECIMAL(20,8) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    transaction_type VARCHAR(50) DEFAULT 'transfer',
    block_height INTEGER,
    confirmations INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trading orders table
CREATE TABLE IF NOT EXISTS trading_orders (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pair VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL,
    order_type VARCHAR(20) DEFAULT 'market',
    amount DECIMAL(20,8) NOT NULL,
    price DECIMAL(20,8),
    filled_amount DECIMAL(20,8) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trades table (executed trades)
CREATE TABLE IF NOT EXISTS trades (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4(),
    order_id INTEGER REFERENCES trading_orders(id) ON DELETE CASCADE,
    pair VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    fee DECIMAL(20,8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market data table
CREATE TABLE IF NOT EXISTS market_data (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    volume_24h DECIMAL(20,8),
    change_24h DECIMAL(10,4),
    high_24h DECIMAL(20,8),
    low_24h DECIMAL(20,8),
    market_cap DECIMAL(20,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trading pairs table
CREATE TABLE IF NOT EXISTS trading_pairs (
    id SERIAL PRIMARY KEY,
    pair VARCHAR(20) UNIQUE NOT NULL,
    base_currency VARCHAR(10) NOT NULL,
    quote_currency VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    min_amount DECIMAL(20,8) DEFAULT 0,
    max_amount DECIMAL(20,8),
    price_precision INTEGER DEFAULT 8,
    amount_precision INTEGER DEFAULT 8,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Address book table
CREATE TABLE IF NOT EXISTS address_book (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);
CREATE INDEX IF NOT EXISTS idx_wallets_currency ON wallets(currency);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_trading_orders_user_id ON trading_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_orders_pair ON trading_orders(pair);
CREATE INDEX IF NOT EXISTS idx_trading_orders_status ON trading_orders(status);
CREATE INDEX IF NOT EXISTS idx_trades_order_id ON trades(order_id);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data(symbol);
CREATE INDEX IF NOT EXISTS idx_address_book_user_id ON address_book(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_orders_updated_at BEFORE UPDATE ON trading_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_address_book_updated_at BEFORE UPDATE ON address_book
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO users (email, name, password_hash, two_factor_enabled) VALUES 
('sudo.de@xcryptovault.com', 'Sudo De', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8.8.8.8', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Get the user ID for sample data
DO $$
DECLARE
    user_id_var INTEGER;
BEGIN
    SELECT id INTO user_id_var FROM users WHERE email = 'sudo.de@xcryptovault.com';
    
    IF user_id_var IS NOT NULL THEN
        -- Insert user preferences
        INSERT INTO user_preferences (user_id, currency, language, timezone, theme) VALUES 
        (user_id_var, 'USD', 'en', 'UTC', 'dark')
        ON CONFLICT (user_id) DO NOTHING;
        
        -- Insert sample wallets
        INSERT INTO wallets (user_id, name, address, balance, currency, wallet_type) VALUES 
        (user_id_var, 'Bitcoin Wallet', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 2.5, 'BTC', 'standard'),
        (user_id_var, 'Ethereum Wallet', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 15.8, 'ETH', 'standard'),
        (user_id_var, 'Cardano Wallet', 'addr1q9rl0...', 5000, 'ADA', 'standard')
        ON CONFLICT (address) DO NOTHING;
        
        -- Insert sample trading pairs
        INSERT INTO trading_pairs (pair, base_currency, quote_currency, is_active, min_amount, max_amount) VALUES 
        ('BTC/USD', 'BTC', 'USD', TRUE, 0.001, 1000),
        ('ETH/USD', 'ETH', 'USD', TRUE, 0.01, 10000),
        ('ADA/USD', 'ADA', 'USD', TRUE, 1, 1000000),
        ('BTC/ETH', 'BTC', 'ETH', TRUE, 0.001, 100),
        ('ETH/BTC', 'ETH', 'BTC', TRUE, 0.01, 1000)
        ON CONFLICT (pair) DO NOTHING;
        
        -- Insert sample market data
        INSERT INTO market_data (symbol, price, volume_24h, change_24h, high_24h, low_24h, market_cap) VALUES 
        ('BTC', 43250.00, 2500000000, 8.2, 45000.00, 42000.00, 850000000000),
        ('ETH', 2850.75, 1500000000, -2.1, 3000.00, 2800.00, 350000000000),
        ('ADA', 0.45, 500000000, 5.7, 0.50, 0.42, 15000000000)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Create views for common queries
CREATE OR REPLACE VIEW user_wallet_summary AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    w.currency,
    SUM(w.balance) as total_balance,
    COUNT(w.id) as wallet_count
FROM users u
LEFT JOIN wallets w ON u.id = w.user_id
WHERE u.is_active = TRUE AND w.is_active = TRUE
GROUP BY u.id, u.name, u.email, w.currency;

CREATE OR REPLACE VIEW trading_activity AS
SELECT 
    u.name as user_name,
    t.pair,
    t.side,
    t.amount,
    t.price,
    t.status,
    t.created_at
FROM trading_orders t
JOIN users u ON t.user_id = u.id
WHERE t.created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY t.created_at DESC;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO wallet_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO wallet_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO wallet_user;
