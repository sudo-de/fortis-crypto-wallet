#include "network.h"
#include <curl/curl.h>
#include <nlohmann/json.hpp>
#include <sstream>
#include <iostream>

namespace crypto_wallet {

// Callback function for curl
static size_t WriteCallback(void* contents, size_t size, size_t nmemb, std::string* s) {
    size_t newLength = size * nmemb;
    try {
        s->append((char*)contents, newLength);
        return newLength;
    } catch (std::bad_alloc& e) {
        return 0;
    }
}

NetworkClient::NetworkClient(const std::string& base_url) : base_url_(base_url) {}

std::unique_ptr<NetworkClient> NetworkClient::create(const std::string& network) {
    std::string base_url;
    if (network == "mainnet") {
        base_url = "https://blockstream.info/api";
    } else if (network == "testnet") {
        base_url = "https://blockstream.info/testnet/api";
    } else {
        throw WalletError::network("Unsupported network: " + network);
    }
    
    return std::make_unique<NetworkClient>(base_url);
}

double NetworkClient::get_balance(const std::string& address) const {
    std::string url = base_url_ + "/address/" + address + "/utxo";
    std::string response = http_get(url);
    
    try {
        auto json = nlohmann::json::parse(response);
        double balance = 0.0;
        
        for (const auto& utxo : json) {
            if (utxo.contains("value") && utxo["value"].is_number()) {
                balance += utxo["value"].get<double>() / 100000000.0; // Convert satoshis to BTC
            }
        }
        
        return balance;
    } catch (const std::exception& e) {
        throw WalletError::network("Failed to parse balance response: " + std::string(e.what()));
    }
}

std::string NetworkClient::send_transaction(
    const std::string& from_address,
    const std::string& to_address,
    double amount
) const {
    // This is a simplified implementation
    // In a real wallet, you would:
    // 1. Get UTXOs for the from_address
    // 2. Create a proper Bitcoin transaction
    // 3. Sign the transaction with the private key
    // 4. Broadcast the transaction to the network
    
    // For now, we'll simulate a transaction
    std::string tx_hash = "tx_" + from_address + "_" + to_address + "_" + std::to_string(amount);
    
    // In a real implementation, you would broadcast to the network
    // For demo purposes, we'll just return a mock hash
    return tx_hash;
}

std::vector<Transaction> NetworkClient::get_transaction_history(const std::string& address) const {
    std::string url = base_url_ + "/address/" + address + "/txs";
    std::string response = http_get(url);
    
    try {
        auto json = nlohmann::json::parse(response);
        std::vector<Transaction> transactions;
        
        for (const auto& tx : json) {
            if (tx.contains("txid") && tx.contains("status") && 
                tx["status"].contains("block_time")) {
                
                std::string hash = tx["txid"];
                auto time_t = tx["status"]["block_time"].get<uint64_t>();
                auto timestamp = std::chrono::system_clock::from_time_t(time_t);
                
                transactions.emplace_back(hash, "unknown", "unknown", 0.0, timestamp);
            }
        }
        
        return transactions;
    } catch (const std::exception& e) {
        throw WalletError::network("Failed to parse transaction history: " + std::string(e.what()));
    }
}

std::string NetworkClient::http_get(const std::string& url) const {
    CURL* curl;
    CURLcode res;
    std::string readBuffer;
    
    curl = curl_easy_init();
    if (curl) {
        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
        curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
        curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 1L);
        curl_easy_setopt(curl, CURLOPT_TIMEOUT, 30L);
        
        res = curl_easy_perform(curl);
        curl_easy_cleanup(curl);
        
        if (res != CURLE_OK) {
            throw WalletError::http("CURL error: " + std::string(curl_easy_strerror(res)));
        }
    } else {
        throw WalletError::http("Failed to initialize CURL");
    }
    
    return readBuffer;
}

std::string NetworkClient::http_post(const std::string& url, const std::string& data) const {
    CURL* curl;
    CURLcode res;
    std::string readBuffer;
    
    curl = curl_easy_init();
    if (curl) {
        curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data.c_str());
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &readBuffer);
        curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
        curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, 1L);
        curl_easy_setopt(curl, CURLOPT_TIMEOUT, 30L);
        
        res = curl_easy_perform(curl);
        curl_easy_cleanup(curl);
        
        if (res != CURLE_OK) {
            throw WalletError::http("CURL error: " + std::string(curl_easy_strerror(res)));
        }
    } else {
        throw WalletError::http("Failed to initialize CURL");
    }
    
    return readBuffer;
}

} // namespace crypto_wallet
