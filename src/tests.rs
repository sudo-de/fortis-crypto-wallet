#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;
    use std::path::Path;

    #[test]
    fn test_wallet_creation() {
        let temp_dir = TempDir::new().unwrap();
        let wallet_name = "test_wallet";
        
        // This would need to be adapted based on your actual Wallet implementation
        // let wallet = Wallet::create_new(wallet_name).unwrap();
        // assert_eq!(wallet.name, wallet_name);
        // assert!(!wallet.addresses.is_empty());
    }

    #[test]
    fn test_address_book_operations() {
        let mut address_book = AddressBook::new();
        
        // Add an address
        address_book.add_address(
            "test".to_string(),
            "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa".to_string(),
            Some("Test Address".to_string()),
            Some("Test notes".to_string()),
        ).unwrap();
        
        // Retrieve the address
        let entry = address_book.get_address("test").unwrap();
        assert_eq!(entry.name, "test");
        assert_eq!(entry.address, "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa");
        assert_eq!(entry.label, Some("Test Address".to_string()));
        assert_eq!(entry.notes, Some("Test notes".to_string()));
        
        // Mark as used
        address_book.mark_as_used("test").unwrap();
        let entry = address_book.get_address("test").unwrap();
        assert_eq!(entry.use_count, 1);
        assert!(entry.last_used.is_some());
    }

    #[test]
    fn test_transaction_history() {
        let mut history = TransactionHistory::new();
        
        // Add a transaction
        let tx = Transaction::new(
            "tx_hash_123".to_string(),
            "from_address".to_string(),
            "to_address".to_string(),
            0.001,
            0.00001,
            Some("Test transaction".to_string()),
        );
        
        history.add_transaction(tx);
        
        assert_eq!(history.transactions.len(), 1);
        assert_eq!(history.total_received, 0.001);
        assert_eq!(history.total_fees, 0.00001);
    }

    #[test]
    fn test_fee_estimation() {
        let estimator = FeeEstimator::new();
        
        // Test transaction size estimation
        let size = estimator.estimate_transaction_size(1, 2, false);
        assert!(size > 0);
        
        // Test with witness
        let size_with_witness = estimator.estimate_transaction_size(1, 2, true);
        assert!(size_with_witness > size);
    }

    #[test]
    fn test_encryption() {
        let test_data = b"Hello, World!";
        let password = "test_password";
        
        // Encrypt data
        let encrypted = WalletEncryption::encrypt_wallet(test_data, password).unwrap();
        assert!(!encrypted.encrypted_data.is_empty());
        assert!(!encrypted.salt.is_empty());
        assert!(!encrypted.nonce.is_empty());
        
        // Decrypt data
        let decrypted = WalletEncryption::decrypt_wallet(&encrypted, password).unwrap();
        assert_eq!(decrypted, test_data);
        
        // Test wrong password
        let wrong_decrypt = WalletEncryption::decrypt_wallet(&encrypted, "wrong_password");
        assert!(wrong_decrypt.is_err());
    }

    #[test]
    fn test_address_validation() {
        let address_book = AddressBook::new();
        
        // Valid Bitcoin address
        assert!(address_book.is_valid_address("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"));
        
        // Invalid addresses
        assert!(!address_book.is_valid_address("invalid"));
        assert!(!address_book.is_valid_address(""));
        assert!(!address_book.is_valid_address("1"));
    }

    #[test]
    fn test_transaction_status() {
        let mut tx = Transaction::new(
            "tx_hash".to_string(),
            "from".to_string(),
            "to".to_string(),
            0.001,
            0.00001,
            None,
        );
        
        assert!(tx.is_pending());
        assert!(!tx.is_confirmed());
        
        tx.mark_confirmed(12345, 6);
        assert!(tx.is_confirmed());
        assert!(!tx.is_pending());
        assert_eq!(tx.block_height, Some(12345));
        assert_eq!(tx.confirmations, 6);
        
        tx.mark_failed();
        assert!(!tx.is_confirmed());
        assert!(!tx.is_pending());
    }

    #[test]
    fn test_fee_estimate_staleness() {
        let estimate = FeeEstimate {
            slow: 1,
            medium: 5,
            fast: 10,
            timestamp: chrono::Utc::now() - chrono::Duration::minutes(30),
        };
        
        assert!(!estimate.is_stale(60)); // Should not be stale within 60 minutes
        assert!(estimate.is_stale(10));  // Should be stale within 10 minutes
    }

    #[test]
    fn test_address_book_search() {
        let mut address_book = AddressBook::new();
        
        // Add multiple addresses
        address_book.add_address(
            "alice".to_string(),
            "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa".to_string(),
            Some("Alice's Address".to_string()),
            None,
        ).unwrap();
        
        address_book.add_address(
            "bob".to_string(),
            "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2".to_string(),
            Some("Bob's Address".to_string()),
            None,
        ).unwrap();
        
        // Search by name
        let results = address_book.search_addresses("alice");
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].name, "alice");
        
        // Search by label
        let results = address_book.search_addresses("Bob");
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].name, "bob");
    }

    #[test]
    fn test_transaction_history_export() {
        let mut history = TransactionHistory::new();
        
        let tx = Transaction::new(
            "tx_123".to_string(),
            "from_addr".to_string(),
            "to_addr".to_string(),
            0.001,
            0.00001,
            Some("Test memo".to_string()),
        );
        
        history.add_transaction(tx);
        
        let csv = history.export_to_csv().unwrap();
        assert!(csv.contains("tx_123"));
        assert!(csv.contains("from_addr"));
        assert!(csv.contains("to_addr"));
        assert!(csv.contains("Test memo"));
    }

    #[test]
    fn test_address_book_export() {
        let mut address_book = AddressBook::new();
        
        address_book.add_address(
            "test".to_string(),
            "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa".to_string(),
            Some("Test Label".to_string()),
            Some("Test Notes".to_string()),
        ).unwrap();
        
        let csv = address_book.export_to_csv();
        assert!(csv.contains("test"));
        assert!(csv.contains("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"));
        assert!(csv.contains("Test Label"));
        assert!(csv.contains("Test Notes"));
    }
}
