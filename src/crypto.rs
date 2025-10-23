use secp256k1::{Secp256k1, SecretKey, PublicKey, Message, ecdsa::Signature};
use sha2::{Sha256, Digest};
use ripemd::{Ripemd160};
use base58::ToBase58;
use bip39::{Mnemonic, Language};
use rand::{rngs::OsRng, Rng};

use crate::error::WalletError;

pub fn generate_mnemonic() -> Result<String, WalletError> {
    let mut rng = OsRng;
    let entropy = (0..16).map(|_| rng.gen::<u8>()).collect::<Vec<u8>>();
    let mnemonic = Mnemonic::from_entropy_in(Language::English, &entropy)
        .map_err(|e| WalletError::Crypto(format!("Failed to generate mnemonic: {}", e)))?;
    Ok(mnemonic.to_string())
}

pub fn mnemonic_to_seed(mnemonic: &str) -> Result<[u8; 64], WalletError> {
    let mnemonic = Mnemonic::parse_in_normalized(Language::English, mnemonic)
        .map_err(|_| WalletError::InvalidSeedPhrase)?;
    
    let seed = mnemonic.to_seed("");
    let mut seed_bytes = [0u8; 64];
    seed_bytes.copy_from_slice(&seed[..64]);
    Ok(seed_bytes)
}

pub fn derive_key_from_seed(seed: &[u8; 64], derivation_path: &str) -> Result<[u8; 32], WalletError> {
    // Simplified key derivation - in a real implementation, you'd use proper BIP32
    let mut hasher = Sha256::new();
    hasher.update(seed);
    hasher.update(derivation_path.as_bytes());
    let hash = hasher.finalize();
    
    let mut key = [0u8; 32];
    key.copy_from_slice(&hash);
    Ok(key)
}

pub fn public_key_to_address(public_key_bytes: &[u8], network: &str) -> Result<String, WalletError> {
    // Hash the public key
    let hash = Sha256::digest(&public_key_bytes[1..]); // Skip the first byte (compression flag)
    let hash = Ripemd160::digest(&hash);
    
    // Add network prefix
    let version_byte = match network {
        "mainnet" => 0x00,
        "testnet" => 0x6f,
        _ => return Err(WalletError::InvalidAddress("Unsupported network".to_string())),
    };
    
    let mut address_bytes = vec![version_byte];
    address_bytes.extend_from_slice(&hash);
    
    // Calculate checksum
    let checksum = &Sha256::digest(&Sha256::digest(&address_bytes))[..4];
    address_bytes.extend_from_slice(checksum);
    
    Ok(address_bytes.to_base58())
}

pub fn hash_message(message: &[u8]) -> [u8; 32] {
    let hash = Sha256::digest(message);
    let mut result = [0u8; 32];
    result.copy_from_slice(&hash);
    result
}

// Advanced cryptographic operations
pub struct AdvancedCrypto;

impl AdvancedCrypto {
    /// Generate a new keypair with proper ECDSA support
    pub fn generate_keypair() -> Result<(SecretKey, PublicKey), WalletError> {
        let secp = Secp256k1::new();
        let mut rng = OsRng;
        let mut secret_bytes = [0u8; 32];
        rng.fill(&mut secret_bytes);
        let secret_key = SecretKey::from_slice(&secret_bytes)
            .map_err(|e| WalletError::Crypto(format!("Invalid secret key: {}", e)))?;
        let public_key = PublicKey::from_secret_key(&secp, &secret_key);
        Ok((secret_key, public_key))
    }
    
    /// Sign a message with ECDSA
    pub fn sign_message(message: &[u8], secret_key: &SecretKey) -> Result<Signature, WalletError> {
        let secp = Secp256k1::new();
        let message_hash = Sha256::digest(message);
        let message = Message::from_digest_slice(&message_hash)
            .map_err(|e| WalletError::Crypto(format!("Invalid message: {}", e)))?;
        
        let signature = secp.sign_ecdsa(&message, secret_key);
        Ok(signature)
    }
    
    /// Verify a signature
    pub fn verify_signature(message: &[u8], signature: &Signature, public_key: &PublicKey) -> Result<bool, WalletError> {
        let secp = Secp256k1::new();
        let message_hash = Sha256::digest(message);
        let message = Message::from_digest_slice(&message_hash)
            .map_err(|e| WalletError::Crypto(format!("Invalid message: {}", e)))?;
        
        Ok(secp.verify_ecdsa(&message, signature, public_key).is_ok())
    }
    
    /// Generate Bitcoin address with proper checksum
    pub fn public_key_to_bitcoin_address(public_key: &PublicKey, network: &str) -> Result<String, WalletError> {
        let public_key_bytes = public_key.serialize_uncompressed();
        let hash = Sha256::digest(&public_key_bytes[1..]);
        let hash = Ripemd160::digest(&hash);
        
        let version_byte = match network {
            "mainnet" => 0x00,
            "testnet" => 0x6f,
            _ => return Err(WalletError::InvalidAddress("Unsupported network".to_string())),
        };
        
        let mut address_bytes = vec![version_byte];
        address_bytes.extend_from_slice(&hash);
        
        let checksum = &Sha256::digest(&Sha256::digest(&address_bytes))[..4];
        address_bytes.extend_from_slice(checksum);
        
        Ok(address_bytes.to_base58())
    }
}
