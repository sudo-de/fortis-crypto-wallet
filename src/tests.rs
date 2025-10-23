#[cfg(test)]
mod tests {
    use crate::{wallet::Wallet, crypto::generate_mnemonic};

    #[test]
    fn test_wallet_creation() {
        let wallet = Wallet::create_new("test-wallet").unwrap();
        assert_eq!(wallet.name, "test-wallet");
        assert!(!wallet.seed_phrase.is_empty());
        assert_eq!(wallet.addresses.len(), 1);
    }

    #[test]
    fn test_mnemonic_generation() {
        let mnemonic = generate_mnemonic().unwrap();
        let words: Vec<&str> = mnemonic.split_whitespace().collect();
        assert_eq!(words.len(), 12);
    }

    #[test]
    fn test_wallet_storage() {
        let wallet = Wallet::create_new("storage-test").unwrap();
        wallet.save().unwrap();
        
        let loaded_wallet = Wallet::load("storage-test").unwrap();
        assert_eq!(wallet.name, loaded_wallet.name);
        assert_eq!(wallet.seed_phrase, loaded_wallet.seed_phrase);
    }

    #[test]
    fn test_address_generation() {
        let mut wallet = Wallet::create_new("address-test").unwrap();
        let initial_count = wallet.addresses.len();
        
        let new_address = wallet.add_new_address().unwrap();
        assert!(!new_address.is_empty());
        
        let updated_wallet = Wallet::load("address-test").unwrap();
        assert_eq!(updated_wallet.addresses.len(), initial_count + 1);
    }
}
