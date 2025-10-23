use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use crate::error::WalletError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: String,
    pub hash: String,
    pub from_address: String,
    pub to_address: String,
    pub amount: f64,
    pub fee: f64,
    pub status: TransactionStatus,
    pub timestamp: DateTime<Utc>,
    pub block_height: Option<u64>,
    pub confirmations: u32,
    pub memo: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TransactionStatus {
    Pending,
    Confirmed,
    Failed,
    Cancelled,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionHistory {
    pub transactions: Vec<Transaction>,
    pub total_sent: f64,
    pub total_received: f64,
    pub total_fees: f64,
}

impl TransactionHistory {
    pub fn new() -> Self {
        Self {
            transactions: Vec::new(),
            total_sent: 0.0,
            total_received: 0.0,
            total_fees: 0.0,
        }
    }
    
    pub fn add_transaction(&mut self, transaction: Transaction) {
        // Update totals
        if transaction.amount > 0.0 {
            self.total_received += transaction.amount;
        } else {
            self.total_sent += transaction.amount.abs();
        }
        self.total_fees += transaction.fee;
        
        self.transactions.push(transaction);
        self.transactions.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
    }
    
    pub fn get_transactions_by_status(&self, status: TransactionStatus) -> Vec<&Transaction> {
        self.transactions.iter()
            .filter(|tx| std::mem::discriminant(&tx.status) == std::mem::discriminant(&status))
            .collect()
    }
    
    pub fn get_pending_transactions(&self) -> Vec<&Transaction> {
        self.get_transactions_by_status(TransactionStatus::Pending)
    }
    
    pub fn get_recent_transactions(&self, limit: usize) -> Vec<&Transaction> {
        self.transactions.iter().take(limit).collect()
    }
    
    pub fn get_transactions_by_address(&self, address: &str) -> Vec<&Transaction> {
        self.transactions.iter()
            .filter(|tx| tx.from_address == address || tx.to_address == address)
            .collect()
    }
    
    pub fn get_balance_at_time(&self, timestamp: DateTime<Utc>) -> f64 {
        let mut balance = 0.0;
        
        for tx in &self.transactions {
            if tx.timestamp <= timestamp {
                if tx.amount > 0.0 {
                    balance += tx.amount;
                } else {
                    balance += tx.amount; // amount is negative for sent transactions
                }
            }
        }
        
        balance
    }
    
    pub fn export_to_csv(&self) -> Result<String, WalletError> {
        let mut csv = String::from("ID,Hash,From,To,Amount,Fee,Status,Timestamp,Block Height,Confirmations,Memo\n");
        
        for tx in &self.transactions {
            csv.push_str(&format!(
                "{},{},{},{},{},{},{:?},{},{},{},{}\n",
                tx.id,
                tx.hash,
                tx.from_address,
                tx.to_address,
                tx.amount,
                tx.fee,
                tx.status,
                tx.timestamp.format("%Y-%m-%d %H:%M:%S UTC"),
                tx.block_height.unwrap_or(0),
                tx.confirmations,
                tx.memo.as_deref().unwrap_or("")
            ));
        }
        
        Ok(csv)
    }
}

impl Transaction {
    pub fn new(
        hash: String,
        from_address: String,
        to_address: String,
        amount: f64,
        fee: f64,
        memo: Option<String>,
    ) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            hash,
            from_address,
            to_address,
            amount,
            fee,
            status: TransactionStatus::Pending,
            timestamp: Utc::now(),
            block_height: None,
            confirmations: 0,
            memo,
        }
    }
    
    pub fn mark_confirmed(&mut self, block_height: u64, confirmations: u32) {
        self.status = TransactionStatus::Confirmed;
        self.block_height = Some(block_height);
        self.confirmations = confirmations;
    }
    
    pub fn mark_failed(&mut self) {
        self.status = TransactionStatus::Failed;
    }
    
    pub fn is_confirmed(&self) -> bool {
        matches!(self.status, TransactionStatus::Confirmed)
    }
    
    pub fn is_pending(&self) -> bool {
        matches!(self.status, TransactionStatus::Pending)
    }
}
