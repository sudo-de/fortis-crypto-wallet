use clap::{Parser, Subcommand};
use crypto_wallet::{
    wallet::Wallet,
    cli::{CreateWallet, ImportWallet, SendTransaction, GetBalance, ListAddresses},
    error::WalletError,
    web_server::WebServer,
};

#[derive(Parser)]
#[command(name = "crypto-wallet")]
#[command(about = "A secure cryptocurrency wallet application")]
#[command(version)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Create a new wallet
    Create(CreateWallet),
    /// Import an existing wallet from seed phrase
    Import(ImportWallet),
    /// Send cryptocurrency
    Send(SendTransaction),
    /// Get wallet balance
    Balance(GetBalance),
    /// List all addresses
    Addresses(ListAddresses),
    /// Start web server with GUI
    Server,
}

#[tokio::main]
async fn main() -> Result<(), WalletError> {
    env_logger::init();
    
    let cli = Cli::parse();
    
    match cli.command {
        Commands::Create(args) => {
            let wallet = Wallet::create_new(&args.name)?;
            println!("✅ Wallet '{}' created successfully!", args.name);
            println!("📝 Seed phrase: {}", wallet.get_seed_phrase());
            println!("⚠️  IMPORTANT: Store your seed phrase in a safe place!");
        }
        Commands::Import(args) => {
            let _wallet = Wallet::from_seed_phrase(&args.seed_phrase, &args.name)?;
            println!("✅ Wallet '{}' imported successfully!", args.name);
        }
        Commands::Send(args) => {
            let mut wallet = Wallet::load(&args.wallet_name)?;
            let tx_hash = wallet.send_transaction(&args.to_address, args.amount, &args.network).await?;
            println!("✅ Transaction sent successfully!");
            println!("🔗 Transaction hash: {}", tx_hash);
        }
        Commands::Balance(args) => {
            let wallet = Wallet::load(&args.wallet_name)?;
            let balance = wallet.get_balance(&args.network).await?;
            println!("💰 Balance: {} BTC", balance);
        }
        Commands::Addresses(args) => {
            let wallet = Wallet::load(&args.wallet_name)?;
            let addresses = wallet.get_addresses();
            println!("📍 Wallet addresses:");
            for (i, addr) in addresses.iter().enumerate() {
                println!("  {}: {}", i + 1, addr);
            }
        }
        Commands::Server => {
            println!("🌐 Starting web server...");
            let web_server = WebServer::new();
            web_server.start().await?;
        }
    }
    
    Ok(())
}
