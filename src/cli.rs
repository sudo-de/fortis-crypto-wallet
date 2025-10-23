use clap::Args;

#[derive(Args)]
pub struct CreateWallet {
    /// Name for the new wallet
    #[arg(short, long)]
    pub name: String,
    
    /// Password to encrypt the wallet
    #[arg(short, long)]
    pub password: Option<String>,
}

#[derive(Args)]
pub struct ImportWallet {
    /// Name for the imported wallet
    #[arg(short, long)]
    pub name: String,
    
    /// Seed phrase to import
    #[arg(short, long)]
    pub seed_phrase: String,
    
    /// Password to encrypt the wallet
    #[arg(short, long)]
    pub password: Option<String>,
}

#[derive(Args)]
pub struct SendTransaction {
    /// Name of the wallet to send from
    #[arg(short, long)]
    pub wallet_name: String,
    
    /// Recipient address
    #[arg(short, long)]
    pub to_address: String,
    
    /// Amount to send (in BTC)
    #[arg(short, long)]
    pub amount: f64,
    
    /// Network (mainnet or testnet)
    #[arg(short, long, default_value = "mainnet")]
    pub network: String,
    
    /// Transaction fee rate (slow, medium, fast, or custom sat/byte)
    #[arg(short, long, default_value = "medium")]
    pub fee_rate: String,
    
    /// Memo for the transaction
    #[arg(short, long)]
    pub memo: Option<String>,
}

#[derive(Args)]
pub struct GetBalance {
    /// Name of the wallet
    #[arg(short, long)]
    pub wallet_name: String,
    
    /// Network (mainnet or testnet)
    #[arg(short, long, default_value = "mainnet")]
    pub network: String,
}

#[derive(Args)]
pub struct ListAddresses {
    /// Name of the wallet
    #[arg(short, long)]
    pub wallet_name: String,
}

#[derive(Args)]
pub struct TransactionHistory {
    /// Name of the wallet
    #[arg(short, long)]
    pub wallet_name: String,
    
    /// Number of transactions to show
    #[arg(short, long, default_value = "10")]
    pub limit: usize,
    
    /// Filter by status (pending, confirmed, failed)
    #[arg(short, long)]
    pub status: Option<String>,
}

#[derive(Args)]
pub struct AddToAddressBook {
    /// Name for the address
    #[arg(short, long)]
    pub name: String,
    
    /// Bitcoin address
    #[arg(short, long)]
    pub address: String,
    
    /// Label for the address
    #[arg(short, long)]
    pub label: Option<String>,
    
    /// Notes for the address
    #[arg(short, long)]
    pub notes: Option<String>,
}

#[derive(Args)]
pub struct ListAddressBook {
    /// Search query
    #[arg(short, long)]
    pub search: Option<String>,
    
    /// Show only favorites
    #[arg(short, long)]
    pub favorites: bool,
}

#[derive(Args)]
pub struct EstimateFee {
    /// Number of inputs
    #[arg(short, long, default_value = "1")]
    pub inputs: usize,
    
    /// Number of outputs
    #[arg(short, long, default_value = "2")]
    pub outputs: usize,
    
    /// Priority level (low, normal, high, urgent)
    #[arg(short, long, default_value = "normal")]
    pub priority: String,
}

#[derive(Args)]
pub struct EncryptWallet {
    /// Name of the wallet to encrypt
    #[arg(short, long)]
    pub wallet_name: String,
    
    /// Password for encryption
    #[arg(short, long)]
    pub password: String,
}

#[derive(Args)]
pub struct DecryptWallet {
    /// Name of the wallet to decrypt
    #[arg(short, long)]
    pub wallet_name: String,
    
    /// Password for decryption
    #[arg(short, long)]
    pub password: String,
}
