#pragma once

#include <string>
#include <vector>
#include <array>
#include <memory>
#include "error.h"

namespace crypto_wallet {

class Crypto {
public:
    // Generate a new mnemonic seed phrase
    static std::string generate_mnemonic();
    
    // Convert mnemonic to seed
    static std::array<uint8_t, 64> mnemonic_to_seed(const std::string& mnemonic);
    
    // Derive key from seed using derivation path
    static std::array<uint8_t, 32> derive_key_from_seed(
        const std::array<uint8_t, 64>& seed, 
        const std::string& derivation_path
    );
    
    // Convert public key to Bitcoin address
    static std::string public_key_to_address(
        const std::vector<uint8_t>& public_key_bytes, 
        const std::string& network
    );
    
    // Hash a message
    static std::array<uint8_t, 32> hash_message(const std::vector<uint8_t>& message);
    
    // Generate a new keypair
    static std::pair<std::array<uint8_t, 32>, std::vector<uint8_t>> generate_keypair();
    
    // Sign a message
    static std::vector<uint8_t> sign_message(
        const std::vector<uint8_t>& message, 
        const std::array<uint8_t, 32>& secret_key
    );
    
    // Verify a signature
    static bool verify_signature(
        const std::vector<uint8_t>& message,
        const std::vector<uint8_t>& signature,
        const std::vector<uint8_t>& public_key
    );
    
    // Generate Bitcoin address with proper checksum
    static std::string public_key_to_bitcoin_address(
        const std::vector<uint8_t>& public_key,
        const std::string& network
    );
    
    // Validate Bitcoin address
    static bool is_valid_address(const std::string& address);
    
    // Base58 encoding/decoding
    static std::string base58_encode(const std::vector<uint8_t>& data);
    static std::vector<uint8_t> base58_decode(const std::string& encoded);
    
    // SHA256 hashing
    static std::array<uint8_t, 32> sha256(const std::vector<uint8_t>& data);
    
    // RIPEMD160 hashing
    static std::array<uint8_t, 20> ripemd160(const std::vector<uint8_t>& data);
    
    // Double SHA256 (used for Bitcoin checksums)
    static std::array<uint8_t, 32> double_sha256(const std::vector<uint8_t>& data);
};

} // namespace crypto_wallet
