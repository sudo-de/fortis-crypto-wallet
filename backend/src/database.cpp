#include "database.h"
#include "error.h"
#include <sqlite3.h>
#include <libpq-fe.h>
#include <iostream>
#include <sstream>
#include <iomanip>
#include <ctime>

namespace crypto_wallet {

// SQLite Database Implementation
class SQLiteDatabase : public Database {
private:
    sqlite3* db_;
    std::string db_path_;
    bool connected_;

public:
    SQLiteDatabase(const std::string& db_path) : db_(nullptr), db_path_(db_path), connected_(false) {}
    
    ~SQLiteDatabase() override {
        disconnect();
    }
    
    bool connect() override {
        int rc = sqlite3_open(db_path_.c_str(), &db_);
        if (rc != SQLITE_OK) {
            std::cerr << "Error opening SQLite database: " << sqlite3_errmsg(db_) << std::endl;
            return false;
        }
        
        // Enable foreign keys
        sqlite3_exec(db_, "PRAGMA foreign_keys = ON;", nullptr, nullptr, nullptr);
        
        connected_ = true;
        return true;
    }
    
    void disconnect() override {
        if (db_) {
            sqlite3_close(db_);
            db_ = nullptr;
        }
        connected_ = false;
    }
    
    bool is_connected() const override {
        return connected_ && db_ != nullptr;
    }
    
    bool initialize_schema() override {
        if (!is_connected()) return false;
        
        const char* schema_sql = R"(
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
            
            -- Create indexes for better performance
            CREATE INDEX IF NOT EXISTS idx_wallets_name ON wallets (name);
            CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions (wallet_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions (tx_hash);
            CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions (timestamp);
            CREATE INDEX IF NOT EXISTS idx_trading_orders_wallet_id ON trading_orders (wallet_id);
            CREATE INDEX IF NOT EXISTS idx_trading_orders_order_id ON trading_orders (order_id);
            CREATE INDEX IF NOT EXISTS idx_trading_orders_status ON trading_orders (status);
            CREATE INDEX IF NOT EXISTS idx_trades_order_id ON trades (order_id);
            CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data (symbol);
            CREATE INDEX IF NOT EXISTS idx_market_data_timestamp ON market_data (timestamp);
            CREATE INDEX IF NOT EXISTS idx_address_book_wallet_id ON address_book (wallet_id);
        )";
        
        char* err_msg = nullptr;
        int rc = sqlite3_exec(db_, schema_sql, nullptr, nullptr, &err_msg);
        if (rc != SQLITE_OK) {
            std::cerr << "Error creating schema: " << err_msg << std::endl;
            sqlite3_free(err_msg);
            return false;
        }
        
        return true;
    }
    
    bool run_migrations() override {
        // For now, just initialize schema
        return initialize_schema();
    }
    
    // Wallet operations
    int create_wallet(const Wallet& wallet) override {
        if (!is_connected()) return -1;
        
        const char* sql = R"(
            INSERT INTO wallets (name, public_key, encrypted_private_key, network, balance)
            VALUES (?, ?, ?, ?, ?)
        )";
        
        sqlite3_stmt* stmt;
        int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
        if (rc != SQLITE_OK) return -1;
        
        sqlite3_bind_text(stmt, 1, wallet.name.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 2, wallet.public_key.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 3, wallet.encrypted_private_key.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 4, wallet.network.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_double(stmt, 5, wallet.balance);
        
        rc = sqlite3_step(stmt);
        sqlite3_finalize(stmt);
        
        if (rc != SQLITE_DONE) return -1;
        
        return static_cast<int>(sqlite3_last_insert_rowid(db_));
    }
    
    bool update_wallet(const Wallet& wallet) override {
        if (!is_connected()) return false;
        
        const char* sql = R"(
            UPDATE wallets 
            SET name = ?, public_key = ?, encrypted_private_key = ?, network = ?, balance = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        )";
        
        sqlite3_stmt* stmt;
        int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
        if (rc != SQLITE_OK) return false;
        
        sqlite3_bind_text(stmt, 1, wallet.name.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 2, wallet.public_key.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 3, wallet.encrypted_private_key.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 4, wallet.network.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_double(stmt, 5, wallet.balance);
        sqlite3_bind_int(stmt, 6, wallet.id);
        
        rc = sqlite3_step(stmt);
        sqlite3_finalize(stmt);
        
        return rc == SQLITE_DONE;
    }
    
    bool delete_wallet(int wallet_id) override {
        if (!is_connected()) return false;
        
        const char* sql = "DELETE FROM wallets WHERE id = ?";
        
        sqlite3_stmt* stmt;
        int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
        if (rc != SQLITE_OK) return false;
        
        sqlite3_bind_int(stmt, 1, wallet_id);
        
        rc = sqlite3_step(stmt);
        sqlite3_finalize(stmt);
        
        return rc == SQLITE_DONE;
    }
    
    std::optional<Wallet> get_wallet(int wallet_id) override {
        if (!is_connected()) return std::nullopt;
        
        const char* sql = "SELECT * FROM wallets WHERE id = ?";
        
        sqlite3_stmt* stmt;
        int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
        if (rc != SQLITE_OK) return std::nullopt;
        
        sqlite3_bind_int(stmt, 1, wallet_id);
        
        rc = sqlite3_step(stmt);
        if (rc != SQLITE_ROW) {
            sqlite3_finalize(stmt);
            return std::nullopt;
        }
        
        Wallet wallet;
        wallet.id = sqlite3_column_int(stmt, 0);
        wallet.name = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        wallet.public_key = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        wallet.encrypted_private_key = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
        wallet.network = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));
        wallet.balance = sqlite3_column_double(stmt, 5);
        
        sqlite3_finalize(stmt);
        return wallet;
    }
    
    std::optional<Wallet> get_wallet_by_name(const std::string& name) override {
        if (!is_connected()) return std::nullopt;
        
        const char* sql = "SELECT * FROM wallets WHERE name = ?";
        
        sqlite3_stmt* stmt;
        int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
        if (rc != SQLITE_OK) return std::nullopt;
        
        sqlite3_bind_text(stmt, 1, name.c_str(), -1, SQLITE_STATIC);
        
        rc = sqlite3_step(stmt);
        if (rc != SQLITE_ROW) {
            sqlite3_finalize(stmt);
            return std::nullopt;
        }
        
        Wallet wallet;
        wallet.id = sqlite3_column_int(stmt, 0);
        wallet.name = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        wallet.public_key = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
        wallet.encrypted_private_key = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
        wallet.network = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));
        wallet.balance = sqlite3_column_double(stmt, 5);
        
        sqlite3_finalize(stmt);
        return wallet;
    }
    
    std::vector<Wallet> get_all_wallets() override {
        std::vector<Wallet> wallets;
        if (!is_connected()) return wallets;
        
        const char* sql = "SELECT * FROM wallets ORDER BY created_at DESC";
        
        sqlite3_stmt* stmt;
        int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
        if (rc != SQLITE_OK) return wallets;
        
        while ((rc = sqlite3_step(stmt)) == SQLITE_ROW) {
            Wallet wallet;
            wallet.id = sqlite3_column_int(stmt, 0);
            wallet.name = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
            wallet.public_key = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
            wallet.encrypted_private_key = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
            wallet.network = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 4));
            wallet.balance = sqlite3_column_double(stmt, 5);
            wallets.push_back(wallet);
        }
        
        sqlite3_finalize(stmt);
        return wallets;
    }
    
    bool update_wallet_balance(int wallet_id, double balance) override {
        if (!is_connected()) return false;
        
        const char* sql = "UPDATE wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        
        sqlite3_stmt* stmt;
        int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
        if (rc != SQLITE_OK) return false;
        
        sqlite3_bind_double(stmt, 1, balance);
        sqlite3_bind_int(stmt, 2, wallet_id);
        
        rc = sqlite3_step(stmt);
        sqlite3_finalize(stmt);
        
        return rc == SQLITE_DONE;
    }
    
    // Transaction operations
    int create_transaction(const Transaction& transaction) override {
        if (!is_connected()) return -1;
        
        const char* sql = R"(
            INSERT INTO transactions (wallet_id, tx_hash, from_address, to_address, amount, currency, status, fee, network, timestamp, memo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        )";
        
        sqlite3_stmt* stmt;
        int rc = sqlite3_prepare_v2(db_, sql, -1, &stmt, nullptr);
        if (rc != SQLITE_OK) return -1;
        
        sqlite3_bind_int(stmt, 1, transaction.wallet_id);
        sqlite3_bind_text(stmt, 2, transaction.tx_hash.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 3, transaction.from_address.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 4, transaction.to_address.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_double(stmt, 5, transaction.amount);
        sqlite3_bind_text(stmt, 6, transaction.currency.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_text(stmt, 7, transaction.status.c_str(), -1, SQLITE_STATIC);
        sqlite3_bind_double(stmt, 8, transaction.fee);
        sqlite3_bind_text(stmt, 9, transaction.network.c_str(), -1, SQLITE_STATIC);
        
        // Convert timestamp to string
        std::time_t time_t = std::chrono::system_clock::to_time_t(transaction.timestamp);
        std::stringstream ss;
        ss << std::put_time(std::gmtime(&time_t), "%Y-%m-%d %H:%M:%S");
        sqlite3_bind_text(stmt, 10, ss.str().c_str(), -1, SQLITE_STATIC);
        
        sqlite3_bind_text(stmt, 11, transaction.memo.c_str(), -1, SQLITE_STATIC);
        
        rc = sqlite3_step(stmt);
        sqlite3_finalize(stmt);
        
        if (rc != SQLITE_DONE) return -1;
        
        return static_cast<int>(sqlite3_last_insert_rowid(db_));
    }
    
    // Placeholder implementations for other methods
    bool update_transaction(const Transaction& transaction) override { return false; }
    bool delete_transaction(int transaction_id) override { return false; }
    std::optional<Transaction> get_transaction(int transaction_id) override { return std::nullopt; }
    std::optional<Transaction> get_transaction_by_hash(const std::string& tx_hash) override { return std::nullopt; }
    std::vector<Transaction> get_wallet_transactions(int wallet_id, int limit) override { return {}; }
    std::vector<Transaction> get_transactions_by_status(const std::string& status) override { return {}; }
    std::vector<Transaction> get_transactions_by_currency(const std::string& currency) override { return {}; }
    
    // Trading operations - placeholder implementations
    int create_trading_order(const TradingOrder& order) override { return -1; }
    bool update_trading_order(const TradingOrder& order) override { return false; }
    bool delete_trading_order(int order_id) override { return false; }
    std::optional<TradingOrder> get_trading_order(int order_id) override { return std::nullopt; }
    std::optional<TradingOrder> get_trading_order_by_order_id(const std::string& order_id) override { return std::nullopt; }
    std::vector<TradingOrder> get_wallet_orders(int wallet_id) override { return {}; }
    std::vector<TradingOrder> get_orders_by_status(const std::string& status) override { return {}; }
    std::vector<TradingOrder> get_orders_by_pair(const std::string& pair) override { return {}; }
    
    // Trade operations - placeholder implementations
    int create_trade(const Trade& trade) override { return -1; }
    bool update_trade(const Trade& trade) override { return false; }
    bool delete_trade(int trade_id) override { return false; }
    std::optional<Trade> get_trade(int trade_id) override { return std::nullopt; }
    std::vector<Trade> get_order_trades(int order_id) override { return {}; }
    std::vector<Trade> get_wallet_trades(int wallet_id) override { return {}; }
    
    // Market data operations - placeholder implementations
    int create_market_data(const MarketData& data) override { return -1; }
    bool update_market_data(const MarketData& data) override { return false; }
    std::optional<MarketData> get_latest_market_data(const std::string& symbol) override { return std::nullopt; }
    std::vector<MarketData> get_market_data_history(const std::string& symbol, int limit) override { return {}; }
    std::vector<MarketData> get_all_market_data() override { return {}; }
    
    // Address book operations - placeholder implementations
    int create_address_book_entry(const AddressBook& entry) override { return -1; }
    bool update_address_book_entry(const AddressBook& entry) override { return false; }
    bool delete_address_book_entry(int entry_id) override { return false; }
    std::optional<AddressBook> get_address_book_entry(int entry_id) override { return std::nullopt; }
    std::vector<AddressBook> get_wallet_address_book(int wallet_id) override { return {}; }
    std::vector<AddressBook> search_address_book(const std::string& query) override { return {}; }
    std::vector<AddressBook> get_favorite_addresses(int wallet_id) override { return {}; }
    
    // Analytics and reporting - placeholder implementations
    std::map<std::string, double> get_portfolio_balances(int wallet_id) override { return {}; }
    double get_total_portfolio_value(int wallet_id) override { return 0.0; }
    std::vector<std::pair<std::string, double>> get_currency_allocations(int wallet_id) override { return {}; }
    std::vector<Transaction> get_transaction_history(int wallet_id, const std::string& start_date, const std::string& end_date) override { return {}; }
    std::map<std::string, double> get_trading_performance(int wallet_id) override { return {}; }
    
    // Utility functions
    bool begin_transaction() override {
        if (!is_connected()) return false;
        return sqlite3_exec(db_, "BEGIN TRANSACTION;", nullptr, nullptr, nullptr) == SQLITE_OK;
    }
    
    bool commit_transaction() override {
        if (!is_connected()) return false;
        return sqlite3_exec(db_, "COMMIT;", nullptr, nullptr, nullptr) == SQLITE_OK;
    }
    
    bool rollback_transaction() override {
        if (!is_connected()) return false;
        return sqlite3_exec(db_, "ROLLBACK;", nullptr, nullptr, nullptr) == SQLITE_OK;
    }
    
    std::string get_database_info() override {
        return "SQLite Database: " + db_path_;
    }
    
    bool backup_database(const std::string& backup_path) override {
        // SQLite backup implementation
        return false;
    }
    
    bool restore_database(const std::string& backup_path) override {
        // SQLite restore implementation
        return false;
    }
};

// Database Factory Implementation
std::unique_ptr<Database> DatabaseFactory::create_database(DatabaseType type, const std::string& connection_string) {
    if (type == DatabaseType::SQLITE) {
        return std::make_unique<SQLiteDatabase>(connection_string);
    }
    return nullptr;
}

std::unique_ptr<Database> DatabaseFactory::create_sqlite_database(const std::string& db_path) {
    return std::make_unique<SQLiteDatabase>(db_path);
}

std::unique_ptr<Database> DatabaseFactory::create_postgresql_database(
    const std::string& host,
    const std::string& port,
    const std::string& database,
    const std::string& username,
    const std::string& password
) {
    // PostgreSQL implementation would go here
    return nullptr;
}

} // namespace crypto_wallet
