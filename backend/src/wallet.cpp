#include "wallet.h"
#include "storage.h"
#include "network.h"
#include "crypto.h"
#include <chrono>
#include <iostream>

namespace crypto_wallet {

Wallet Wallet::create_new(const std::string& name) {
    Wallet wallet;
    wallet.name = name;
    wallet.seed_phrase = Crypto::generate_mnemonic();
    wallet.created_at = std::chrono::system_clock::now();
    
    // Generate initial address
    auto address = wallet.generate_address(0);
    wallet.addresses.push_back(address);
    
    // Save wallet
    wallet.save();
    
    return wallet;
}

Wallet Wallet::from_seed_phrase(const std::string& seed_phrase, const std::string& name) {
    // Validate seed phrase
    try {
        Crypto::mnemonic_to_seed(seed_phrase);
    } catch (...) {
        throw WalletError::invalid_seed_phrase();
    }
    
    Wallet wallet;
    wallet.name = name;
    wallet.seed_phrase = seed_phrase;
    wallet.created_at = std::chrono::system_clock::now();
    
    // Generate initial address
    auto address = wallet.generate_address(0);
    wallet.addresses.push_back(address);
    
    // Save wallet
    wallet.save();
    
    return wallet;
}

Wallet Wallet::load(const std::string& name) {
    return WalletStorage::load(name);
}

void Wallet::save() const {
    WalletStorage::save(*this);
}

std::string Wallet::generate_address(uint32_t index) const {
    auto seed = Crypto::mnemonic_to_seed(seed_phrase);
    std::string derivation_path = "m/44'/0'/0'/0/" + std::to_string(index);
    auto key = Crypto::derive_key_from_seed(seed, derivation_path);
    
    // For demo purposes, generate a simple address
    std::vector<uint8_t> address_bytes = {0x00}; // Mainnet prefix
    address_bytes.insert(address_bytes.end(), key.begin(), key.begin() + 20);
    address_bytes.insert(address_bytes.end(), {0x00, 0x00, 0x00, 0x00}); // Simple checksum
    
    return Crypto::base58_encode(address_bytes);
}

std::string Wallet::add_new_address() {
    uint32_t index = static_cast<uint32_t>(addresses.size());
    auto address = generate_address(index);
    addresses.push_back(address);
    save();
    return address;
}

double Wallet::get_balance(const std::string& network) const {
    auto client = NetworkClient::create(network);
    double total_balance = 0.0;
    
    for (const auto& address : addresses) {
        try {
            auto balance = client->get_balance(address);
            total_balance += balance;
        } catch (const WalletError& e) {
            // Log error but continue with other addresses
            std::cerr << "Error getting balance for address " << address << ": " << e.what() << std::endl;
        }
    }
    
    return total_balance;
}

std::string Wallet::send_transaction(
    const std::string& to_address, 
    double amount, 
    const std::string& network
) const {
    // Validate address format
    if (!is_valid_address(to_address)) {
        throw WalletError::invalid_address("Invalid recipient address: " + to_address);
    }
    
    // Check balance
    auto balance = get_balance(network);
    if (balance < amount) {
        throw WalletError::insufficient_funds();
    }
    
    // Create transaction
    auto client = NetworkClient::create(network);
    auto tx_hash = client->send_transaction(addresses[0], to_address, amount);
    
    return tx_hash;
}

bool Wallet::is_valid_address(const std::string& address) const {
    return Crypto::is_valid_address(address);
}

} // namespace crypto_wallet
