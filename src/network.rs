use reqwest::Client;
use serde::{Deserialize, Serialize};
use crate::error::WalletError;

#[derive(Debug, Serialize, Deserialize)]
pub struct Transaction {
    pub hash: String,
    pub from: String,
    pub to: String,
    pub amount: f64,
    pub timestamp: u64,
}

pub struct NetworkClient {
    client: Client,
    base_url: String,
}

impl NetworkClient {
    pub fn new(network: &str) -> Result<Self, WalletError> {
        let base_url = match network {
            "mainnet" => "https://blockstream.info/api",
            "testnet" => "https://blockstream.info/testnet/api",
            _ => return Err(WalletError::Network(format!("Unsupported network: {}", network))),
        };
        
        Ok(NetworkClient {
            client: Client::new(),
            base_url: base_url.to_string(),
        })
    }
    
    pub async fn get_balance(&self, address: &str) -> Result<f64, WalletError> {
        let url = format!("{}/address/{}/utxo", self.base_url, address);
        let response = self.client.get(&url).send().await?;
        
        if !response.status().is_success() {
            return Err(WalletError::Network(format!("Failed to get balance: {}", response.status())));
        }
        
        let utxos: Vec<serde_json::Value> = response.json().await?;
        let mut balance = 0.0;
        
        for utxo in utxos {
            if let Some(value) = utxo.get("value").and_then(|v| v.as_f64()) {
                balance += value / 100_000_000.0; // Convert satoshis to BTC
            }
        }
        
        Ok(balance)
    }
    
    pub async fn send_transaction(&self, from_address: &str, to_address: &str, amount: f64) -> Result<String, WalletError> {
        // This is a simplified implementation
        // In a real wallet, you would:
        // 1. Get UTXOs for the from_address
        // 2. Create a proper Bitcoin transaction
        // 3. Sign the transaction with the private key
        // 4. Broadcast the transaction to the network
        
        // For now, we'll simulate a transaction
        let tx_hash = format!("tx_{}_{}_{}", from_address, to_address, amount);
        
        // In a real implementation, you would broadcast to the network
        // For demo purposes, we'll just return a mock hash
        Ok(tx_hash)
    }
    
    pub async fn get_transaction_history(&self, address: &str) -> Result<Vec<Transaction>, WalletError> {
        let url = format!("{}/address/{}/txs", self.base_url, address);
        let response = self.client.get(&url).send().await?;
        
        if !response.status().is_success() {
            return Err(WalletError::Network(format!("Failed to get transaction history: {}", response.status())));
        }
        
        let txs: Vec<serde_json::Value> = response.json().await?;
        let mut transactions = Vec::new();
        
        for tx in txs {
            if let (Some(hash), Some(time)) = (
                tx.get("txid").and_then(|v| v.as_str()),
                tx.get("status").and_then(|s| s.get("block_time")).and_then(|t| t.as_u64())
            ) {
                // This is simplified - in reality you'd parse the transaction properly
                transactions.push(Transaction {
                    hash: hash.to_string(),
                    from: "unknown".to_string(),
                    to: "unknown".to_string(),
                    amount: 0.0,
                    timestamp: time,
                });
            }
        }
        
        Ok(transactions)
    }
}
