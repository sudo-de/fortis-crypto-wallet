#pragma once

#include <string>
#include <vector>
#include <memory>
#include <chrono>
#include "error.h"

namespace crypto_wallet {

struct Transaction {
    std::string hash;
    std::string from;
    std::string to;
    double amount;
    std::chrono::system_clock::time_point timestamp;
    
    Transaction() = default;
    Transaction(const std::string& h, const std::string& f, const std::string& t, double a, std::chrono::system_clock::time_point ts)
        : hash(h), from(f), to(t), amount(a), timestamp(ts) {}
};

class NetworkClient {
public:
    // Create network client for specific network
    static std::unique_ptr<NetworkClient> create(const std::string& network);
    
    // Get balance for address
    double get_balance(const std::string& address) const;
    
    // Send transaction
    std::string send_transaction(
        const std::string& from_address,
        const std::string& to_address,
        double amount
    ) const;
    
    // Get transaction history
    std::vector<Transaction> get_transaction_history(const std::string& address) const;
    
    // Constructor (public for make_unique)
    NetworkClient(const std::string& base_url);
    
    std::string base_url_;
    
    // HTTP helper methods
    std::string http_get(const std::string& url) const;
    std::string http_post(const std::string& url, const std::string& data) const;
    
    // JSON parsing helpers
    std::vector<std::string> parse_utxos(const std::string& json_response) const;
    std::vector<Transaction> parse_transactions(const std::string& json_response) const;
};

} // namespace crypto_wallet
