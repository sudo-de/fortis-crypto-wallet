#include "database.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <memory>

namespace crypto_wallet {

class DatabaseManager {
private:
    std::unique_ptr<Database> database_;
    DatabaseType db_type_;
    std::string connection_string_;
    bool initialized_;

public:
    DatabaseManager() : initialized_(false) {}
    
    ~DatabaseManager() {
        if (database_) {
            database_->disconnect();
        }
    }
    
    bool initialize(DatabaseType type, const std::string& connection_string) {
        db_type_ = type;
        connection_string_ = connection_string;
        
        // Create database instance
        database_ = DatabaseFactory::create_database(type, connection_string);
        if (!database_) {
            std::cerr << "Failed to create database instance" << std::endl;
            return false;
        }
        
        // Connect to database
        if (!database_->connect()) {
            std::cerr << "Failed to connect to database" << std::endl;
            return false;
        }
        
        // Initialize schema
        if (!database_->initialize_schema()) {
            std::cerr << "Failed to initialize database schema" << std::endl;
            return false;
        }
        
        // Run migrations
        if (!database_->run_migrations()) {
            std::cerr << "Failed to run database migrations" << std::endl;
            return false;
        }
        
        initialized_ = true;
        std::cout << "Database initialized successfully: " << database_->get_database_info() << std::endl;
        return true;
    }
    
    bool is_initialized() const {
        return initialized_ && database_ && database_->is_connected();
    }
    
    Database* get_database() {
        return database_.get();
    }
    
    // Wallet operations
    int create_wallet(const std::string& name, const std::string& public_key, 
                     const std::string& encrypted_private_key, const std::string& network) {
        if (!is_initialized()) return -1;
        
        Wallet wallet;
        wallet.name = name;
        wallet.public_key = public_key;
        wallet.encrypted_private_key = encrypted_private_key;
        wallet.network = network;
        wallet.balance = 0.0;
        
        return database_->create_wallet(wallet);
    }
    
    std::optional<Wallet> get_wallet(int wallet_id) {
        if (!is_initialized()) return std::nullopt;
        return database_->get_wallet(wallet_id);
    }
    
    std::optional<Wallet> get_wallet_by_name(const std::string& name) {
        if (!is_initialized()) return std::nullopt;
        return database_->get_wallet_by_name(name);
    }
    
    std::vector<Wallet> get_all_wallets() {
        if (!is_initialized()) return {};
        return database_->get_all_wallets();
    }
    
    bool update_wallet_balance(int wallet_id, double balance) {
        if (!is_initialized()) return false;
        return database_->update_wallet_balance(wallet_id, balance);
    }
    
    // Transaction operations
    int create_transaction(int wallet_id, const std::string& tx_hash, 
                          const std::string& from_address, const std::string& to_address,
                          double amount, const std::string& currency, const std::string& status,
                          double fee = 0.0, const std::string& network = "mainnet",
                          const std::string& memo = "") {
        if (!is_initialized()) return -1;
        
        Transaction transaction;
        transaction.wallet_id = wallet_id;
        transaction.tx_hash = tx_hash;
        transaction.from_address = from_address;
        transaction.to_address = to_address;
        transaction.amount = amount;
        transaction.currency = currency;
        transaction.status = status;
        transaction.fee = fee;
        transaction.network = network;
        transaction.timestamp = std::chrono::system_clock::now();
        transaction.memo = memo;
        
        return database_->create_transaction(transaction);
    }
    
    std::vector<Transaction> get_wallet_transactions(int wallet_id, int limit = 100) {
        if (!is_initialized()) return {};
        return database_->get_wallet_transactions(wallet_id, limit);
    }
    
    // Trading operations
    int create_trading_order(int wallet_id, const std::string& order_id, const std::string& pair,
                            const std::string& type, const std::string& side, double amount, double price) {
        if (!is_initialized()) return -1;
        
        TradingOrder order;
        order.wallet_id = wallet_id;
        order.order_id = order_id;
        order.pair = pair;
        order.type = type;
        order.side = side;
        order.amount = amount;
        order.price = price;
        order.remaining_amount = amount;
        order.status = "pending";
        order.created_at = std::chrono::system_clock::now();
        order.updated_at = order.created_at;
        
        return database_->create_trading_order(order);
    }
    
    std::vector<TradingOrder> get_wallet_orders(int wallet_id) {
        if (!is_initialized()) return {};
        return database_->get_wallet_orders(wallet_id);
    }
    
    // Market data operations
    int update_market_data(const std::string& symbol, double price, double change_24h,
                          double volume_24h, double high_24h, double low_24h) {
        if (!is_initialized()) return -1;
        
        MarketData data;
        data.symbol = symbol;
        data.price = price;
        data.change_24h = change_24h;
        data.volume_24h = volume_24h;
        data.high_24h = high_24h;
        data.low_24h = low_24h;
        data.timestamp = std::chrono::system_clock::now();
        
        return database_->create_market_data(data);
    }
    
    std::optional<MarketData> get_latest_market_data(const std::string& symbol) {
        if (!is_initialized()) return std::nullopt;
        return database_->get_latest_market_data(symbol);
    }
    
    // Analytics
    std::map<std::string, double> get_portfolio_balances(int wallet_id) {
        if (!is_initialized()) return {};
        return database_->get_portfolio_balances(wallet_id);
    }
    
    double get_total_portfolio_value(int wallet_id) {
        if (!is_initialized()) return 0.0;
        return database_->get_total_portfolio_value(wallet_id);
    }
    
    // Backup and restore
    bool backup_database(const std::string& backup_path) {
        if (!is_initialized()) return false;
        return database_->backup_database(backup_path);
    }
    
    bool restore_database(const std::string& backup_path) {
        if (!is_initialized()) return false;
        return database_->restore_database(backup_path);
    }
    
    // Utility functions
    bool begin_transaction() {
        if (!is_initialized()) return false;
        return database_->begin_transaction();
    }
    
    bool commit_transaction() {
        if (!is_initialized()) return false;
        return database_->commit_transaction();
    }
    
    bool rollback_transaction() {
        if (!is_initialized()) return false;
        return database_->rollback_transaction();
    }
    
    std::string get_database_info() {
        if (!is_initialized()) return "Database not initialized";
        return database_->get_database_info();
    }
};

// Global database manager instance
static std::unique_ptr<DatabaseManager> g_database_manager = nullptr;

// Initialize global database manager
bool initialize_database(DatabaseType type, const std::string& connection_string) {
    g_database_manager = std::make_unique<DatabaseManager>();
    return g_database_manager->initialize(type, connection_string);
}

// Get global database manager
DatabaseManager* get_database_manager() {
    return g_database_manager.get();
}

// Cleanup global database manager
void cleanup_database() {
    g_database_manager.reset();
}

} // namespace crypto_wallet
