use secp256k1::{Secp256k1, SecretKey, PublicKey, Message, ecdsa::Signature};
use sha2::{Sha256, Digest};
use ripemd::{Ripemd160};
use base58::ToBase58;
use bip39::{Mnemonic, Language};
use bip32::{ExtendedPrivateKey, DerivationPath};
use rand::rngs::OsRng;
use std::str::FromStr;

use crate::error::WalletError;

pub struct KeyPair {
    pub private_key: SecretKey,
    pub public_key: PublicKey,
}

impl KeyPair {
    pub fn new() -> Result<Self, WalletError> {
        let secp = Secp256k1::new();
        let mut rng = OsRng;
        let private_key = SecretKey::new(&mut rng);
        let public_key = PublicKey::from_secret_key(&secp, &private_key);
        
        Ok(KeyPair {
            private_key,
            public_key,
        })
    }
    
    pub fn from_private_key(private_key: SecretKey) -> Result<Self, WalletError> {
        let secp = Secp256k1::new();
        let public_key = PublicKey::from_secret_key(&secp, &private_key);
        
        Ok(KeyPair {
            private_key,
            public_key,
        })
    }
    
    pub fn sign(&self, message: &[u8]) -> Result<Signature, WalletError> {
        let secp = Secp256k1::new();
        let message_hash = Sha256::digest(message);
        let message = Message::from_slice(&message_hash)
            .map_err(|e| WalletError::Crypto(format!("Invalid message: {}", e)))?;
        
        let signature = secp.sign_ecdsa(&message, &self.private_key);
        Ok(signature)
    }
    
    pub fn verify(&self, message: &[u8], signature: &Signature) -> Result<bool, WalletError> {
        let secp = Secp256k1::new();
        let message_hash = Sha256::digest(message);
        let message = Message::from_slice(&message_hash)
            .map_err(|e| WalletError::Crypto(format!("Invalid message: {}", e)))?;
        
        Ok(secp.verify_ecdsa(&message, signature, &self.public_key).is_ok())
    }
}

pub fn generate_mnemonic() -> Result<String, WalletError> {
    let mnemonic = Mnemonic::generate_in(Language::English, 12)
        .map_err(|e| WalletError::Crypto(format!("Failed to generate mnemonic: {}", e)))?;
    Ok(mnemonic.to_string())
}

pub fn mnemonic_to_seed(mnemonic: &str) -> Result<[u8; 64], WalletError> {
    let mnemonic = Mnemonic::parse(mnemonic)
        .map_err(|_| WalletError::InvalidSeedPhrase)?;
    
    let seed = mnemonic.to_seed("");
    let mut seed_bytes = [0u8; 64];
    seed_bytes.copy_from_slice(&seed[..64]);
    Ok(seed_bytes)
}

pub fn derive_key_from_seed(seed: &[u8; 64], derivation_path: &str) -> Result<KeyPair, WalletError> {
    let derivation_path = DerivationPath::from_str(derivation_path)
        .map_err(|e| WalletError::Crypto(format!("Invalid derivation path: {}", e)))?;
    
    let extended_private_key = ExtendedPrivateKey::new_master(secp256k1::Network::Bitcoin, seed)
        .map_err(|e| WalletError::Crypto(format!("Failed to create extended private key: {}", e)))?;
    
    let derived_key = extended_private_key.derive_private_key(&derivation_path)
        .map_err(|e| WalletError::Crypto(format!("Failed to derive key: {}", e)))?;
    
    KeyPair::from_private_key(derived_key.private_key)
}

pub fn public_key_to_address(public_key: &PublicKey, network: &str) -> Result<String, WalletError> {
    let secp = Secp256k1::new();
    let public_key_bytes = public_key.serialize_uncompressed();
    
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
