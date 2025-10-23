use serde::{Deserialize, Serialize};
use base58::ToBase58;
use crate::{
    crypto::{generate_mnemonic, mnemonic_to_seed, derive_key_from_seed},
    storage::WalletStorage,
    network::NetworkClient,
    error::WalletError,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Wallet {
    pub name: String,
    pub seed_phrase: String,
    pub addresses: Vec<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

impl Wallet {
    pub fn create_new(name: &str) -> Result<Self, WalletError> {
        let seed_phrase = generate_mnemonic()?;
        let mut wallet = Wallet {
            name: name.to_string(),
            seed_phrase: seed_phrase.clone(),
            addresses: Vec::new(),
            created_at: chrono::Utc::now(),
        };
        
        // Generate initial address
        let address = wallet.generate_address(0)?;
        wallet.addresses.push(address);
        
        // Save wallet
        wallet.save()?;
        
        Ok(wallet)
    }
    
    pub fn from_seed_phrase(seed_phrase: &str, name: &str) -> Result<Self, WalletError> {
        // Validate seed phrase
        let _ = mnemonic_to_seed(seed_phrase)?;
        
        let mut wallet = Wallet {
            name: name.to_string(),
            seed_phrase: seed_phrase.to_string(),
            addresses: Vec::new(),
            created_at: chrono::Utc::now(),
        };
        
        // Generate initial address
        let address = wallet.generate_address(0)?;
        wallet.addresses.push(address);
        
        // Save wallet
        wallet.save()?;
        
        Ok(wallet)
    }
    
    pub fn load(name: &str) -> Result<Self, WalletError> {
        WalletStorage::load(name)
    }
    
    pub fn save(&self) -> Result<(), WalletError> {
        WalletStorage::save(self)
    }
    
    pub fn generate_address(&self, index: u32) -> Result<String, WalletError> {
        let seed = mnemonic_to_seed(&self.seed_phrase)?;
        let derivation_path = format!("m/44'/0'/0'/0/{}", index);
        let _key = derive_key_from_seed(&seed, &derivation_path)?;
        
        // For demo purposes, generate a simple address
        // In a real implementation, you'd use the derived key to create a proper public key
        let mut address_bytes = vec![0x00]; // Mainnet prefix
        address_bytes.extend_from_slice(&seed[..20]); // Use part of seed as address
        address_bytes.extend_from_slice(&[0x00, 0x00, 0x00, 0x00]); // Simple checksum
        
        Ok(address_bytes.to_base58())
    }
    
    pub fn get_addresses(&self) -> &Vec<String> {
        &self.addresses
    }
    
    pub fn add_new_address(&mut self) -> Result<String, WalletError> {
        let index = self.addresses.len() as u32;
        let address = self.generate_address(index)?;
        self.addresses.push(address.clone());
        self.save()?;
        Ok(address)
    }
    
    pub fn get_seed_phrase(&self) -> &str {
        &self.seed_phrase
    }
    
    pub async fn get_balance(&self, network: &str) -> Result<f64, WalletError> {
        let client = NetworkClient::new(network)?;
        let mut total_balance = 0.0;
        
        for address in &self.addresses {
            let balance = client.get_balance(address).await?;
            total_balance += balance;
        }
        
        Ok(total_balance)
    }
    
    pub async fn send_transaction(&mut self, to_address: &str, amount: f64, network: &str) -> Result<String, WalletError> {
        // Validate address format
        if !self.is_valid_address(to_address) {
            return Err(WalletError::InvalidAddress(format!("Invalid recipient address: {}", to_address)));
        }
        
        // Check balance
        let balance = self.get_balance(network).await?;
        if balance < amount {
            return Err(WalletError::InsufficientFunds);
        }
        
        // Create transaction
        let client = NetworkClient::new(network)?;
        let tx_hash = client.send_transaction(&self.addresses[0], to_address, amount).await?;
        
        Ok(tx_hash)
    }
    
    fn is_valid_address(&self, address: &str) -> bool {
        // Basic Bitcoin address validation
        if address.len() < 26 || address.len() > 35 {
            return false;
        }
        
        // Check if it's base58 encoded
        match base58::FromBase58::from_base58(address) {
            Ok(_) => true,
            Err(_) => false,
        }
    }
}
