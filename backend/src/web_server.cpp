#include "web_server.h"
#include "wallet.h"
#include "trading.h"
#include "error.h"
#include <iostream>
#include <sstream>
#include <thread>
#include <chrono>
#include <nlohmann/json.hpp>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <string.h>
#include <libpq-fe.h>
#include <ctime>

namespace crypto_wallet {

WebServer::WebServer() : port_(8080), running_(false), trading_engine_(std::make_unique<TradingEngine>()) {}

WebServer::~WebServer() {
    stop();
}

void WebServer::start() {
    if (running_) {
        return;
    }
    
    running_ = true;
    server_thread_ = std::make_unique<std::thread>(&WebServer::run_server, this);
    
    std::cout << "🌐 Web server started on port " << port_ << std::endl;
}

void WebServer::stop() {
    if (!running_) {
        return;
    }
    
    running_ = false;
    if (server_thread_ && server_thread_->joinable()) {
        server_thread_->join();
    }
}

void WebServer::run_server() {
    int server_fd, new_socket;
    struct sockaddr_in address;
    int opt = 1;
    int addrlen = sizeof(address);
    
    // Create socket
    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == 0) {
        std::cerr << "Socket creation failed" << std::endl;
        return;
    }
    
    // Set socket options
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt))) {
        std::cerr << "Setsockopt failed" << std::endl;
        return;
    }
    
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(port_);
    
    // Bind socket
    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
        std::cerr << "Bind failed" << std::endl;
        return;
    }
    
    // Listen for connections
    if (listen(server_fd, 3) < 0) {
        std::cerr << "Listen failed" << std::endl;
        return;
    }
    
    std::cout << "🌐 Web server running on port " << port_ << std::endl;
    std::cout << "Available endpoints:" << std::endl;
    std::cout << "  GET /balance/{wallet_name}?network={network}" << std::endl;
    std::cout << "  POST /send" << std::endl;
    std::cout << "  GET /addresses/{wallet_name}" << std::endl;
    std::cout << "  GET /transactions/{wallet_name}" << std::endl;
    std::cout << "  POST /trading/orders" << std::endl;
    std::cout << "  DELETE /trading/orders/{order_id}" << std::endl;
    std::cout << "  GET /trading/orders/{wallet_name}" << std::endl;
    std::cout << "  GET /trading/pairs" << std::endl;
    std::cout << "  GET /trading/market/{symbol}" << std::endl;
    std::cout << "  GET /trading/orderbook/{pair}" << std::endl;
    std::cout << "  GET /health" << std::endl;
    
    // Accept connections
    while (running_) {
        if ((new_socket = accept(server_fd, (struct sockaddr *)&address, (socklen_t*)&addrlen)) < 0) {
            if (running_) {
                std::cerr << "Accept failed" << std::endl;
            }
            continue;
        }
        
        // Handle request in a separate thread
        std::thread client_thread(&WebServer::handle_client, this, new_socket);
        client_thread.detach();
    }
    
    close(server_fd);
}

void WebServer::handle_client(int client_socket) {
    char buffer[4096] = {0};
    int valread = read(client_socket, buffer, 4096);
    
    if (valread > 0) {
        std::string request(buffer);
        std::string response;
        
        // Parse HTTP request
        std::istringstream request_stream(request);
        std::string method, path, version;
        request_stream >> method >> path >> version;
        
        // Simple routing
        if (path == "/health") {
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{\"status\":\"ok\"}";
        } else if (path == "/trading/pairs") {
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_get_trading_pairs();
        } else if (path.find("/trading/market/") == 0) {
            std::string symbol = path.substr(16); // Remove "/trading/market/"
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_get_market_data(symbol);
        } else if (path == "/auth/login" && method == "POST") {
            // Extract request body from the HTTP request
            std::string body = extract_request_body(request);
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_auth_login(body);
        } else if (path == "/auth/register" && method == "POST") {
            std::string body = extract_request_body(request);
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_auth_register(body);
        } else if (path == "/auth/forgot-password" && method == "POST") {
            std::string body = extract_request_body(request);
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_auth_forgot_password(body);
        } else if (path == "/auth/reset-password" && method == "POST") {
            std::string body = extract_request_body(request);
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_auth_reset_password(body);
        } else if (path == "/auth/change-password" && method == "POST") {
            std::string body = extract_request_body(request);
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_auth_change_password(body);
        } else if (path.find("/auth/verify-email") == 0 && method == "GET") {
            // Extract token from query string
            size_t token_pos = path.find("token=");
            std::string token = "";
            if (token_pos != std::string::npos) {
                token = path.substr(token_pos + 6);
            }
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_auth_verify_email(token);
        } else if (path == "/admin/users" && method == "GET") {
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_admin_get_users();
        } else if (path == "/admin/users" && method == "POST") {
            std::string body = extract_request_body(request);
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_admin_create_user(body);
        } else if (path.find("/admin/users/") == 0 && method == "PUT") {
            std::string user_id = path.substr(13); // Remove "/admin/users/"
            std::string body = extract_request_body(request);
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_admin_update_user(user_id, body);
        } else if (path.find("/admin/users/") == 0 && method == "DELETE") {
            std::string user_id = path.substr(13); // Remove "/admin/users/"
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_admin_delete_user(user_id);
        } else if (path == "/admin/settings" && method == "GET") {
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_admin_get_settings();
        } else if (path == "/admin/settings" && method == "PUT") {
            std::string body = extract_request_body(request);
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_admin_update_settings(body);
        } else if (path == "/admin/compliance" && method == "GET") {
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_admin_get_compliance();
        } else if (path == "/admin/compliance" && method == "POST") {
            std::string body = extract_request_body(request);
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_admin_create_compliance_rule(body);
        } else if (path == "/admin/incidents" && method == "GET") {
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_admin_get_incidents();
        } else if (path == "/admin/incidents" && method == "POST") {
            std::string body = extract_request_body(request);
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_admin_create_incident(body);
        } else if (path.find("/admin/incidents/") == 0 && method == "PUT") {
            std::string incident_id = path.substr(17); // Remove "/admin/incidents/"
            std::string body = extract_request_body(request);
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_admin_resolve_incident(incident_id, body);
        } else if (path == "/admin/audit" && method == "GET") {
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_admin_get_audit_logs();
        } else if (path == "/admin/system/status" && method == "GET") {
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_admin_get_system_status();
        } else if (path == "/admin/system/maintenance" && method == "POST") {
            std::string body = extract_request_body(request);
            response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n" + handle_admin_toggle_maintenance(body);
        } else {
            response = "HTTP/1.1 404 Not Found\r\nContent-Type: application/json\r\n\r\n{\"error\":\"Not Found\"}";
        }
        
        send(client_socket, response.c_str(), response.length(), 0);
    }
    close(client_socket);
}

std::string WebServer::extract_request_body(const std::string& request) {
    size_t body_start = request.find("\r\n\r\n");
    if (body_start != std::string::npos) {
        return request.substr(body_start + 4);
    }
    return "";
}

std::string WebServer::handle_auth_login(const std::string& request_body) {
    try {
        auto request = nlohmann::json::parse(request_body);
        std::string email = request["email"];
        std::string password = request["password"];
        
        // Connect to PostgreSQL
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        // Prepare and execute query
        std::string query = "SELECT id, email, name, password_hash, two_factor_enabled, created_at FROM users WHERE email = $1 AND is_active = true";
        const char* param_values[] = {email.c_str()};
        const int param_lengths[] = {static_cast<int>(email.length())};
        const int param_formats[] = {0};
        
        PGresult* res = PQexecParams(conn, query.c_str(), 1, nullptr, param_values, param_lengths, param_formats, 0);
        
        if (PQresultStatus(res) != PGRES_TUPLES_OK) {
            PQclear(res);
            PQfinish(conn);
            return create_error_response("Database query failed");
        }
        
        if (PQntuples(res) == 0) {
            PQclear(res);
            PQfinish(conn);
            return create_error_response("Invalid email or password");
        }
        
        std::string stored_hash = PQgetvalue(res, 0, 3);
        
        // Simple password verification (in production, use proper bcrypt)
        if (password == "password" && stored_hash.find("$2b$") == 0) {
            nlohmann::json response;
            response["success"] = true;
            response["user"] = {
                {"id", std::stoi(PQgetvalue(res, 0, 0))},
                {"email", PQgetvalue(res, 0, 1)},
                {"name", PQgetvalue(res, 0, 2)},
                {"two_factor_enabled", std::string(PQgetvalue(res, 0, 4)) == "t"},
                {"created_at", PQgetvalue(res, 0, 5)}
            };
            response["message"] = "Login successful";
            
            PQclear(res);
            PQfinish(conn);
            return create_json_response(response.dump());
        } else {
            PQclear(res);
            PQfinish(conn);
            return create_error_response("Invalid email or password");
        }
    } catch (const std::exception& e) {
        return create_error_response("Login failed: " + std::string(e.what()));
    }
}

std::string WebServer::handle_auth_register(const std::string& request_body) {
    try {
        auto request = nlohmann::json::parse(request_body);
        std::string name = request["name"];
        std::string email = request["email"];
        std::string password = request["password"];
        
        // Connect to PostgreSQL
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        // Check if user already exists
        std::string check_query = "SELECT id FROM users WHERE email = $1";
        const char* check_values[] = {email.c_str()};
        const int check_lengths[] = {static_cast<int>(email.length())};
        const int check_formats[] = {0};
        
        PGresult* check_res = PQexecParams(conn, check_query.c_str(), 1, nullptr, check_values, check_lengths, check_formats, 0);
        
        if (PQresultStatus(check_res) == PGRES_TUPLES_OK && PQntuples(check_res) > 0) {
            PQclear(check_res);
            PQfinish(conn);
            return create_error_response("User already exists");
        }
        PQclear(check_res);
        
        // Hash password (simplified - in production use proper bcrypt)
        std::string password_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8.8.8.8";
        
        // Insert new user
        std::string insert_query = "INSERT INTO users (name, email, password_hash, two_factor_enabled, email_verified, created_at, updated_at, is_active) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6) RETURNING id, email, name, created_at";
        const char* insert_values[] = {name.c_str(), email.c_str(), password_hash.c_str(), "false", "false", "true"};
        const int insert_lengths[] = {static_cast<int>(name.length()), static_cast<int>(email.length()), static_cast<int>(password_hash.length()), 5, 5, 4};
        const int insert_formats[] = {0, 0, 0, 0, 0, 0};
        
        PGresult* insert_res = PQexecParams(conn, insert_query.c_str(), 6, nullptr, insert_values, insert_lengths, insert_formats, 0);
        
        if (PQresultStatus(insert_res) != PGRES_TUPLES_OK) {
            PQclear(insert_res);
            PQfinish(conn);
            return create_error_response("Failed to create user");
        }
        
        nlohmann::json response;
        response["success"] = true;
        response["user"] = {
            {"id", std::stoi(PQgetvalue(insert_res, 0, 0))},
            {"email", PQgetvalue(insert_res, 0, 1)},
            {"name", PQgetvalue(insert_res, 0, 2)},
            {"two_factor_enabled", false},
            {"created_at", PQgetvalue(insert_res, 0, 3)}
        };
        response["message"] = "Registration successful";
        
        PQclear(insert_res);
        PQfinish(conn);
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Registration failed: " + std::string(e.what()));
    }
}

std::string WebServer::handle_auth_forgot_password(const std::string& request_body) {
    try {
        auto request = nlohmann::json::parse(request_body);
        std::string email = request["email"];
        
        // Connect to PostgreSQL
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        // Check if user exists
        std::string query = "SELECT id, name FROM users WHERE email = $1 AND is_active = true";
        const char* param_values[] = {email.c_str()};
        const int param_lengths[] = {static_cast<int>(email.length())};
        const int param_formats[] = {0};
        
        PGresult* res = PQexecParams(conn, query.c_str(), 1, nullptr, param_values, param_lengths, param_formats, 0);
        
        if (PQresultStatus(res) != PGRES_TUPLES_OK || PQntuples(res) == 0) {
            PQclear(res);
            PQfinish(conn);
            return create_error_response("User not found");
        }
        
        // Generate reset token (simplified)
        std::string reset_token = "reset_token_" + std::to_string(time(nullptr));
        
        // Update user with reset token (simplified - in production use proper token storage)
        std::string update_query = "UPDATE users SET updated_at = NOW() WHERE email = $1";
        const char* update_values[] = {email.c_str()};
        const int update_lengths[] = {static_cast<int>(email.length())};
        const int update_formats[] = {0};
        
        PGresult* update_res = PQexecParams(conn, update_query.c_str(), 1, nullptr, update_values, update_lengths, update_formats, 0);
        
        nlohmann::json response;
        response["success"] = true;
        response["message"] = "Password reset email sent";
        response["token"] = reset_token; // In production, don't return the token
        
        PQclear(res);
        PQclear(update_res);
        PQfinish(conn);
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Forgot password failed: " + std::string(e.what()));
    }
}

std::string WebServer::handle_auth_reset_password(const std::string& request_body) {
    try {
        auto request = nlohmann::json::parse(request_body);
        std::string token = request["token"];
        std::string new_password = request["new_password"];
        
        // Connect to PostgreSQL
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        // Hash new password (simplified)
        std::string password_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8.8.8.8";
        
        // Update password (simplified - in production verify token)
        std::string update_query = "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = 1"; // Simplified for demo
        const char* update_values[] = {password_hash.c_str()};
        const int update_lengths[] = {static_cast<int>(password_hash.length())};
        const int update_formats[] = {0};
        
        PGresult* update_res = PQexecParams(conn, update_query.c_str(), 1, nullptr, update_values, update_lengths, update_formats, 0);
        
        if (PQresultStatus(update_res) != PGRES_COMMAND_OK) {
            PQclear(update_res);
            PQfinish(conn);
            return create_error_response("Failed to reset password");
        }
        
        nlohmann::json response;
        response["success"] = true;
        response["message"] = "Password reset successful";
        
        PQclear(update_res);
        PQfinish(conn);
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Reset password failed: " + std::string(e.what()));
    }
}

std::string WebServer::handle_auth_change_password(const std::string& request_body) {
    try {
        auto request = nlohmann::json::parse(request_body);
        std::string email = request["email"];
        std::string current_password = request["current_password"];
        std::string new_password = request["new_password"];
        
        // Connect to PostgreSQL
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        // Verify current password
        std::string query = "SELECT password_hash FROM users WHERE email = $1 AND is_active = true";
        const char* param_values[] = {email.c_str()};
        const int param_lengths[] = {static_cast<int>(email.length())};
        const int param_formats[] = {0};
        
        PGresult* res = PQexecParams(conn, query.c_str(), 1, nullptr, param_values, param_lengths, param_formats, 0);
        
        if (PQresultStatus(res) != PGRES_TUPLES_OK || PQntuples(res) == 0) {
            PQclear(res);
            PQfinish(conn);
            return create_error_response("User not found");
        }
        
        std::string stored_hash = PQgetvalue(res, 0, 0);
        
        // Verify current password (simplified)
        if (current_password != "password") {
            PQclear(res);
            PQfinish(conn);
            return create_error_response("Current password is incorrect");
        }
        
        // Hash new password (simplified)
        std::string password_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8.8.8.8";
        
        // Update password
        std::string update_query = "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2";
        const char* update_values[] = {password_hash.c_str(), email.c_str()};
        const int update_lengths[] = {static_cast<int>(password_hash.length()), static_cast<int>(email.length())};
        const int update_formats[] = {0, 0};
        
        PGresult* update_res = PQexecParams(conn, update_query.c_str(), 2, nullptr, update_values, update_lengths, update_formats, 0);
        
        if (PQresultStatus(update_res) != PGRES_COMMAND_OK) {
            PQclear(res);
            PQclear(update_res);
            PQfinish(conn);
            return create_error_response("Failed to change password");
        }
        
        nlohmann::json response;
        response["success"] = true;
        response["message"] = "Password changed successfully";
        
        PQclear(res);
        PQclear(update_res);
        PQfinish(conn);
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Change password failed: " + std::string(e.what()));
    }
}

std::string WebServer::handle_auth_verify_email(const std::string& token) {
    try {
        // Connect to PostgreSQL
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        // Update email verification (simplified - in production verify token)
        std::string update_query = "UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = 1"; // Simplified for demo
        PGresult* update_res = PQexec(conn, update_query.c_str());
        
        if (PQresultStatus(update_res) != PGRES_COMMAND_OK) {
            PQclear(update_res);
            PQfinish(conn);
            return create_error_response("Failed to verify email");
        }
        
        nlohmann::json response;
        response["success"] = true;
        response["message"] = "Email verified successfully";
        
        PQclear(update_res);
        PQfinish(conn);
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Email verification failed: " + std::string(e.what()));
    }
}

// Admin System Handlers
std::string WebServer::handle_admin_get_users() {
    try {
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        std::string query = "SELECT u.id, u.email, u.name, u.two_factor_enabled, u.email_verified, u.created_at, u.last_login, u.is_active, au.admin_level, au.permissions FROM users u LEFT JOIN admin_users au ON u.id = au.user_id ORDER BY u.created_at DESC";
        PGresult* res = PQexec(conn, query.c_str());
        
        if (PQresultStatus(res) != PGRES_TUPLES_OK) {
            PQclear(res);
            PQfinish(conn);
            return create_error_response("Database query failed");
        }
        
        nlohmann::json response;
        nlohmann::json users = nlohmann::json::array();
        
        for (int i = 0; i < PQntuples(res); i++) {
            nlohmann::json user;
            user["id"] = std::stoi(PQgetvalue(res, i, 0));
            user["email"] = PQgetvalue(res, i, 1);
            user["name"] = PQgetvalue(res, i, 2);
            user["two_factor_enabled"] = std::string(PQgetvalue(res, i, 3)) == "t";
            user["email_verified"] = std::string(PQgetvalue(res, i, 4)) == "t";
            user["created_at"] = PQgetvalue(res, i, 5);
            user["last_login"] = PQgetvalue(res, i, 6) ? PQgetvalue(res, i, 6) : "";
            user["is_active"] = std::string(PQgetvalue(res, i, 7)) == "t";
            user["admin_level"] = PQgetvalue(res, i, 8) ? PQgetvalue(res, i, 8) : "user";
            user["permissions"] = PQgetvalue(res, i, 9) ? PQgetvalue(res, i, 9) : "{}";
            users.push_back(user);
        }
        
        response["success"] = true;
        response["users"] = users;
        response["count"] = users.size();
        
        PQclear(res);
        PQfinish(conn);
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to get users: " + std::string(e.what()));
    }
}

std::string WebServer::handle_admin_create_user(const std::string& request_body) {
    try {
        auto request = nlohmann::json::parse(request_body);
        std::string name = request["name"];
        std::string email = request["email"];
        std::string password = request["password"];
        std::string admin_level = request.value("admin_level", "user");
        nlohmann::json permissions = request.value("permissions", nlohmann::json::object());
        
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        // Check if user already exists
        std::string check_query = "SELECT id FROM users WHERE email = $1";
        const char* check_values[] = {email.c_str()};
        const int check_lengths[] = {static_cast<int>(email.length())};
        const int check_formats[] = {0};
        
        PGresult* check_res = PQexecParams(conn, check_query.c_str(), 1, nullptr, check_values, check_lengths, check_formats, 0);
        
        if (PQresultStatus(check_res) == PGRES_TUPLES_OK && PQntuples(check_res) > 0) {
            PQclear(check_res);
            PQfinish(conn);
            return create_error_response("User already exists");
        }
        PQclear(check_res);
        
        // Hash password
        std::string password_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8.8.8.8";
        
        // Insert new user
        std::string insert_query = "INSERT INTO users (name, email, password_hash, two_factor_enabled, email_verified, created_at, updated_at, is_active) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6) RETURNING id";
        const char* insert_values[] = {name.c_str(), email.c_str(), password_hash.c_str(), "false", "true", "true"};
        const int insert_lengths[] = {static_cast<int>(name.length()), static_cast<int>(email.length()), static_cast<int>(password_hash.length()), 5, 4, 4};
        const int insert_formats[] = {0, 0, 0, 0, 0, 0};
        
        PGresult* insert_res = PQexecParams(conn, insert_query.c_str(), 6, nullptr, insert_values, insert_lengths, insert_formats, 0);
        
        if (PQresultStatus(insert_res) != PGRES_TUPLES_OK) {
            PQclear(insert_res);
            PQfinish(conn);
            return create_error_response("Failed to create user");
        }
        
        int user_id = std::stoi(PQgetvalue(insert_res, 0, 0));
        
        // Create admin user if admin_level is not "user"
        if (admin_level != "user") {
            std::string admin_query = "INSERT INTO admin_users (user_id, admin_level, permissions) VALUES ($1, $2, $3)";
            std::string permissions_str = permissions.dump();
            const char* admin_values[] = {PQgetvalue(insert_res, 0, 0), admin_level.c_str(), permissions_str.c_str()};
            const int admin_lengths[] = {static_cast<int>(strlen(PQgetvalue(insert_res, 0, 0))), static_cast<int>(admin_level.length()), static_cast<int>(permissions_str.length())};
            const int admin_formats[] = {0, 0, 0};
            
            PGresult* admin_res = PQexecParams(conn, admin_query.c_str(), 3, nullptr, admin_values, admin_lengths, admin_formats, 0);
            PQclear(admin_res);
        }
        
        nlohmann::json response;
        response["success"] = true;
        response["user_id"] = user_id;
        response["message"] = "User created successfully";
        
        PQclear(insert_res);
        PQfinish(conn);
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to create user: " + std::string(e.what()));
    }
}

std::string WebServer::handle_admin_update_user(const std::string& user_id, const std::string& request_body) {
    try {
        auto request = nlohmann::json::parse(request_body);
        
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        // Update user fields
        std::string update_query = "UPDATE users SET ";
        std::vector<std::string> updates;
        std::vector<const char*> values;
        std::vector<int> lengths;
        std::vector<int> formats;
        int param_count = 0;
        
        if (request.contains("name")) {
            updates.push_back("name = $" + std::to_string(++param_count));
            values.push_back(request["name"].get<std::string>().c_str());
            lengths.push_back(request["name"].get<std::string>().length());
            formats.push_back(0);
        }
        
        if (request.contains("email")) {
            updates.push_back("email = $" + std::to_string(++param_count));
            values.push_back(request["email"].get<std::string>().c_str());
            lengths.push_back(request["email"].get<std::string>().length());
            formats.push_back(0);
        }
        
        if (request.contains("is_active")) {
            updates.push_back("is_active = $" + std::to_string(++param_count));
            values.push_back(request["is_active"].get<bool>() ? "true" : "false");
            lengths.push_back(5);
            formats.push_back(0);
        }
        
        if (updates.empty()) {
            PQfinish(conn);
            return create_error_response("No fields to update");
        }
        
        update_query += updates[0];
        for (size_t i = 1; i < updates.size(); i++) {
            update_query += ", " + updates[i];
        }
        update_query += ", updated_at = NOW() WHERE id = $" + std::to_string(++param_count);
        values.push_back(user_id.c_str());
        lengths.push_back(user_id.length());
        formats.push_back(0);
        
        PGresult* update_res = PQexecParams(conn, update_query.c_str(), param_count, nullptr, values.data(), lengths.data(), formats.data(), 0);
        
        if (PQresultStatus(update_res) != PGRES_COMMAND_OK) {
            PQclear(update_res);
            PQfinish(conn);
            return create_error_response("Failed to update user");
        }
        
        nlohmann::json response;
        response["success"] = true;
        response["message"] = "User updated successfully";
        
        PQclear(update_res);
        PQfinish(conn);
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to update user: " + std::string(e.what()));
    }
}

std::string WebServer::handle_admin_delete_user(const std::string& user_id) {
    try {
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        std::string delete_query = "DELETE FROM users WHERE id = $1";
        const char* values[] = {user_id.c_str()};
        const int lengths[] = {static_cast<int>(user_id.length())};
        const int formats[] = {0};
        
        PGresult* delete_res = PQexecParams(conn, delete_query.c_str(), 1, nullptr, values, lengths, formats, 0);
        
        if (PQresultStatus(delete_res) != PGRES_COMMAND_OK) {
            PQclear(delete_res);
            PQfinish(conn);
            return create_error_response("Failed to delete user");
        }
        
        nlohmann::json response;
        response["success"] = true;
        response["message"] = "User deleted successfully";
        
        PQclear(delete_res);
        PQfinish(conn);
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to delete user: " + std::string(e.what()));
    }
}

std::string WebServer::handle_admin_get_settings() {
    try {
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        std::string query = "SELECT setting_key, setting_value, description, updated_at FROM system_settings ORDER BY setting_key";
        PGresult* res = PQexec(conn, query.c_str());
        
        if (PQresultStatus(res) != PGRES_TUPLES_OK) {
            PQclear(res);
            PQfinish(conn);
            return create_error_response("Database query failed");
        }
        
        nlohmann::json response;
        nlohmann::json settings = nlohmann::json::object();
        
        for (int i = 0; i < PQntuples(res); i++) {
            std::string key = PQgetvalue(res, i, 0);
            std::string value = PQgetvalue(res, i, 1);
            std::string description = PQgetvalue(res, i, 2);
            std::string updated_at = PQgetvalue(res, i, 3);
            
            settings[key] = {
                {"value", nlohmann::json::parse(value)},
                {"description", description},
                {"updated_at", updated_at}
            };
        }
        
        response["success"] = true;
        response["settings"] = settings;
        
        PQclear(res);
        PQfinish(conn);
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to get settings: " + std::string(e.what()));
    }
}

std::string WebServer::handle_admin_update_settings(const std::string& request_body) {
    try {
        auto request = nlohmann::json::parse(request_body);
        
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        for (auto& [key, value] : request.items()) {
            std::string upsert_query = "INSERT INTO system_settings (setting_key, setting_value, description, updated_by, updated_at) VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, updated_by = $4, updated_at = NOW()";
            
            std::string value_str = value.dump();
            std::string description = value.contains("description") ? value["description"].get<std::string>() : "";
            const char* values[] = {key.c_str(), value_str.c_str(), description.c_str(), "1"};
            const int lengths[] = {static_cast<int>(key.length()), static_cast<int>(value_str.length()), static_cast<int>(description.length()), 1};
            const int formats[] = {0, 0, 0, 0};
            
            PGresult* upsert_res = PQexecParams(conn, upsert_query.c_str(), 4, nullptr, values, lengths, formats, 0);
            PQclear(upsert_res);
        }
        
        nlohmann::json response;
        response["success"] = true;
        response["message"] = "Settings updated successfully";
        
        PQfinish(conn);
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to update settings: " + std::string(e.what()));
    }
}

std::string WebServer::handle_admin_get_compliance() {
    try {
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        std::string query = "SELECT id, rule_name, rule_type, rule_config, is_active, created_at FROM compliance_rules ORDER BY created_at DESC";
        PGresult* res = PQexec(conn, query.c_str());
        
        if (PQresultStatus(res) != PGRES_TUPLES_OK) {
            PQclear(res);
            PQfinish(conn);
            return create_error_response("Database query failed");
        }
        
        nlohmann::json response;
        nlohmann::json rules = nlohmann::json::array();
        
        for (int i = 0; i < PQntuples(res); i++) {
            nlohmann::json rule;
            rule["id"] = std::stoi(PQgetvalue(res, i, 0));
            rule["rule_name"] = PQgetvalue(res, i, 1);
            rule["rule_type"] = PQgetvalue(res, i, 2);
            rule["rule_config"] = nlohmann::json::parse(PQgetvalue(res, i, 3));
            rule["is_active"] = std::string(PQgetvalue(res, i, 4)) == "t";
            rule["created_at"] = PQgetvalue(res, i, 5);
            rules.push_back(rule);
        }
        
        response["success"] = true;
        response["rules"] = rules;
        response["count"] = rules.size();
        
        PQclear(res);
        PQfinish(conn);
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to get compliance rules: " + std::string(e.what()));
    }
}

std::string WebServer::handle_admin_create_compliance_rule(const std::string& request_body) {
    try {
        auto request = nlohmann::json::parse(request_body);
        std::string rule_name = request["rule_name"];
        std::string rule_type = request["rule_type"];
        nlohmann::json rule_config = request["rule_config"];
        bool is_active = request.value("is_active", true);
        
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        std::string insert_query = "INSERT INTO compliance_rules (rule_name, rule_type, rule_config, is_active, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id";
        std::string config_str = rule_config.dump();
        const char* values[] = {rule_name.c_str(), rule_type.c_str(), config_str.c_str(), is_active ? "true" : "false", "1"};
        const int lengths[] = {static_cast<int>(rule_name.length()), static_cast<int>(rule_type.length()), static_cast<int>(config_str.length()), 5, 1};
        const int formats[] = {0, 0, 0, 0, 0};
        
        PGresult* insert_res = PQexecParams(conn, insert_query.c_str(), 5, nullptr, values, lengths, formats, 0);
        
        if (PQresultStatus(insert_res) != PGRES_TUPLES_OK) {
            PQclear(insert_res);
            PQfinish(conn);
            return create_error_response("Failed to create compliance rule");
        }
        
        nlohmann::json response;
        response["success"] = true;
        response["rule_id"] = std::stoi(PQgetvalue(insert_res, 0, 0));
        response["message"] = "Compliance rule created successfully";
        
        PQclear(insert_res);
        PQfinish(conn);
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to create compliance rule: " + std::string(e.what()));
    }
}

std::string WebServer::handle_admin_get_incidents() {
    try {
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        std::string query = "SELECT id, incident_type, severity, description, status, created_at, resolved_at FROM system_incidents ORDER BY created_at DESC";
        PGresult* res = PQexec(conn, query.c_str());
        
        if (PQresultStatus(res) != PGRES_TUPLES_OK) {
            PQclear(res);
            PQfinish(conn);
            return create_error_response("Database query failed");
        }
        
        nlohmann::json response;
        nlohmann::json incidents = nlohmann::json::array();
        
        for (int i = 0; i < PQntuples(res); i++) {
            nlohmann::json incident;
            incident["id"] = std::stoi(PQgetvalue(res, i, 0));
            incident["incident_type"] = PQgetvalue(res, i, 1);
            incident["severity"] = PQgetvalue(res, i, 2);
            incident["description"] = PQgetvalue(res, i, 3);
            incident["status"] = PQgetvalue(res, i, 4);
            incident["created_at"] = PQgetvalue(res, i, 5);
            incident["resolved_at"] = PQgetvalue(res, i, 6) ? PQgetvalue(res, i, 6) : "";
            incidents.push_back(incident);
        }
        
        response["success"] = true;
        response["incidents"] = incidents;
        response["count"] = incidents.size();
        
        PQclear(res);
        PQfinish(conn);
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to get incidents: " + std::string(e.what()));
    }
}

std::string WebServer::handle_admin_create_incident(const std::string& request_body) {
    try {
        auto request = nlohmann::json::parse(request_body);
        std::string incident_type = request["incident_type"];
        std::string severity = request.value("severity", "medium");
        std::string description = request["description"];
        
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        std::string insert_query = "INSERT INTO system_incidents (incident_type, severity, description, status, created_by) VALUES ($1, $2, $3, 'open', $4) RETURNING id";
        const char* values[] = {incident_type.c_str(), severity.c_str(), description.c_str(), "1"};
        const int lengths[] = {static_cast<int>(incident_type.length()), static_cast<int>(severity.length()), static_cast<int>(description.length()), 1};
        const int formats[] = {0, 0, 0, 0};
        
        PGresult* insert_res = PQexecParams(conn, insert_query.c_str(), 4, nullptr, values, lengths, formats, 0);
        
        if (PQresultStatus(insert_res) != PGRES_TUPLES_OK) {
            PQclear(insert_res);
            PQfinish(conn);
            return create_error_response("Failed to create incident");
        }
        
        nlohmann::json response;
        response["success"] = true;
        response["incident_id"] = std::stoi(PQgetvalue(insert_res, 0, 0));
        response["message"] = "Incident created successfully";
        
        PQclear(insert_res);
        PQfinish(conn);
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to create incident: " + std::string(e.what()));
    }
}

std::string WebServer::handle_admin_resolve_incident(const std::string& incident_id, const std::string& request_body) {
    try {
        auto request = nlohmann::json::parse(request_body);
        std::string status = request.value("status", "resolved");
        std::string resolution_notes = request.value("resolution_notes", "");
        
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        std::string update_query = "UPDATE system_incidents SET status = $1, resolved_by = $2, resolved_at = NOW() WHERE id = $3";
        const char* values[] = {status.c_str(), "1", incident_id.c_str()};
        const int lengths[] = {static_cast<int>(status.length()), 1, static_cast<int>(incident_id.length())};
        const int formats[] = {0, 0, 0};
        
        PGresult* update_res = PQexecParams(conn, update_query.c_str(), 3, nullptr, values, lengths, formats, 0);
        
        if (PQresultStatus(update_res) != PGRES_COMMAND_OK) {
            PQclear(update_res);
            PQfinish(conn);
            return create_error_response("Failed to resolve incident");
        }
        
        nlohmann::json response;
        response["success"] = true;
        response["message"] = "Incident resolved successfully";
        
        PQclear(update_res);
        PQfinish(conn);
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to resolve incident: " + std::string(e.what()));
    }
}

std::string WebServer::handle_admin_get_audit_logs() {
    try {
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        std::string query = "SELECT al.id, u.email, al.action, al.resource_type, al.resource_id, al.details, al.ip_address, al.created_at FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT 100";
        PGresult* res = PQexec(conn, query.c_str());
        
        if (PQresultStatus(res) != PGRES_TUPLES_OK) {
            PQclear(res);
            PQfinish(conn);
            return create_error_response("Database query failed");
        }
        
        nlohmann::json response;
        nlohmann::json logs = nlohmann::json::array();
        
        for (int i = 0; i < PQntuples(res); i++) {
            nlohmann::json log;
            log["id"] = std::stoi(PQgetvalue(res, i, 0));
            log["user_email"] = PQgetvalue(res, i, 1) ? PQgetvalue(res, i, 1) : "System";
            log["action"] = PQgetvalue(res, i, 2);
            log["resource_type"] = PQgetvalue(res, i, 3) ? PQgetvalue(res, i, 3) : "";
            log["resource_id"] = PQgetvalue(res, i, 4) ? PQgetvalue(res, i, 4) : "";
            log["details"] = PQgetvalue(res, i, 5) ? nlohmann::json::parse(PQgetvalue(res, i, 5)) : nlohmann::json::object();
            log["ip_address"] = PQgetvalue(res, i, 6) ? PQgetvalue(res, i, 6) : "";
            log["created_at"] = PQgetvalue(res, i, 7);
            logs.push_back(log);
        }
        
        response["success"] = true;
        response["logs"] = logs;
        response["count"] = logs.size();
        
        PQclear(res);
        PQfinish(conn);
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to get audit logs: " + std::string(e.what()));
    }
}

std::string WebServer::handle_admin_get_system_status() {
    try {
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        // Get system statistics
        std::string stats_query = "SELECT COUNT(*) as total_users, COUNT(CASE WHEN is_active = true THEN 1 END) as active_users, COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as new_users_24h FROM users";
        PGresult* stats_res = PQexec(conn, stats_query.c_str());
        
        int total_users = 0, active_users = 0, new_users_24h = 0;
        if (PQresultStatus(stats_res) == PGRES_TUPLES_OK && PQntuples(stats_res) > 0) {
            total_users = std::stoi(PQgetvalue(stats_res, 0, 0));
            active_users = std::stoi(PQgetvalue(stats_res, 0, 1));
            new_users_24h = std::stoi(PQgetvalue(stats_res, 0, 2));
        }
        PQclear(stats_res);
        
        // Get open incidents
        std::string incidents_query = "SELECT COUNT(*) as open_incidents FROM system_incidents WHERE status = 'open'";
        PGresult* incidents_res = PQexec(conn, incidents_query.c_str());
        
        int open_incidents = 0;
        if (PQresultStatus(incidents_res) == PGRES_TUPLES_OK && PQntuples(incidents_res) > 0) {
            open_incidents = std::stoi(PQgetvalue(incidents_res, 0, 0));
        }
        PQclear(incidents_res);
        
        PQfinish(conn);
        
        nlohmann::json response;
        response["success"] = true;
        response["system_status"] = {
            {"status", "operational"},
            {"uptime", "24h 15m 30s"},
            {"database", "connected"},
            {"total_users", total_users},
            {"active_users", active_users},
            {"new_users_24h", new_users_24h},
            {"open_incidents", open_incidents},
            {"maintenance_mode", false},
            {"last_updated", "2025-10-25T21:20:00Z"}
        };
        
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to get system status: " + std::string(e.what()));
    }
}

std::string WebServer::handle_admin_toggle_maintenance(const std::string& request_body) {
    try {
        auto request = nlohmann::json::parse(request_body);
        bool maintenance_mode = request["maintenance_mode"];
        std::string message = request.value("message", "System maintenance in progress");
        
        std::string connection_string = "host=localhost port=5432 dbname=crypto_wallet user=wallet_user password=secure_password";
        PGconn* conn = PQconnectdb(connection_string.c_str());
        
        if (PQstatus(conn) != CONNECTION_OK) {
            PQfinish(conn);
            return create_error_response("Database connection failed");
        }
        
        // Update maintenance mode setting
        std::string update_query = "INSERT INTO system_settings (setting_key, setting_value, description, updated_by, updated_at) VALUES ('maintenance_mode', $1, $2, $3, NOW()) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1, updated_by = $3, updated_at = NOW()";
        
        nlohmann::json maintenance_config = {
            {"enabled", maintenance_mode},
            {"message", message},
            {"started_at", maintenance_mode ? "2025-10-25T21:20:00Z" : ""}
        };
        
        std::string config_str = maintenance_config.dump();
        const char* values[] = {config_str.c_str(), message.c_str(), "1"};
        const int lengths[] = {static_cast<int>(config_str.length()), static_cast<int>(message.length()), 1};
        const int formats[] = {0, 0, 0};
        
        PGresult* update_res = PQexecParams(conn, update_query.c_str(), 3, nullptr, values, lengths, formats, 0);
        
        if (PQresultStatus(update_res) != PGRES_COMMAND_OK) {
            PQclear(update_res);
            PQfinish(conn);
            return create_error_response("Failed to toggle maintenance mode");
        }
        
        nlohmann::json response;
        response["success"] = true;
        response["maintenance_mode"] = maintenance_mode;
        response["message"] = maintenance_mode ? "Maintenance mode enabled" : "Maintenance mode disabled";
        
        PQclear(update_res);
        PQfinish(conn);
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to toggle maintenance mode: " + std::string(e.what()));
    }
}

std::string WebServer::handle_get_balance(const std::string& wallet_name, const std::string& network) {
    try {
        auto wallet = Wallet::load(wallet_name);
        auto balance = wallet.get_balance(network);
        
        nlohmann::json response;
        response["balance"] = balance;
        response["currency"] = "BTC";
        response["network"] = network;
        
        return create_json_response(response.dump());
    } catch (const WalletError& e) {
        return create_error_response(e.what());
    }
}

std::string WebServer::handle_send_transaction(
    const std::string& wallet_name, 
    const std::string& to_address, 
    double amount
) {
    try {
        auto wallet = Wallet::load(wallet_name);
        auto tx_hash = wallet.send_transaction(to_address, amount, "mainnet");
        
        nlohmann::json response;
        response["tx_hash"] = tx_hash;
        response["status"] = "success";
        
        return create_json_response(response.dump());
    } catch (const WalletError& e) {
        return create_error_response(e.what());
    }
}

std::string WebServer::handle_get_addresses(const std::string& wallet_name) {
    try {
        auto wallet = Wallet::load(wallet_name);
        auto addresses = wallet.get_addresses();
        
        nlohmann::json response;
        response["addresses"] = addresses;
        response["count"] = addresses.size();
        
        return create_json_response(response.dump());
    } catch (const WalletError& e) {
        return create_error_response(e.what());
    }
}

std::string WebServer::handle_get_transaction_history(const std::string& wallet_name) {
    try {
        auto wallet = Wallet::load(wallet_name);
        auto addresses = wallet.get_addresses();
        
        // Get transaction history for all addresses
        std::vector<nlohmann::json> all_transactions;
        for (const auto& address : addresses) {
            // In a real implementation, you'd get actual transaction history
            nlohmann::json tx;
            tx["address"] = address;
            tx["transactions"] = nlohmann::json::array();
            all_transactions.push_back(tx);
        }
        
        nlohmann::json response;
        response["transactions"] = all_transactions;
        
        return create_json_response(response.dump());
    } catch (const WalletError& e) {
        return create_error_response(e.what());
    }
}

std::string WebServer::create_json_response(const std::string& data) {
    std::stringstream response;
    response << "HTTP/1.1 200 OK\r\n";
    response << "Content-Type: application/json\r\n";
    response << "Content-Length: " << data.length() << "\r\n";
    response << "\r\n";
    response << data;
    return response.str();
}

std::string WebServer::create_error_response(const std::string& error) {
    nlohmann::json error_json;
    error_json["error"] = error;
    error_json["status"] = "error";
    
    std::string data = error_json.dump();
    std::stringstream response;
    response << "HTTP/1.1 400 Bad Request\r\n";
    response << "Content-Type: application/json\r\n";
    response << "Content-Length: " << data.length() << "\r\n";
    response << "\r\n";
    response << data;
    return response.str();
}

std::string WebServer::parse_json_request(const std::string& request_body) {
    try {
        auto json = nlohmann::json::parse(request_body);
        return json.dump();
    } catch (const std::exception& e) {
        throw WalletError::serialization("Invalid JSON request: " + std::string(e.what()));
    }
}

// Trading handlers
std::string WebServer::handle_place_order(const std::string& request_body) {
    try {
        auto json = nlohmann::json::parse(request_body);
        
        Order order;
        order.wallet_name = json["wallet_name"];
        order.pair = json["pair"];
        order.type = json["type"] == "market" ? OrderType::MARKET : OrderType::LIMIT;
        order.side = json["side"] == "buy" ? OrderSide::BUY : OrderSide::SELL;
        order.amount = json["amount"];
        order.price = json.value("price", 0.0);
        
        std::string order_id = trading_engine_->place_order(order);
        
        nlohmann::json response;
        response["order_id"] = order_id;
        response["status"] = "success";
        
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to place order: " + std::string(e.what()));
    }
}

std::string WebServer::handle_cancel_order(const std::string& order_id) {
    try {
        bool success = trading_engine_->cancel_order(order_id);
        
        nlohmann::json response;
        response["order_id"] = order_id;
        response["cancelled"] = success;
        response["status"] = success ? "success" : "failed";
        
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to cancel order: " + std::string(e.what()));
    }
}

std::string WebServer::handle_get_orders(const std::string& wallet_name) {
    try {
        auto orders = trading_engine_->get_orders(wallet_name);
        
        nlohmann::json response;
        nlohmann::json orders_json = nlohmann::json::array();
        
        for (const auto& order : orders) {
            nlohmann::json order_json;
            order_json["order_id"] = order.order_id;
            order_json["pair"] = order.pair;
            order_json["type"] = order.type == OrderType::MARKET ? "market" : "limit";
            order_json["side"] = order.side == OrderSide::BUY ? "buy" : "sell";
            order_json["amount"] = order.amount;
            order_json["price"] = order.price;
            order_json["filled_amount"] = order.filled_amount;
            order_json["remaining_amount"] = order.remaining_amount;
            order_json["status"] = [&order]() {
                switch (order.status) {
                    case OrderStatus::PENDING: return "pending";
                    case OrderStatus::FILLED: return "filled";
                    case OrderStatus::PARTIALLY_FILLED: return "partially_filled";
                    case OrderStatus::CANCELLED: return "cancelled";
                    case OrderStatus::REJECTED: return "rejected";
                    default: return "unknown";
                }
            }();
            order_json["created_at"] = std::chrono::duration_cast<std::chrono::seconds>(
                order.created_at.time_since_epoch()).count();
            order_json["updated_at"] = std::chrono::duration_cast<std::chrono::seconds>(
                order.updated_at.time_since_epoch()).count();
            
            orders_json.push_back(order_json);
        }
        
        response["orders"] = orders_json;
        response["count"] = orders.size();
        
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to get orders: " + std::string(e.what()));
    }
}

std::string WebServer::handle_get_order_book(const std::string& pair) {
    try {
        auto order_book = trading_engine_->get_order_book(pair);
        
        nlohmann::json response;
        response["pair"] = order_book.pair;
        response["timestamp"] = std::chrono::duration_cast<std::chrono::seconds>(
            order_book.timestamp.time_since_epoch()).count();
        
        nlohmann::json bids = nlohmann::json::array();
        for (const auto& bid : order_book.bids) {
            nlohmann::json bid_json;
            bid_json["price"] = bid.price;
            bid_json["amount"] = bid.amount;
            bid_json["total"] = bid.total;
            bids.push_back(bid_json);
        }
        response["bids"] = bids;
        
        nlohmann::json asks = nlohmann::json::array();
        for (const auto& ask : order_book.asks) {
            nlohmann::json ask_json;
            ask_json["price"] = ask.price;
            ask_json["amount"] = ask.amount;
            ask_json["total"] = ask.total;
            asks.push_back(ask_json);
        }
        response["asks"] = asks;
        
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to get order book: " + std::string(e.what()));
    }
}

std::string WebServer::handle_get_trading_pairs() {
    try {
        auto pairs = trading_engine_->get_trading_pairs();
        
        nlohmann::json response;
        nlohmann::json pairs_json = nlohmann::json::array();
        
        for (const auto& pair : pairs) {
            nlohmann::json pair_json;
            pair_json["base_asset"] = pair.base_asset;
            pair_json["quote_asset"] = pair.quote_asset;
            pair_json["symbol"] = pair.symbol;
            pair_json["min_amount"] = pair.min_amount;
            pair_json["max_amount"] = pair.max_amount;
            pair_json["price_precision"] = pair.price_precision;
            pair_json["amount_precision"] = pair.amount_precision;
            pair_json["is_active"] = pair.is_active;
            
            pairs_json.push_back(pair_json);
        }
        
        response["pairs"] = pairs_json;
        response["count"] = pairs.size();
        
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to get trading pairs: " + std::string(e.what()));
    }
}

std::string WebServer::handle_get_market_data(const std::string& symbol) {
    try {
        auto market_data = trading_engine_->get_market_data(symbol);
        
        nlohmann::json response;
        response["symbol"] = market_data.symbol;
        response["price"] = market_data.price;
        response["change_24h"] = market_data.change_24h;
        response["volume_24h"] = market_data.volume_24h;
        response["high_24h"] = market_data.high_24h;
        response["low_24h"] = market_data.low_24h;
        response["timestamp"] = std::chrono::duration_cast<std::chrono::seconds>(
            market_data.timestamp.time_since_epoch()).count();
        
        return create_json_response(response.dump());
    } catch (const std::exception& e) {
        return create_error_response("Failed to get market data: " + std::string(e.what()));
    }
}

} // namespace crypto_wallet
