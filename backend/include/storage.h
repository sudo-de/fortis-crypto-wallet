#pragma once

#include <string>
#include <vector>
#include <filesystem>
#include "wallet.h"
#include "error.h"

namespace crypto_wallet {

class WalletStorage {
public:
    // Get wallet directory path
    static std::filesystem::path get_wallet_dir();
    
    // Get wallet file path
    static std::filesystem::path get_wallet_path(const std::string& name);
    
    // Save wallet to file
    static void save(const Wallet& wallet);
    
    // Load wallet from file
    static Wallet load(const std::string& name);
    
    // List all wallets
    static std::vector<std::string> list_wallets();
    
    // Delete wallet
    static void delete_wallet(const std::string& name);
    
private:
    static void ensure_wallet_dir_exists();
};

} // namespace crypto_wallet
