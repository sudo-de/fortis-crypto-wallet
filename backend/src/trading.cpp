#include "trading.h"
#include "error.h"
#include <iostream>
#include <sstream>
#include <random>
#include <algorithm>
#include <iomanip>

namespace crypto_wallet {

TradingEngine::TradingEngine() {
    // Initialize trading pairs
    trading_pairs_["BTC/USDT"] = {"BTC", "USDT", "BTC/USDT", 0.001, 100.0, 2, 6, true};
    trading_pairs_["ETH/USDT"] = {"ETH", "USDT", "ETH/USDT", 0.01, 1000.0, 2, 4, true};
    trading_pairs_["ADA/USDT"] = {"ADA", "USDT", "ADA/USDT", 1.0, 100000.0, 4, 0, true};
    trading_pairs_["SOL/USDT"] = {"SOL", "USDT", "SOL/USDT", 0.1, 10000.0, 2, 2, true};
    
    // Initialize market data
    market_data_["BTC"] = {"BTC", 43250.0, 2.5, 1500000000.0, 44500.0, 42000.0, std::chrono::system_clock::now()};
    market_data_["ETH"] = {"ETH", 2850.0, 1.8, 800000000.0, 2950.0, 2750.0, std::chrono::system_clock::now()};
    market_data_["ADA"] = {"ADA", 0.45, -0.5, 50000000.0, 0.48, 0.42, std::chrono::system_clock::now()};
    market_data_["SOL"] = {"SOL", 100.0, 3.2, 200000000.0, 105.0, 95.0, std::chrono::system_clock::now()};
}

TradingEngine::~TradingEngine() = default;

std::string TradingEngine::place_order(const Order& order) {
    Order new_order = order;
    new_order.order_id = generate_order_id();
    new_order.status = OrderStatus::PENDING;
    new_order.created_at = std::chrono::system_clock::now();
    new_order.updated_at = new_order.created_at;
    new_order.filled_amount = 0.0;
    new_order.remaining_amount = order.amount;
    
    // Validate order
    if (order.amount <= 0) {
        new_order.status = OrderStatus::REJECTED;
        new_order.error_message = "Invalid amount";
        orders_.push_back(new_order);
        return new_order.order_id;
    }
    
    if (order.price <= 0 && order.type != OrderType::MARKET) {
        new_order.status = OrderStatus::REJECTED;
        new_order.error_message = "Invalid price for limit order";
        orders_.push_back(new_order);
        return new_order.order_id;
    }
    
    // Process the order
    process_order(new_order);
    orders_.push_back(new_order);
    
    return new_order.order_id;
}

bool TradingEngine::cancel_order(const std::string& order_id) {
    auto it = std::find_if(orders_.begin(), orders_.end(),
        [&order_id](const Order& order) { return order.order_id == order_id; });
    
    if (it != orders_.end() && it->status == OrderStatus::PENDING) {
        it->status = OrderStatus::CANCELLED;
        it->updated_at = std::chrono::system_clock::now();
        return true;
    }
    
    return false;
}

std::vector<Order> TradingEngine::get_orders(const std::string& wallet_name) {
    std::vector<Order> wallet_orders;
    for (const auto& order : orders_) {
        if (order.wallet_name == wallet_name) {
            wallet_orders.push_back(order);
        }
    }
    return wallet_orders;
}

Order TradingEngine::get_order(const std::string& order_id) {
    auto it = std::find_if(orders_.begin(), orders_.end(),
        [&order_id](const Order& order) { return order.order_id == order_id; });
    
    if (it != orders_.end()) {
        return *it;
    }
    
    // Return empty order if not found
    return Order{};
}

std::vector<TradingPair> TradingEngine::get_trading_pairs() {
    std::vector<TradingPair> pairs;
    for (const auto& pair : trading_pairs_) {
        pairs.push_back(pair.second);
    }
    return pairs;
}

MarketData TradingEngine::get_market_data(const std::string& symbol) {
    auto it = market_data_.find(symbol);
    if (it != market_data_.end()) {
        return it->second;
    }
    
    // Return empty market data if not found
    return MarketData{};
}

OrderBook TradingEngine::get_order_book(const std::string& pair) {
    OrderBook book;
    book.pair = pair;
    book.timestamp = std::chrono::system_clock::now();
    
    // Generate mock order book data
    std::random_device rd;
    std::mt19937 gen(rd());
    
    // Get current market price
    std::string base_asset = pair.substr(0, pair.find('/'));
    auto market_it = market_data_.find(base_asset);
    if (market_it == market_data_.end()) {
        return book;
    }
    
    double current_price = market_it->second.price;
    
    // Generate bids (buy orders)
    for (int i = 0; i < 10; ++i) {
        double price = current_price * (1.0 - (i + 1) * 0.001);
        double amount = 0.1 + (i * 0.1);
        book.bids.push_back({price, amount, price * amount});
    }
    
    // Generate asks (sell orders)
    for (int i = 0; i < 10; ++i) {
        double price = current_price * (1.0 + (i + 1) * 0.001);
        double amount = 0.1 + (i * 0.1);
        book.asks.push_back({price, amount, price * amount});
    }
    
    return book;
}

std::vector<Trade> TradingEngine::get_trades(const std::string& wallet_name) {
    std::vector<Trade> wallet_trades;
    for (const auto& trade : trades_) {
        // Find the order to check wallet name
        auto order_it = std::find_if(orders_.begin(), orders_.end(),
            [&trade](const Order& order) { return order.order_id == trade.order_id; });
        
        if (order_it != orders_.end() && order_it->wallet_name == wallet_name) {
            wallet_trades.push_back(trade);
        }
    }
    return wallet_trades;
}

std::map<std::string, double> TradingEngine::get_portfolio_balances(const std::string& wallet_name) {
    std::map<std::string, double> balances;
    
    // Initialize with some default balances
    balances["BTC"] = 2.5;
    balances["ETH"] = 15.8;
    balances["ADA"] = 5000.0;
    balances["SOL"] = 25.0;
    balances["USDT"] = 10000.0;
    
    // Calculate net balances from trades
    for (const auto& trade : trades_) {
        auto order_it = std::find_if(orders_.begin(), orders_.end(),
            [&trade](const Order& order) { return order.order_id == trade.order_id; });
        
        if (order_it != orders_.end() && order_it->wallet_name == wallet_name) {
            std::string base_asset = trade.pair.substr(0, trade.pair.find('/'));
            std::string quote_asset = trade.pair.substr(trade.pair.find('/') + 1);
            
            if (trade.side == OrderSide::BUY) {
                balances[base_asset] += trade.amount;
                balances[quote_asset] -= trade.amount * trade.price;
            } else {
                balances[base_asset] -= trade.amount;
                balances[quote_asset] += trade.amount * trade.price;
            }
        }
    }
    
    return balances;
}

double TradingEngine::get_portfolio_value(const std::string& wallet_name) {
    auto balances = get_portfolio_balances(wallet_name);
    double total_value = 0.0;
    
    for (const auto& balance : balances) {
        if (balance.first == "USDT") {
            total_value += balance.second;
        } else {
            auto market_it = market_data_.find(balance.first);
            if (market_it != market_data_.end()) {
                total_value += balance.second * market_it->second.price;
            }
        }
    }
    
    return total_value;
}

std::string TradingEngine::generate_order_id() {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(100000, 999999);
    
    std::stringstream ss;
    ss << "ORD" << dis(gen);
    return ss.str();
}

void TradingEngine::process_order(Order& order) {
    // For market orders, fill immediately at current market price
    if (order.type == OrderType::MARKET) {
        std::string base_asset = order.pair.substr(0, order.pair.find('/'));
        auto market_it = market_data_.find(base_asset);
        
        if (market_it != market_data_.end()) {
            order.price = market_it->second.price;
            order.filled_amount = order.amount;
            order.remaining_amount = 0.0;
            order.status = OrderStatus::FILLED;
            order.updated_at = std::chrono::system_clock::now();
            
            // Create trade record
            Trade trade;
            trade.trade_id = "TRD" + std::to_string(std::chrono::system_clock::now().time_since_epoch().count());
            trade.order_id = order.order_id;
            trade.pair = order.pair;
            trade.side = order.side;
            trade.amount = order.amount;
            trade.price = order.price;
            trade.fee = order.amount * order.price * 0.001; // 0.1% fee
            trade.timestamp = std::chrono::system_clock::now();
            
            trades_.push_back(trade);
        }
    }
    // For limit orders, add to order book for matching
    else if (order.type == OrderType::LIMIT) {
        // In a real implementation, this would add to the order book
        // For now, we'll simulate immediate matching if price is favorable
        std::string base_asset = order.pair.substr(0, order.pair.find('/'));
        auto market_it = market_data_.find(base_asset);
        
        if (market_it != market_data_.end()) {
            double current_price = market_it->second.price;
            
            // Simple matching logic
            if ((order.side == OrderSide::BUY && order.price >= current_price) ||
                (order.side == OrderSide::SELL && order.price <= current_price)) {
                
                order.filled_amount = order.amount;
                order.remaining_amount = 0.0;
                order.status = OrderStatus::FILLED;
                order.updated_at = std::chrono::system_clock::now();
                
                // Create trade record
                Trade trade;
                trade.trade_id = "TRD" + std::to_string(std::chrono::system_clock::now().time_since_epoch().count());
                trade.order_id = order.order_id;
                trade.pair = order.pair;
                trade.side = order.side;
                trade.amount = order.amount;
                trade.price = order.price;
                trade.fee = order.amount * order.price * 0.001; // 0.1% fee
                trade.timestamp = std::chrono::system_clock::now();
                
                trades_.push_back(trade);
            }
        }
    }
}

void TradingEngine::match_orders(const std::string& pair) {
    // In a real implementation, this would match buy and sell orders
    // For now, this is a placeholder
}

void TradingEngine::update_market_data() {
    // In a real implementation, this would fetch real market data
    // For now, we'll simulate price movements
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<> dis(-0.05, 0.05); // ±5% price movement
    
    for (auto& market : market_data_) {
        double change = dis(gen);
        market.second.price *= (1.0 + change);
        market.second.change_24h = change * 100;
        market.second.timestamp = std::chrono::system_clock::now();
    }
}

void TradingEngine::update_order_book(const std::string& pair) {
    // In a real implementation, this would update the order book
    // For now, this is a placeholder
}

} // namespace crypto_wallet
