use aes_gcm::{Aes256Gcm, Key, Nonce};
use aes_gcm::aead::{Aead, NewAead};
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use argon2::password_hash::{rand_core::OsRng, SaltString};
use rand::RngCore;
use serde::{Deserialize, Serialize};
use crate::error::WalletError;

#[derive(Debug, Serialize, Deserialize)]
pub struct EncryptedWallet {
    pub encrypted_data: Vec<u8>,
    pub salt: Vec<u8>,
    pub nonce: Vec<u8>,
    pub argon2_params: Argon2Params,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Argon2Params {
    pub memory_cost: u32,
    pub time_cost: u32,
    pub parallelism: u32,
}

impl Default for Argon2Params {
    fn default() -> Self {
        Self {
            memory_cost: 4096,  // 4 MB
            time_cost: 3,       // 3 iterations
            parallelism: 1,     // 1 thread
        }
    }
}

pub struct WalletEncryption;

impl WalletEncryption {
    pub fn encrypt_wallet(wallet_data: &[u8], password: &str) -> Result<EncryptedWallet, WalletError> {
        // Generate random salt
        let salt = SaltString::generate(&mut OsRng);
        
        // Derive key using Argon2
        let argon2 = Argon2::default();
        let password_hash = argon2.hash_password(password.as_bytes(), &salt)
            .map_err(|e| WalletError::Crypto(format!("Password hashing failed: {}", e)))?;
        
        let key_bytes = password_hash.hash.unwrap().as_bytes();
        let key = Key::from_slice(&key_bytes[..32]);
        
        // Generate random nonce
        let mut nonce_bytes = [0u8; 12];
        OsRng.fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);
        
        // Encrypt data
        let cipher = Aes256Gcm::new(key);
        let encrypted_data = cipher.encrypt(nonce, wallet_data)
            .map_err(|e| WalletError::Crypto(format!("Encryption failed: {}", e)))?;
        
        Ok(EncryptedWallet {
            encrypted_data,
            salt: salt.as_bytes().to_vec(),
            nonce: nonce_bytes.to_vec(),
            argon2_params: Argon2Params::default(),
        })
    }
    
    pub fn decrypt_wallet(encrypted_wallet: &EncryptedWallet, password: &str) -> Result<Vec<u8>, WalletError> {
        // Reconstruct salt
        let salt = SaltString::from_b64(&base64::encode(&encrypted_wallet.salt))
            .map_err(|e| WalletError::Crypto(format!("Invalid salt: {}", e)))?;
        
        // Derive key using same parameters
        let argon2 = Argon2::default();
        let password_hash = argon2.hash_password(password.as_bytes(), &salt)
            .map_err(|e| WalletError::Crypto(format!("Password hashing failed: {}", e)))?;
        
        let key_bytes = password_hash.hash.unwrap().as_bytes();
        let key = Key::from_slice(&key_bytes[..32]);
        
        // Decrypt data
        let nonce = Nonce::from_slice(&encrypted_wallet.nonce);
        let cipher = Aes256Gcm::new(key);
        let decrypted_data = cipher.decrypt(nonce, encrypted_wallet.encrypted_data.as_ref())
            .map_err(|e| WalletError::Crypto(format!("Decryption failed: {}", e)))?;
        
        Ok(decrypted_data)
    }
    
    pub fn verify_password(encrypted_wallet: &EncryptedWallet, password: &str) -> bool {
        Self::decrypt_wallet(encrypted_wallet, password).is_ok()
    }
}
