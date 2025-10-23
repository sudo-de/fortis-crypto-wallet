use std::path::PathBuf;
use crate::{wallet::Wallet, error::WalletError};

pub struct WalletStorage;

impl WalletStorage {
    pub fn get_wallet_dir() -> Result<PathBuf, WalletError> {
        let home_dir = dirs::home_dir()
            .ok_or_else(|| WalletError::Storage("Could not find home directory".to_string()))?;
        
        let wallet_dir = home_dir.join(".crypto-wallet");
        std::fs::create_dir_all(&wallet_dir)
            .map_err(|e| WalletError::Storage(format!("Failed to create wallet directory: {}", e)))?;
        
        Ok(wallet_dir)
    }
    
    pub fn get_wallet_path(name: &str) -> Result<PathBuf, WalletError> {
        let wallet_dir = Self::get_wallet_dir()?;
        Ok(wallet_dir.join(format!("{}.json", name)))
    }
    
    pub fn save(wallet: &Wallet) -> Result<(), WalletError> {
        let path = Self::get_wallet_path(&wallet.name)?;
        let json = serde_json::to_string_pretty(wallet)
            .map_err(|e| WalletError::Storage(format!("Failed to serialize wallet: {}", e)))?;
        
        std::fs::write(&path, json)
            .map_err(|e| WalletError::Storage(format!("Failed to write wallet file: {}", e)))?;
        
        Ok(())
    }
    
    pub fn load(name: &str) -> Result<Wallet, WalletError> {
        let path = Self::get_wallet_path(name)?;
        
        if !path.exists() {
            return Err(WalletError::WalletNotFound(name.to_string()));
        }
        
        let json = std::fs::read_to_string(&path)
            .map_err(|e| WalletError::Storage(format!("Failed to read wallet file: {}", e)))?;
        
        let wallet: Wallet = serde_json::from_str(&json)
            .map_err(|e| WalletError::Storage(format!("Failed to deserialize wallet: {}", e)))?;
        
        Ok(wallet)
    }
    
    pub fn list_wallets() -> Result<Vec<String>, WalletError> {
        let wallet_dir = Self::get_wallet_dir()?;
        let mut wallets = Vec::new();
        
        for entry in std::fs::read_dir(&wallet_dir)
            .map_err(|e| WalletError::Storage(format!("Failed to read wallet directory: {}", e)))? {
            let entry = entry.map_err(|e| WalletError::Storage(format!("Failed to read directory entry: {}", e)))?;
            let path = entry.path();
            
            if path.extension().and_then(|s| s.to_str()) == Some("json") {
                if let Some(name) = path.file_stem().and_then(|s| s.to_str()) {
                    wallets.push(name.to_string());
                }
            }
        }
        
        Ok(wallets)
    }
    
    pub fn delete(name: &str) -> Result<(), WalletError> {
        let path = Self::get_wallet_path(name)?;
        
        if !path.exists() {
            return Err(WalletError::WalletNotFound(name.to_string()));
        }
        
        std::fs::remove_file(&path)
            .map_err(|e| WalletError::Storage(format!("Failed to delete wallet: {}", e)))?;
        
        Ok(())
    }
}
