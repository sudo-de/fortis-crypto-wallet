#include "crypto.h"
#include <openssl/sha.h>
#include <openssl/ripemd.h>
#include <openssl/ec.h>
#include <openssl/ecdsa.h>
#include <openssl/obj_mac.h>
#include <openssl/rand.h>
#include <openssl/bn.h>
#include <openssl/evp.h>
#include <random>
#include <sstream>
#include <iomanip>
#include <algorithm>

namespace crypto_wallet {

// Base58 alphabet
const std::string BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

std::string Crypto::generate_mnemonic() {
    // Generate 128 bits of entropy
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(0, 255);
    
    std::vector<uint8_t> entropy(16);
    for (auto& byte : entropy) {
        byte = dis(gen);
    }
    
    // For simplicity, return a mock mnemonic
    // In a real implementation, you'd use BIP39 wordlist
    return "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
}

std::array<uint8_t, 64> Crypto::mnemonic_to_seed(const std::string& mnemonic) {
    // Simplified implementation - in reality you'd use PBKDF2 with BIP39
    std::array<uint8_t, 64> seed{};
    
    // Use SHA256 of mnemonic as seed (simplified)
    auto hash = sha256(std::vector<uint8_t>(mnemonic.begin(), mnemonic.end()));
    std::copy(hash.begin(), hash.end(), seed.begin());
    std::copy(hash.begin(), hash.end(), seed.begin() + 32);
    
    return seed;
}

std::array<uint8_t, 32> Crypto::derive_key_from_seed(
    const std::array<uint8_t, 64>& seed, 
    const std::string& derivation_path
) {
    // Simplified key derivation
    std::vector<uint8_t> data(seed.begin(), seed.end());
    data.insert(data.end(), derivation_path.begin(), derivation_path.end());
    
    auto hash = sha256(data);
    std::array<uint8_t, 32> key{};
    std::copy(hash.begin(), hash.end(), key.begin());
    
    return key;
}

std::string Crypto::public_key_to_address(
    const std::vector<uint8_t>& public_key_bytes, 
    const std::string& network
) {
    // Hash the public key
    auto hash = sha256(public_key_bytes);
    std::vector<uint8_t> hash_vec(hash.begin(), hash.end());
    auto ripemd_hash = ripemd160(hash_vec);
    
    // Add network prefix
    uint8_t version_byte = (network == "mainnet") ? 0x00 : 0x6f;
    
    std::vector<uint8_t> address_bytes;
    address_bytes.push_back(version_byte);
    address_bytes.insert(address_bytes.end(), ripemd_hash.begin(), ripemd_hash.end());
    
    // Calculate checksum
    auto checksum = double_sha256(address_bytes);
    address_bytes.insert(address_bytes.end(), checksum.begin(), checksum.begin() + 4);
    
    return base58_encode(address_bytes);
}

std::array<uint8_t, 32> Crypto::hash_message(const std::vector<uint8_t>& message) {
    return sha256(message);
}

std::pair<std::array<uint8_t, 32>, std::vector<uint8_t>> Crypto::generate_keypair() {
    std::array<uint8_t, 32> secret_key{};
    RAND_bytes(secret_key.data(), 32);
    
    // Generate public key from secret key (simplified)
    std::vector<uint8_t> public_key(33);
    public_key[0] = 0x02; // Compressed public key prefix
    std::copy(secret_key.begin(), secret_key.end(), public_key.begin() + 1);
    
    return {secret_key, public_key};
}

std::vector<uint8_t> Crypto::sign_message(
    const std::vector<uint8_t>& message, 
    const std::array<uint8_t, 32>& secret_key
) {
    // Simplified signature - in reality you'd use ECDSA
    auto hash = sha256(message);
    std::vector<uint8_t> signature(64);
    std::copy(hash.begin(), hash.end(), signature.begin());
    std::copy(secret_key.begin(), secret_key.end(), signature.begin() + 32);
    
    return signature;
}

bool Crypto::verify_signature(
    const std::vector<uint8_t>& message,
    const std::vector<uint8_t>& signature,
    const std::vector<uint8_t>& public_key
) {
    // Simplified verification
    auto hash = sha256(message);
    return std::equal(hash.begin(), hash.end(), signature.begin());
}

std::string Crypto::public_key_to_bitcoin_address(
    const std::vector<uint8_t>& public_key,
    const std::string& network
) {
    return public_key_to_address(public_key, network);
}

bool Crypto::is_valid_address(const std::string& address) {
    if (address.length() < 26 || address.length() > 35) {
        return false;
    }
    
    try {
        auto decoded = base58_decode(address);
        return decoded.size() >= 25; // Minimum valid address size
    } catch (...) {
        return false;
    }
}

std::string Crypto::base58_encode(const std::vector<uint8_t>& data) {
    std::string result;
    std::vector<uint8_t> digits;
    
    // Convert to base58
    for (uint8_t byte : data) {
        int carry = byte;
        for (size_t i = 0; i < digits.size(); ++i) {
            carry += 256 * digits[i];
            digits[i] = carry % 58;
            carry /= 58;
        }
        while (carry > 0) {
            digits.push_back(carry % 58);
            carry /= 58;
        }
    }
    
    // Handle leading zeros
    for (size_t i = 0; i < data.size() && data[i] == 0; ++i) {
        result += '1';
    }
    
    // Convert digits to string
    for (auto it = digits.rbegin(); it != digits.rend(); ++it) {
        result += BASE58_ALPHABET[*it];
    }
    
    return result;
}

std::vector<uint8_t> Crypto::base58_decode(const std::string& encoded) {
    std::vector<uint8_t> result;
    std::vector<int> digits;
    
    // Convert string to digits
    for (char c : encoded) {
        auto pos = BASE58_ALPHABET.find(c);
        if (pos == std::string::npos) {
            throw std::invalid_argument("Invalid base58 character");
        }
        digits.push_back(pos);
    }
    
    // Convert from base58
    for (int digit : digits) {
        int carry = digit;
        for (size_t i = 0; i < result.size(); ++i) {
            carry += 58 * result[i];
            result[i] = carry % 256;
            carry /= 256;
        }
        while (carry > 0) {
            result.push_back(carry % 256);
            carry /= 256;
        }
    }
    
    // Handle leading zeros
    for (size_t i = 0; i < encoded.size() && encoded[i] == '1'; ++i) {
        result.push_back(0);
    }
    
    std::reverse(result.begin(), result.end());
    return result;
}

std::array<uint8_t, 32> Crypto::sha256(const std::vector<uint8_t>& data) {
    std::array<uint8_t, 32> hash{};
    SHA256(data.data(), data.size(), hash.data());
    return hash;
}

std::array<uint8_t, 20> Crypto::ripemd160(const std::vector<uint8_t>& data) {
    std::array<uint8_t, 20> hash{};
    RIPEMD160(data.data(), data.size(), hash.data());
    return hash;
}

std::array<uint8_t, 32> Crypto::double_sha256(const std::vector<uint8_t>& data) {
    auto first_hash = sha256(data);
    return sha256(std::vector<uint8_t>(first_hash.begin(), first_hash.end()));
}

} // namespace crypto_wallet
