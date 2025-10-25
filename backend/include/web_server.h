#pragma once

#include <string>
#include <memory>
#include <thread>
#include <atomic>
#include "trading.h"

namespace crypto_wallet {

class WebServer {
public:
    WebServer();
    ~WebServer();
    
    // Start the web server
    void start();
    
    // Stop the web server
    void stop();
    
    // Check if server is running
    bool is_running() const { return running_; }
    
    // Get server port
    int get_port() const { return port_; }
    
    // Set server port
    void set_port(int port) { port_ = port; }
    
private:
    int port_;
    std::atomic<bool> running_;
    std::unique_ptr<std::thread> server_thread_;
    std::unique_ptr<TradingEngine> trading_engine_;
    
    // Server implementation
    void run_server();
    
    // HTTP handlers
    std::string handle_get_balance(const std::string& wallet_name, const std::string& network);
    std::string handle_send_transaction(const std::string& wallet_name, const std::string& to_address, double amount);
    std::string handle_get_addresses(const std::string& wallet_name);
    std::string handle_get_transaction_history(const std::string& wallet_name);
    
    // Trading handlers
    std::string handle_place_order(const std::string& request_body);
    std::string handle_cancel_order(const std::string& order_id);
    std::string handle_get_orders(const std::string& wallet_name);
    std::string handle_get_order_book(const std::string& pair);
    std::string handle_get_trading_pairs();
    std::string handle_get_market_data(const std::string& symbol);
    
    // Database handlers
    std::string handle_get_wallets();
    std::string handle_get_wallet(const std::string& wallet_id);
    std::string handle_create_wallet(const std::string& request_body);
    std::string handle_update_wallet_balance(const std::string& wallet_id, const std::string& request_body);
    std::string handle_get_transactions(const std::string& wallet_id);
    std::string handle_create_transaction(const std::string& request_body);
    std::string handle_get_portfolio_balances(const std::string& wallet_id);
    std::string handle_get_database_stats();
    
    // Authentication handlers
    std::string handle_auth_login(const std::string& request_body);
    std::string handle_auth_register(const std::string& request_body);
    std::string handle_auth_forgot_password(const std::string& request_body);
    std::string handle_auth_reset_password(const std::string& request_body);
    std::string handle_auth_change_password(const std::string& request_body);
    std::string handle_auth_verify_email(const std::string& token);
    
    // Admin System handlers
    std::string handle_admin_get_users();
    std::string handle_admin_create_user(const std::string& request_body);
    std::string handle_admin_update_user(const std::string& user_id, const std::string& request_body);
    std::string handle_admin_delete_user(const std::string& user_id);
    std::string handle_admin_get_settings();
    std::string handle_admin_update_settings(const std::string& request_body);
    std::string handle_admin_get_compliance();
    std::string handle_admin_create_compliance_rule(const std::string& request_body);
    std::string handle_admin_get_incidents();
    std::string handle_admin_create_incident(const std::string& request_body);
    std::string handle_admin_resolve_incident(const std::string& incident_id, const std::string& request_body);
    std::string handle_admin_get_audit_logs();
    std::string handle_admin_get_system_status();
    std::string handle_admin_toggle_maintenance(const std::string& request_body);
    
    // Utility methods
    std::string create_json_response(const std::string& data);
    std::string create_error_response(const std::string& error);
    std::string parse_json_request(const std::string& request_body);
    std::string extract_request_body(const std::string& request);
    void handle_client(int client_socket);
};

} // namespace crypto_wallet
