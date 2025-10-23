use serde::{Deserialize, Serialize};
use reqwest::Client;
use crate::error::WalletError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeeEstimate {
    pub slow: u64,      // satoshis per byte
    pub medium: u64,    // satoshis per byte
    pub fast: u64,      // satoshis per byte
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionFee {
    pub fee_rate: u64,   // satoshis per byte
    pub total_fee: u64, // total fee in satoshis
    pub estimated_time: String,
}

pub struct FeeEstimator {
    client: Client,
}

impl FeeEstimator {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
        }
    }
    
    pub async fn get_fee_estimates(&self) -> Result<FeeEstimate, WalletError> {
        // Try multiple fee estimation services for reliability
        let services = vec![
            "https://mempool.space/api/v1/fees/recommended",
            "https://blockstream.info/api/fee-estimates",
        ];
        
        for service in services {
            if let Ok(estimate) = self.fetch_from_service(service).await {
                return Ok(estimate);
            }
        }
        
        // Fallback to default fees if all services fail
        Ok(FeeEstimate {
            slow: 1,
            medium: 5,
            fast: 10,
            timestamp: chrono::Utc::now(),
        })
    }
    
    async fn fetch_from_service(&self, url: &str) -> Result<FeeEstimate, WalletError> {
        let response = self.client.get(url).send().await?;
        
        if !response.status().is_success() {
            return Err(WalletError::Network(format!("HTTP error: {}", response.status())));
        }
        
        let json: serde_json::Value = response.json().await?;
        
        // Parse different response formats
        if url.contains("mempool.space") {
            self.parse_mempool_response(json)
        } else if url.contains("blockstream") {
            self.parse_blockstream_response(json)
        } else {
            Err(WalletError::Network("Unknown service format".to_string()))
        }
    }
    
    fn parse_mempool_response(&self, json: serde_json::Value) -> Result<FeeEstimate, WalletError> {
        let slow = json["economyFee"].as_u64().unwrap_or(1);
        let medium = json["hourFee"].as_u64().unwrap_or(5);
        let fast = json["fastestFee"].as_u64().unwrap_or(10);
        
        Ok(FeeEstimate {
            slow,
            medium,
            fast,
            timestamp: chrono::Utc::now(),
        })
    }
    
    fn parse_blockstream_response(&self, json: serde_json::Value) -> Result<FeeEstimate, WalletError> {
        // Blockstream returns a map of block targets to fee rates
        let slow = json["144"].as_u64().unwrap_or(1);
        let medium = json["6"].as_u64().unwrap_or(5);
        let fast = json["1"].as_u64().unwrap_or(10);
        
        Ok(FeeEstimate {
            slow,
            medium,
            fast,
            timestamp: chrono::Utc::now(),
        })
    }
    
    pub fn calculate_transaction_fee(
        &self,
        estimate: &FeeEstimate,
        fee_rate: FeeRate,
        transaction_size: usize,
    ) -> TransactionFee {
        let rate = match fee_rate {
            FeeRate::Slow => estimate.slow,
            FeeRate::Medium => estimate.medium,
            FeeRate::Fast => estimate.fast,
            FeeRate::Custom(rate) => rate,
        };
        
        let total_fee = rate * transaction_size as u64;
        let estimated_time = match fee_rate {
            FeeRate::Slow => "1-24 hours".to_string(),
            FeeRate::Medium => "10-60 minutes".to_string(),
            FeeRate::Fast => "1-10 minutes".to_string(),
            FeeRate::Custom(_) => "Unknown".to_string(),
        };
        
        TransactionFee {
            fee_rate: rate,
            total_fee,
            estimated_time,
        }
    }
    
    pub fn get_optimal_fee_rate(&self, estimate: &FeeEstimate, priority: Priority) -> FeeRate {
        match priority {
            Priority::Low => FeeRate::Slow,
            Priority::Normal => FeeRate::Medium,
            Priority::High => FeeRate::Fast,
            Priority::Urgent => FeeRate::Custom(estimate.fast * 2), // Double the fast rate
        }
    }
    
    pub fn estimate_transaction_size(
        &self,
        input_count: usize,
        output_count: usize,
        has_witness: bool,
    ) -> usize {
        // Base transaction size
        let mut size = 4; // version
        size += 1; // input count
        size += 1; // output count
        size += 4; // locktime
        
        // Input sizes
        for _ in 0..input_count {
            size += 32; // previous tx hash
            size += 4;  // previous tx index
            size += 1;  // script length
            size += 32; // script (simplified)
            size += 4;  // sequence
        }
        
        // Output sizes
        for _ in 0..output_count {
            size += 8;  // value
            size += 1;  // script length
            size += 25; // script (P2PKH)
        }
        
        // Witness data (if present)
        if has_witness {
            size += 2; // witness marker and flag
            for _ in 0..input_count {
                size += 1; // witness stack items
                size += 72; // witness data (signature + pubkey)
            }
        }
        
        size
    }
}

#[derive(Debug, Clone)]
pub enum FeeRate {
    Slow,
    Medium,
    Fast,
    Custom(u64),
}

#[derive(Debug, Clone)]
pub enum Priority {
    Low,
    Normal,
    High,
    Urgent,
}

impl FeeEstimate {
    pub fn is_stale(&self, max_age_minutes: i64) -> bool {
        let now = chrono::Utc::now();
        let age = now.signed_duration_since(self.timestamp);
        age.num_minutes() > max_age_minutes
    }
    
    pub fn get_recommended_rate(&self, urgency: Urgency) -> u64 {
        match urgency {
            Urgency::Low => self.slow,
            Urgency::Medium => self.medium,
            Urgency::High => self.fast,
            Urgency::Urgent => self.fast * 2,
        }
    }
}

#[derive(Debug, Clone)]
pub enum Urgency {
    Low,
    Medium,
    High,
    Urgent,
}
