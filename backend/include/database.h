#pragma once

#include <string>
#include <vector>
#include <memory>
#include <chrono>
#include <optional>
#include <map>

namespace crypto_wallet {

enum class DatabaseType {
    SQLITE,
    POSTGRESQL
};

// Database Models
struct Wallet {
    int id;
    std::string name;
    std::string public_key;
    std::string encrypted_private_key;
    std::string network;
    double balance;
    std::chrono::system_clock::time_point created_at;
    std::chrono::system_clock::time_point updated_at;
    
    Wallet() : id(0), balance(0.0) {}
};

struct Transaction {
    int id;
    int wallet_id;
    std::string tx_hash;
    std::string from_address;
    std::string to_address;
    double amount;
    std::string currency;
    std::string status;
    double fee;
    std::string network;
    std::chrono::system_clock::time_point timestamp;
    std::string memo;
    
    Transaction() : id(0), wallet_id(0), amount(0.0), fee(0.0) {}
};

struct TradingOrder {
    int id;
    int wallet_id;
    std::string order_id;
    std::string pair;
    std::string type; // market, limit, stop_loss, take_profit
    std::string side; // buy, sell
    double amount;
    double price;
    double filled_amount;
    double remaining_amount;
    std::string status; // pending, filled, partially_filled, cancelled, rejected
    std::chrono::system_clock::time_point created_at;
    std::chrono::system_clock::time_point updated_at;
    std::string error_message;
    
    TradingOrder() : id(0), wallet_id(0), amount(0.0), price(0.0), filled_amount(0.0), remaining_amount(0.0) {}
};

struct Trade {
    int id;
    int order_id;
    std::string trade_id;
    std::string pair;
    std::string side;
    double amount;
    double price;
    double fee;
    std::chrono::system_clock::time_point timestamp;
    
    Trade() : id(0), order_id(0), amount(0.0), price(0.0), fee(0.0) {}
};

struct MarketData {
    int id;
    std::string symbol;
    double price;
    double change_24h;
    double volume_24h;
    double high_24h;
    double low_24h;
    std::chrono::system_clock::time_point timestamp;
    
    MarketData() : id(0), price(0.0), change_24h(0.0), volume_24h(0.0), high_24h(0.0), low_24h(0.0) {}
};

struct AddressBook {
    int id;
    int wallet_id;
    std::string name;
    std::string address;
    std::string label;
    std::string notes;
    bool is_favorite;
    std::chrono::system_clock::time_point created_at;
    
    AddressBook() : id(0), wallet_id(0), is_favorite(false) {}
};

// Database Interface
class Database {
public:
    virtual ~Database() = default;
    
    // Connection management
    virtual bool connect() = 0;
    virtual void disconnect() = 0;
    virtual bool is_connected() const = 0;
    
    // Database initialization
    virtual bool initialize_schema() = 0;
    virtual bool run_migrations() = 0;
    
    // Wallet operations
    virtual int create_wallet(const Wallet& wallet) = 0;
    virtual bool update_wallet(const Wallet& wallet) = 0;
    virtual bool delete_wallet(int wallet_id) = 0;
    virtual std::optional<Wallet> get_wallet(int wallet_id) = 0;
    virtual std::optional<Wallet> get_wallet_by_name(const std::string& name) = 0;
    virtual std::vector<Wallet> get_all_wallets() = 0;
    virtual bool update_wallet_balance(int wallet_id, double balance) = 0;
    
    // Transaction operations
    virtual int create_transaction(const Transaction& transaction) = 0;
    virtual bool update_transaction(const Transaction& transaction) = 0;
    virtual bool delete_transaction(int transaction_id) = 0;
    virtual std::optional<Transaction> get_transaction(int transaction_id) = 0;
    virtual std::optional<Transaction> get_transaction_by_hash(const std::string& tx_hash) = 0;
    virtual std::vector<Transaction> get_wallet_transactions(int wallet_id, int limit = 100) = 0;
    virtual std::vector<Transaction> get_transactions_by_status(const std::string& status) = 0;
    virtual std::vector<Transaction> get_transactions_by_currency(const std::string& currency) = 0;
    
    // Trading operations
    virtual int create_trading_order(const TradingOrder& order) = 0;
    virtual bool update_trading_order(const TradingOrder& order) = 0;
    virtual bool delete_trading_order(int order_id) = 0;
    virtual std::optional<TradingOrder> get_trading_order(int order_id) = 0;
    virtual std::optional<TradingOrder> get_trading_order_by_order_id(const std::string& order_id) = 0;
    virtual std::vector<TradingOrder> get_wallet_orders(int wallet_id) = 0;
    virtual std::vector<TradingOrder> get_orders_by_status(const std::string& status) = 0;
    virtual std::vector<TradingOrder> get_orders_by_pair(const std::string& pair) = 0;
    
    // Trade operations
    virtual int create_trade(const Trade& trade) = 0;
    virtual bool update_trade(const Trade& trade) = 0;
    virtual bool delete_trade(int trade_id) = 0;
    virtual std::optional<Trade> get_trade(int trade_id) = 0;
    virtual std::vector<Trade> get_order_trades(int order_id) = 0;
    virtual std::vector<Trade> get_wallet_trades(int wallet_id) = 0;
    
    // Market data operations
    virtual int create_market_data(const MarketData& data) = 0;
    virtual bool update_market_data(const MarketData& data) = 0;
    virtual std::optional<MarketData> get_latest_market_data(const std::string& symbol) = 0;
    virtual std::vector<MarketData> get_market_data_history(const std::string& symbol, int limit = 100) = 0;
    virtual std::vector<MarketData> get_all_market_data() = 0;
    
    // Address book operations
    virtual int create_address_book_entry(const AddressBook& entry) = 0;
    virtual bool update_address_book_entry(const AddressBook& entry) = 0;
    virtual bool delete_address_book_entry(int entry_id) = 0;
    virtual std::optional<AddressBook> get_address_book_entry(int entry_id) = 0;
    virtual std::vector<AddressBook> get_wallet_address_book(int wallet_id) = 0;
    virtual std::vector<AddressBook> search_address_book(const std::string& query) = 0;
    virtual std::vector<AddressBook> get_favorite_addresses(int wallet_id) = 0;
    
    // Analytics and reporting
    virtual std::map<std::string, double> get_portfolio_balances(int wallet_id) = 0;
    virtual double get_total_portfolio_value(int wallet_id) = 0;
    virtual std::vector<std::pair<std::string, double>> get_currency_allocations(int wallet_id) = 0;
    virtual std::vector<Transaction> get_transaction_history(int wallet_id, const std::string& start_date, const std::string& end_date) = 0;
    virtual std::map<std::string, double> get_trading_performance(int wallet_id) = 0;
    
    // Utility functions
    virtual bool begin_transaction() = 0;
    virtual bool commit_transaction() = 0;
    virtual bool rollback_transaction() = 0;
    virtual std::string get_database_info() = 0;
    virtual bool backup_database(const std::string& backup_path) = 0;
    virtual bool restore_database(const std::string& backup_path) = 0;
};

// Database Factory
class DatabaseFactory {
public:
    static std::unique_ptr<Database> create_database(DatabaseType type, const std::string& connection_string);
    static std::unique_ptr<Database> create_sqlite_database(const std::string& db_path);
    static std::unique_ptr<Database> create_postgresql_database(
        const std::string& host,
        const std::string& port,
        const std::string& database,
        const std::string& username,
        const std::string& password
    );
};

// Database Migration System
class DatabaseMigration {
public:
    virtual ~DatabaseMigration() = default;
    virtual std::string get_version() = 0;
    virtual std::string get_description() = 0;
    virtual bool up() = 0;
    virtual bool down() = 0;
};

class MigrationManager {
public:
    static void register_migration(std::unique_ptr<DatabaseMigration> migration);
    static bool run_migrations(Database& database);
    static bool rollback_migration(Database& database, const std::string& version);
    static std::vector<std::string> get_pending_migrations(Database& database);
};

} // namespace crypto_wallet
