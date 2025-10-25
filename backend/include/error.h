#pragma once

#include <string>
#include <stdexcept>

namespace crypto_wallet {

enum class ErrorType {
    Crypto,
    Network,
    Storage,
    InvalidSeedPhrase,
    InsufficientFunds,
    InvalidAddress,
    WalletNotFound,
    Io,
    Serialization,
    Http
};

class WalletError : public std::runtime_error {
public:
    explicit WalletError(const std::string& message, ErrorType type = ErrorType::Crypto)
        : std::runtime_error(message), type_(type) {}

    ErrorType type() const { return type_; }

    static WalletError crypto(const std::string& message) {
        return WalletError(message, ErrorType::Crypto);
    }

    static WalletError network(const std::string& message) {
        return WalletError(message, ErrorType::Network);
    }

    static WalletError storage(const std::string& message) {
        return WalletError(message, ErrorType::Storage);
    }

    static WalletError invalid_seed_phrase() {
        return WalletError("Invalid seed phrase", ErrorType::InvalidSeedPhrase);
    }

    static WalletError insufficient_funds() {
        return WalletError("Insufficient funds", ErrorType::InsufficientFunds);
    }

    static WalletError invalid_address(const std::string& message) {
        return WalletError("Invalid address: " + message, ErrorType::InvalidAddress);
    }

    static WalletError wallet_not_found(const std::string& name) {
        return WalletError("Wallet not found: " + name, ErrorType::WalletNotFound);
    }

    static WalletError io(const std::string& message) {
        return WalletError("IO error: " + message, ErrorType::Io);
    }

    static WalletError serialization(const std::string& message) {
        return WalletError("Serialization error: " + message, ErrorType::Serialization);
    }

    static WalletError http(const std::string& message) {
        return WalletError("HTTP error: " + message, ErrorType::Http);
    }

private:
    ErrorType type_;
};

} // namespace crypto_wallet
