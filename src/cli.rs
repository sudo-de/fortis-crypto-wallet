use clap::Args;

#[derive(Args)]
pub struct CreateWallet {
    /// Name for the new wallet
    #[arg(short, long)]
    pub name: String,
}

#[derive(Args)]
pub struct ImportWallet {
    /// Name for the imported wallet
    #[arg(short, long)]
    pub name: String,
    
    /// Seed phrase to import
    #[arg(short, long)]
    pub seed_phrase: String,
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
