use thiserror::Error;

#[derive(Error, Debug)]
pub enum WalletError {
    #[error("Cryptographic error: {0}")]
    Crypto(String),
    
    #[error("Network error: {0}")]
    Network(String),
    
    #[error("Storage error: {0}")]
    Storage(String),
    
    #[error("Invalid seed phrase")]
    InvalidSeedPhrase,
    
    #[error("Insufficient funds")]
    InsufficientFunds,
    
    #[error("Invalid address: {0}")]
    InvalidAddress(String),
    
    #[error("Wallet not found: {0}")]
    WalletNotFound(String),
    
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    
    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),
}
