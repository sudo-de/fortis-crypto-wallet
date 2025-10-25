#include "database.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include <filesystem>

namespace crypto_wallet {

// Migration: Initial Schema
class InitialSchemaMigration : public DatabaseMigration {
public:
    std::string get_version() override { return "001"; }
    std::string get_description() override { return "Initial database schema"; }
    
    bool up() override {
        // This is handled by initialize_schema() in the database implementation
        return true;
    }
    
    bool down() override {
        // Drop all tables
        return true;
    }
};

// Migration: Add Indexes
class AddIndexesMigration : public DatabaseMigration {
public:
    std::string get_version() override { return "002"; }
    std::string get_description() override { return "Add performance indexes"; }
    
    bool up() override {
        // Additional indexes for performance
        return true;
    }
    
    bool down() override {
        // Remove indexes
        return true;
    }
};

// Migration: Add Trading Features
class TradingFeaturesMigration : public DatabaseMigration {
public:
    std::string get_version() override { return "003"; }
    std::string get_description() override { return "Add trading features tables"; }
    
    bool up() override {
        // Add trading-specific tables and columns
        return true;
    }
    
    bool down() override {
        // Remove trading features
        return true;
    }
};

// Migration Manager Implementation
class MigrationManagerImpl {
private:
    static std::vector<std::unique_ptr<DatabaseMigration>> migrations_;
    
public:
    static void register_migration(std::unique_ptr<DatabaseMigration> migration) {
        migrations_.push_back(std::move(migration));
    }
    
    static bool run_migrations(Database& database) {
        // Get current version
        std::string current_version = get_current_version(database);
        
        // Run pending migrations
        for (auto& migration : migrations_) {
            if (migration->get_version() > current_version) {
                std::cout << "Running migration " << migration->get_version() 
                         << ": " << migration->get_description() << std::endl;
                
                if (!migration->up()) {
                    std::cerr << "Migration " << migration->get_version() << " failed!" << std::endl;
                    return false;
                }
                
                // Update version
                if (!update_version(database, migration->get_version())) {
                    std::cerr << "Failed to update version to " << migration->get_version() << std::endl;
                    return false;
                }
            }
        }
        
        return true;
    }
    
    static bool rollback_migration(Database& database, const std::string& version) {
        // Find migration by version
        for (auto it = migrations_.rbegin(); it != migrations_.rend(); ++it) {
            if ((*it)->get_version() == version) {
                std::cout << "Rolling back migration " << version << std::endl;
                
                if (!(*it)->down()) {
                    std::cerr << "Rollback of migration " << version << " failed!" << std::endl;
                    return false;
                }
                
                // Update version
                return update_version(database, get_previous_version(version));
            }
        }
        
        return false;
    }
    
    static std::vector<std::string> get_pending_migrations(Database& database) {
        std::vector<std::string> pending;
        std::string current_version = get_current_version(database);
        
        for (const auto& migration : migrations_) {
            if (migration->get_version() > current_version) {
                pending.push_back(migration->get_version());
            }
        }
        
        return pending;
    }
    
private:
    static std::string get_current_version(Database& database) {
        // This would query a migrations table
        return "000";
    }
    
    static bool update_version(Database& database, const std::string& version) {
        // This would update a migrations table
        return true;
    }
    
    static std::string get_previous_version(const std::string& version) {
        // Simple version decrement for demo
        int v = std::stoi(version);
        return std::to_string(v - 1);
    }
};

// Static member definition
std::vector<std::unique_ptr<DatabaseMigration>> MigrationManagerImpl::migrations_;

// Initialize migrations
void initialize_migrations() {
    MigrationManagerImpl::register_migration(std::make_unique<InitialSchemaMigration>());
    MigrationManagerImpl::register_migration(std::make_unique<AddIndexesMigration>());
    MigrationManagerImpl::register_migration(std::make_unique<TradingFeaturesMigration>());
}

// Migration Manager static methods
void MigrationManager::register_migration(std::unique_ptr<DatabaseMigration> migration) {
    MigrationManagerImpl::register_migration(std::move(migration));
}

bool MigrationManager::run_migrations(Database& database) {
    return MigrationManagerImpl::run_migrations(database);
}

bool MigrationManager::rollback_migration(Database& database, const std::string& version) {
    return MigrationManagerImpl::rollback_migration(database, version);
}

std::vector<std::string> MigrationManager::get_pending_migrations(Database& database) {
    return MigrationManagerImpl::get_pending_migrations(database);
}

} // namespace crypto_wallet
