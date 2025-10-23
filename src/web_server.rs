use warp::Filter;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;
use crate::{wallet::Wallet, error::WalletError};

#[derive(Serialize, Deserialize)]
pub struct CreateWalletRequest {
    pub name: String,
    pub password: String,
}

#[derive(Serialize, Deserialize)]
pub struct ImportWalletRequest {
    pub name: String,
    pub seed_phrase: String,
    pub password: String,
}

#[derive(Serialize, Deserialize)]
pub struct SendTransactionRequest {
    pub wallet_id: String,
    pub to_address: String,
    pub amount: f64,
    pub currency: String,
}

#[derive(Serialize, Deserialize)]
pub struct GenerateAddressRequest {
    pub wallet_id: String,
    pub currency: String,
}

#[derive(Serialize, Deserialize)]
pub struct WalletResponse {
    pub id: String,
    pub name: String,
    pub addresses: Vec<String>,
    pub created_at: String,
}

#[derive(Serialize, Deserialize)]
pub struct BalanceResponse {
    pub address: String,
    pub balance: f64,
    pub currency: String,
    pub usd_value: Option<f64>,
}

#[derive(Serialize, Deserialize)]
pub struct TransactionResponse {
    pub hash: String,
    pub from: String,
    pub to: String,
    pub amount: f64,
    pub currency: String,
    pub status: String,
    pub timestamp: u64,
}

pub struct WebServer {
    wallets: Arc<Mutex<Vec<Wallet>>>,
}

impl WebServer {
    pub fn new() -> Self {
        Self {
            wallets: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub async fn start(self) -> Result<(), WalletError> {
        let wallets = self.wallets.clone();

        // CORS filter
        let cors = warp::cors()
            .allow_any_origin()
            .allow_headers(vec!["content-type"])
            .allow_methods(vec!["GET", "POST", "PUT", "DELETE"]);

        // API routes
        let create_wallet = warp::path("api")
            .and(warp::path("wallets"))
            .and(warp::post())
            .and(warp::body::json())
            .and(with_wallets(wallets.clone()))
            .and_then(create_wallet_handler);

        let import_wallet = warp::path("api")
            .and(warp::path("wallets"))
            .and(warp::path("import"))
            .and(warp::post())
            .and(warp::body::json())
            .and(with_wallets(wallets.clone()))
            .and_then(import_wallet_handler);

        let get_wallets = warp::path("api")
            .and(warp::path("wallets"))
            .and(warp::get())
            .and(with_wallets(wallets.clone()))
            .and_then(get_wallets_handler);

        let get_balances = warp::path("api")
            .and(warp::path("wallets"))
            .and(warp::path::param::<String>())
            .and(warp::path("balances"))
            .and(warp::get())
            .and(with_wallets(wallets.clone()))
            .and_then(get_balances_handler);

        let send_transaction = warp::path("api")
            .and(warp::path("transactions"))
            .and(warp::post())
            .and(warp::body::json())
            .and(with_wallets(wallets.clone()))
            .and_then(send_transaction_handler);

        let generate_address = warp::path("api")
            .and(warp::path("addresses"))
            .and(warp::post())
            .and(warp::body::json())
            .and(with_wallets(wallets.clone()))
            .and_then(generate_address_handler);

        // Static files for the web GUI
        let static_files = warp::path("static")
            .and(warp::fs::dir("web_gui/dist"));

        let index = warp::path::end()
            .and(warp::fs::file("web_gui/dist/index.html"));

        // Combine all routes
        let routes = create_wallet
            .or(import_wallet)
            .or(get_wallets)
            .or(get_balances)
            .or(send_transaction)
            .or(generate_address)
            .or(static_files)
            .or(index)
            .with(cors);

        println!("🚀 Web server starting on http://localhost:8080");
        println!("📱 Open your browser to http://localhost:8080 to access the wallet GUI");

        warp::serve(routes)
            .run(([127, 0, 0, 1], 8080))
            .await;

        Ok(())
    }
}

fn with_wallets(
    wallets: Arc<Mutex<Vec<Wallet>>>,
) -> impl Filter<Extract = (Arc<Mutex<Vec<Wallet>>>,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || wallets.clone())
}

async fn create_wallet_handler(
    request: CreateWalletRequest,
    wallets: Arc<Mutex<Vec<Wallet>>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    match Wallet::create_new(&request.name) {
        Ok(wallet) => {
            let mut wallets_guard = wallets.lock().await;
            wallets_guard.push(wallet.clone());
            
            let response = WalletResponse {
                id: wallet.name.clone(),
                name: wallet.name,
                addresses: wallet.addresses,
                created_at: wallet.created_at.to_rfc3339(),
            };
            
            Ok(warp::reply::json(&response))
        }
        Err(e) => {
            let error_response = serde_json::json!({
                "error": format!("Failed to create wallet: {}", e)
            });
            Ok(warp::reply::json(&error_response))
        }
    }
}

async fn import_wallet_handler(
    request: ImportWalletRequest,
    wallets: Arc<Mutex<Vec<Wallet>>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    match Wallet::from_seed_phrase(&request.seed_phrase, &request.name) {
        Ok(wallet) => {
            let mut wallets_guard = wallets.lock().await;
            wallets_guard.push(wallet.clone());
            
            let response = WalletResponse {
                id: wallet.name.clone(),
                name: wallet.name,
                addresses: wallet.addresses,
                created_at: wallet.created_at.to_rfc3339(),
            };
            
            Ok(warp::reply::json(&response))
        }
        Err(e) => {
            let error_response = serde_json::json!({
                "error": format!("Failed to import wallet: {}", e)
            });
            Ok(warp::reply::json(&error_response))
        }
    }
}

async fn get_wallets_handler(
    wallets: Arc<Mutex<Vec<Wallet>>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let wallets_guard = wallets.lock().await;
    let response: Vec<WalletResponse> = wallets_guard
        .iter()
        .map(|wallet| WalletResponse {
            id: wallet.name.clone(),
            name: wallet.name.clone(),
            addresses: wallet.addresses.clone(),
            created_at: wallet.created_at.to_rfc3339(),
        })
        .collect();
    
    Ok(warp::reply::json(&response))
}

async fn get_balances_handler(
    wallet_id: String,
    wallets: Arc<Mutex<Vec<Wallet>>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let wallets_guard = wallets.lock().await;
    
    if let Some(wallet) = wallets_guard.iter().find(|w| w.name == wallet_id) {
        // Mock balance data - in a real implementation, you'd query the blockchain
        let balances: Vec<BalanceResponse> = wallet.addresses
            .iter()
            .map(|address| BalanceResponse {
                address: address.clone(),
                balance: 0.0, // Mock balance
                currency: "BTC".to_string(),
                usd_value: Some(0.0),
            })
            .collect();
        
        Ok(warp::reply::json(&balances))
    } else {
        let error_response = serde_json::json!({
            "error": "Wallet not found"
        });
        Ok(warp::reply::json(&error_response))
    }
}

async fn send_transaction_handler(
    request: SendTransactionRequest,
    wallets: Arc<Mutex<Vec<Wallet>>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let wallets_guard = wallets.lock().await;
    
    if let Some(wallet) = wallets_guard.iter().find(|w| w.name == request.wallet_id) {
        // Mock transaction - in a real implementation, you'd broadcast to the blockchain
        let tx_hash = format!("tx_{}_{}_{}", wallet.addresses[0], request.to_address, request.amount);
        
        let response = serde_json::json!({
            "tx_hash": tx_hash,
            "status": "pending"
        });
        
        Ok(warp::reply::json(&response))
    } else {
        let error_response = serde_json::json!({
            "error": "Wallet not found"
        });
        Ok(warp::reply::json(&error_response))
    }
}

async fn generate_address_handler(
    request: GenerateAddressRequest,
    wallets: Arc<Mutex<Vec<Wallet>>>,
) -> Result<impl warp::Reply, warp::Rejection> {
    let mut wallets_guard = wallets.lock().await;
    
    if let Some(wallet) = wallets_guard.iter_mut().find(|w| w.name == request.wallet_id) {
        match wallet.add_new_address() {
            Ok(address) => {
                let response = serde_json::json!({
                    "address": address
                });
                Ok(warp::reply::json(&response))
            }
            Err(e) => {
                let error_response = serde_json::json!({
                    "error": format!("Failed to generate address: {}", e)
                });
                Ok(warp::reply::json(&error_response))
            }
        }
    } else {
        let error_response = serde_json::json!({
            "error": "Wallet not found"
        });
        Ok(warp::reply::json(&error_response))
    }
}
