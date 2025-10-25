#pragma once

#include <string>
#include <vector>
#include <chrono>
#include <memory>
#include "crypto.h"
#include "error.h"

namespace crypto_wallet {

struct Wallet {
    std::string name;
    std::string seed_phrase;
    std::vector<std::string> addresses;
    std::chrono::system_clock::time_point created_at;
    
    // Create a new wallet
    static Wallet create_new(const std::string& name);
    
    // Import wallet from seed phrase
    static Wallet from_seed_phrase(const std::string& seed_phrase, const std::string& name);
    
    // Load existing wallet
    static Wallet load(const std::string& name);
    
    // Save wallet to storage
    void save() const;
    
    // Generate a new address
    std::string generate_address(uint32_t index) const;
    
    // Get all addresses
    const std::vector<std::string>& get_addresses() const { return addresses; }
    
    // Add a new address
    std::string add_new_address();
    
    // Get seed phrase
    const std::string& get_seed_phrase() const { return seed_phrase; }
    
    // Get wallet balance
    double get_balance(const std::string& network) const;
    
    // Send transaction
    std::string send_transaction(
        const std::string& to_address, 
        double amount, 
        const std::string& network
    ) const;
    
    // Validate address format
    bool is_valid_address(const std::string& address) const;
    
    // Default constructor (public for storage)
    Wallet() = default;
};

} // namespace crypto_wallet
