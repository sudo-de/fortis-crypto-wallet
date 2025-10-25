#include "storage.h"
#include <filesystem>
#include <fstream>
#include <iostream>
#include <nlohmann/json.hpp>

namespace crypto_wallet {

std::filesystem::path WalletStorage::get_wallet_dir() {
    auto home_dir = std::filesystem::path(std::getenv("HOME"));
    auto wallet_dir = home_dir / ".crypto-wallet";
    ensure_wallet_dir_exists();
    return wallet_dir;
}

std::filesystem::path WalletStorage::get_wallet_path(const std::string& name) {
    auto wallet_dir = get_wallet_dir();
    return wallet_dir / (name + ".json");
}

void WalletStorage::save(const Wallet& wallet) {
    auto path = get_wallet_path(wallet.name);
    
    nlohmann::json j;
    j["name"] = wallet.name;
    j["seed_phrase"] = wallet.seed_phrase;
    j["addresses"] = wallet.addresses;
    
    // Convert time_point to string
    auto time_t = std::chrono::system_clock::to_time_t(wallet.created_at);
    j["created_at"] = std::to_string(time_t);
    
    std::ofstream file(path);
    if (!file.is_open()) {
        throw WalletError::storage("Failed to open wallet file for writing");
    }
    
    file << j.dump(4);
    file.close();
}

Wallet WalletStorage::load(const std::string& name) {
    auto path = get_wallet_path(name);
    
    if (!std::filesystem::exists(path)) {
        throw WalletError::wallet_not_found(name);
    }
    
    std::ifstream file(path);
    if (!file.is_open()) {
        throw WalletError::storage("Failed to open wallet file for reading");
    }
    
    nlohmann::json j;
    file >> j;
    file.close();
    
    Wallet wallet;
    wallet.name = j["name"];
    wallet.seed_phrase = j["seed_phrase"];
    wallet.addresses = j["addresses"];
    
    // Convert string back to time_point
    auto time_t = std::stoll(j["created_at"].get<std::string>());
    wallet.created_at = std::chrono::system_clock::from_time_t(time_t);
    
    return wallet;
}

std::vector<std::string> WalletStorage::list_wallets() {
    auto wallet_dir = get_wallet_dir();
    std::vector<std::string> wallets;
    
    try {
        for (const auto& entry : std::filesystem::directory_iterator(wallet_dir)) {
            if (entry.is_regular_file() && entry.path().extension() == ".json") {
                auto filename = entry.path().stem().string();
                wallets.push_back(filename);
            }
        }
    } catch (const std::filesystem::filesystem_error& e) {
        throw WalletError::storage("Failed to read wallet directory: " + std::string(e.what()));
    }
    
    return wallets;
}

void WalletStorage::delete_wallet(const std::string& name) {
    auto path = get_wallet_path(name);
    
    if (!std::filesystem::exists(path)) {
        throw WalletError::wallet_not_found(name);
    }
    
    try {
        std::filesystem::remove(path);
    } catch (const std::filesystem::filesystem_error& e) {
        throw WalletError::storage("Failed to delete wallet: " + std::string(e.what()));
    }
}

void WalletStorage::ensure_wallet_dir_exists() {
    auto home_dir = std::filesystem::path(std::getenv("HOME"));
    auto wallet_dir = home_dir / ".crypto-wallet";
    
    try {
        std::filesystem::create_directories(wallet_dir);
    } catch (const std::filesystem::filesystem_error& e) {
        throw WalletError::storage("Failed to create wallet directory: " + std::string(e.what()));
    }
}

} // namespace crypto_wallet
