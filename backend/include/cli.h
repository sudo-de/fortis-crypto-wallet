#pragma once

#include <string>
#include <optional>

namespace crypto_wallet {

struct CreateWallet {
    std::string name;
    std::optional<std::string> password;
};

struct ImportWallet {
    std::string name;
    std::string seed_phrase;
    std::optional<std::string> password;
};

struct SendTransaction {
    std::string wallet_name;
    std::string to_address;
    double amount;
    std::string network;
    std::string fee_rate;
    std::optional<std::string> memo;
};

struct GetBalance {
    std::string wallet_name;
    std::string network;
};

struct ListAddresses {
    std::string wallet_name;
};

struct TransactionHistory {
    std::string wallet_name;
    size_t limit;
    std::optional<std::string> status;
};

struct AddToAddressBook {
    std::string name;
    std::string address;
    std::optional<std::string> label;
    std::optional<std::string> notes;
};

struct ListAddressBook {
    std::optional<std::string> search;
    bool favorites;
};

struct EstimateFee {
    size_t inputs;
    size_t outputs;
    std::string priority;
};

struct EncryptWallet {
    std::string wallet_name;
    std::string password;
};

struct DecryptWallet {
    std::string wallet_name;
    std::string password;
};

} // namespace crypto_wallet
