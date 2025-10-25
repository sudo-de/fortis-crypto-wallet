#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <thread>
#include <chrono>
#include "wallet.h"
#include "cli.h"
#include "web_server.h"
#include "error.h"

namespace crypto_wallet {

class CLI {
public:
    static void run(int argc, char* argv[]) {
        if (argc < 2) {
            print_usage();
            return;
        }
        
        std::string command = argv[1];
        
        try {
            if (command == "create") {
                handle_create(argc, argv);
            } else if (command == "import") {
                handle_import(argc, argv);
            } else if (command == "send") {
                handle_send(argc, argv);
            } else if (command == "balance") {
                handle_balance(argc, argv);
            } else if (command == "addresses") {
                handle_addresses(argc, argv);
            } else if (command == "server") {
                handle_server();
            } else {
                std::cerr << "Unknown command: " << command << std::endl;
                print_usage();
            }
        } catch (const WalletError& e) {
            std::cerr << "Error: " << e.what() << std::endl;
        } catch (const std::exception& e) {
            std::cerr << "Unexpected error: " << e.what() << std::endl;
        }
    }
    
private:
    static void print_usage() {
        std::cout << "Usage: crypto_wallet <command> [options]\n\n";
        std::cout << "Commands:\n";
        std::cout << "  create -n <name> [-p <password>]     Create a new wallet\n";
        std::cout << "  import -n <name> -s <seed> [-p <password>]  Import wallet from seed phrase\n";
        std::cout << "  send -w <wallet> -t <address> -a <amount> [-n <network>]  Send cryptocurrency\n";
        std::cout << "  balance -w <wallet> [-n <network>]   Get wallet balance\n";
        std::cout << "  addresses -w <wallet>                List wallet addresses\n";
        std::cout << "  server                               Start web server with GUI\n";
    }
    
    static void handle_create(int argc, char* argv[]) {
        std::string name;
        std::string password;
        
        for (int i = 2; i < argc; i += 2) {
            if (i + 1 >= argc) break;
            
            std::string flag = argv[i];
            std::string value = argv[i + 1];
            
            if (flag == "-n" || flag == "--name") {
                name = value;
            } else if (flag == "-p" || flag == "--password") {
                password = value;
            }
        }
        
        if (name.empty()) {
            std::cerr << "Error: Wallet name is required (-n)" << std::endl;
            return;
        }
        
        auto wallet = Wallet::create_new(name);
        std::cout << "✅ Wallet '" << name << "' created successfully!" << std::endl;
        std::cout << "📝 Seed phrase: " << wallet.get_seed_phrase() << std::endl;
        std::cout << "⚠️  IMPORTANT: Store your seed phrase in a safe place!" << std::endl;
    }
    
    static void handle_import(int argc, char* argv[]) {
        std::string name;
        std::string seed_phrase;
        std::string password;
        
        for (int i = 2; i < argc; i += 2) {
            if (i + 1 >= argc) break;
            
            std::string flag = argv[i];
            std::string value = argv[i + 1];
            
            if (flag == "-n" || flag == "--name") {
                name = value;
            } else if (flag == "-s" || flag == "--seed") {
                seed_phrase = value;
            } else if (flag == "-p" || flag == "--password") {
                password = value;
            }
        }
        
        if (name.empty() || seed_phrase.empty()) {
            std::cerr << "Error: Wallet name (-n) and seed phrase (-s) are required" << std::endl;
            return;
        }
        
        auto wallet = Wallet::from_seed_phrase(seed_phrase, name);
        std::cout << "✅ Wallet '" << name << "' imported successfully!" << std::endl;
    }
    
    static void handle_send(int argc, char* argv[]) {
        std::string wallet_name;
        std::string to_address;
        double amount = 0.0;
        std::string network = "mainnet";
        
        for (int i = 2; i < argc; i += 2) {
            if (i + 1 >= argc) break;
            
            std::string flag = argv[i];
            std::string value = argv[i + 1];
            
            if (flag == "-w" || flag == "--wallet") {
                wallet_name = value;
            } else if (flag == "-t" || flag == "--to") {
                to_address = value;
            } else if (flag == "-a" || flag == "--amount") {
                amount = std::stod(value);
            } else if (flag == "-n" || flag == "--network") {
                network = value;
            }
        }
        
        if (wallet_name.empty() || to_address.empty() || amount <= 0) {
            std::cerr << "Error: Wallet name (-w), recipient address (-t), and amount (-a) are required" << std::endl;
            return;
        }
        
        auto wallet = Wallet::load(wallet_name);
        auto tx_hash = wallet.send_transaction(to_address, amount, network);
        std::cout << "✅ Transaction sent successfully!" << std::endl;
        std::cout << "🔗 Transaction hash: " << tx_hash << std::endl;
    }
    
    static void handle_balance(int argc, char* argv[]) {
        std::string wallet_name;
        std::string network = "mainnet";
        
        for (int i = 2; i < argc; i += 2) {
            if (i + 1 >= argc) break;
            
            std::string flag = argv[i];
            std::string value = argv[i + 1];
            
            if (flag == "-w" || flag == "--wallet") {
                wallet_name = value;
            } else if (flag == "-n" || flag == "--network") {
                network = value;
            }
        }
        
        if (wallet_name.empty()) {
            std::cerr << "Error: Wallet name (-w) is required" << std::endl;
            return;
        }
        
        auto wallet = Wallet::load(wallet_name);
        auto balance = wallet.get_balance(network);
        std::cout << "💰 Balance: " << balance << " BTC" << std::endl;
    }
    
    static void handle_addresses(int argc, char* argv[]) {
        std::string wallet_name;
        
        for (int i = 2; i < argc; i += 2) {
            if (i + 1 >= argc) break;
            
            std::string flag = argv[i];
            std::string value = argv[i + 1];
            
            if (flag == "-w" || flag == "--wallet") {
                wallet_name = value;
            }
        }
        
        if (wallet_name.empty()) {
            std::cerr << "Error: Wallet name (-w) is required" << std::endl;
            return;
        }
        
        auto wallet = Wallet::load(wallet_name);
        auto addresses = wallet.get_addresses();
        std::cout << "📍 Wallet addresses:" << std::endl;
        for (size_t i = 0; i < addresses.size(); ++i) {
            std::cout << "  " << (i + 1) << ": " << addresses[i] << std::endl;
        }
    }
    
    static void handle_server() {
        std::cout << "🌐 Starting web server..." << std::endl;
        WebServer server;
        server.start();
        
        // Keep the server running indefinitely
        std::cout << "🌐 Web server started on port 8080" << std::endl;
        std::cout << "Press Enter to stop the server..." << std::endl;
        
        // Run the server in a loop
        while (true) {
            std::this_thread::sleep_for(std::chrono::seconds(1));
            if (std::cin.peek() != EOF) {
                break;
            }
        }
        
        server.stop();
    }
};

} // namespace crypto_wallet

int main(int argc, char* argv[]) {
    crypto_wallet::CLI::run(argc, argv);
    return 0;
}
