#pragma once

#include <string>
#include <vector>
#include <chrono>
#include <map>

namespace crypto_wallet {

enum class OrderType {
    MARKET,
    LIMIT,
    STOP_LOSS,
    TAKE_PROFIT
};

enum class OrderSide {
    BUY,
    SELL
};

enum class OrderStatus {
    PENDING,
    FILLED,
    PARTIALLY_FILLED,
    CANCELLED,
    REJECTED
};

struct TradingPair {
    std::string base_asset;
    std::string quote_asset;
    std::string symbol;
    double min_amount;
    double max_amount;
    double price_precision;
    double amount_precision;
    bool is_active;
};

struct Order {
    std::string order_id;
    std::string wallet_name;
    std::string pair;
    OrderType type;
    OrderSide side;
    double amount;
    double price;
    double filled_amount;
    double remaining_amount;
    OrderStatus status;
    std::chrono::system_clock::time_point created_at;
    std::chrono::system_clock::time_point updated_at;
    std::string error_message;
};

struct MarketData {
    std::string symbol;
    double price;
    double change_24h;
    double volume_24h;
    double high_24h;
    double low_24h;
    std::chrono::system_clock::time_point timestamp;
};

struct OrderBookEntry {
    double price;
    double amount;
    double total;
};

struct OrderBook {
    std::string pair;
    std::vector<OrderBookEntry> bids;
    std::vector<OrderBookEntry> asks;
    std::chrono::system_clock::time_point timestamp;
};

struct Trade {
    std::string trade_id;
    std::string order_id;
    std::string pair;
    OrderSide side;
    double amount;
    double price;
    double fee;
    std::chrono::system_clock::time_point timestamp;
};

class TradingEngine {
public:
    TradingEngine();
    ~TradingEngine();
    
    // Order management
    std::string place_order(const Order& order);
    bool cancel_order(const std::string& order_id);
    std::vector<Order> get_orders(const std::string& wallet_name);
    Order get_order(const std::string& order_id);
    
    // Market data
    std::vector<TradingPair> get_trading_pairs();
    MarketData get_market_data(const std::string& symbol);
    OrderBook get_order_book(const std::string& pair);
    
    // Trade history
    std::vector<Trade> get_trades(const std::string& wallet_name);
    
    // Portfolio
    std::map<std::string, double> get_portfolio_balances(const std::string& wallet_name);
    double get_portfolio_value(const std::string& wallet_name);
    
private:
    std::vector<Order> orders_;
    std::vector<Trade> trades_;
    std::map<std::string, TradingPair> trading_pairs_;
    std::map<std::string, MarketData> market_data_;
    
    // Order ID generation
    std::string generate_order_id();
    
    // Order matching engine
    void process_order(Order& order);
    void match_orders(const std::string& pair);
    
    // Market data updates
    void update_market_data();
    void update_order_book(const std::string& pair);
};

} // namespace crypto_wallet
