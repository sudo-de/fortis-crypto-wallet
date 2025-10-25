cmake_minimum_required(VERSION 3.16)
project(crypto_wallet_backend VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
find_package(PkgConfig REQUIRED)
find_package(OpenSSL REQUIRED)
find_package(Threads REQUIRED)

# Find libcurl
find_package(CURL REQUIRED)

# Find nlohmann_json
find_package(nlohmann_json REQUIRED)

# Find database libraries
find_package(PostgreSQL REQUIRED)
find_package(SQLite3 REQUIRED)

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

# Try to find libsecp256k1, but don't fail if not found
pkg_check_modules(SECP256K1 libsecp256k1)

# Source files
set(SOURCES
    src/main.cpp
    src/wallet.cpp
    src/crypto.cpp
    src/storage.cpp
    src/network.cpp
    src/cli.cpp
    src/error.cpp
    src/web_server.cpp
    src/trading.cpp
    src/database.cpp
    src/migrations.cpp
    src/database_manager.cpp
    src/email_service.cpp
)

# Header files
set(HEADERS
    include/wallet.h
    include/crypto.h
    include/storage.h
    include/network.h
    include/cli.h
    include/error.h
    include/web_server.h
    include/trading.h
    include/database.h
    include/email_service.h
)

# Create executable
add_executable(crypto_wallet ${SOURCES} ${HEADERS})

# Link libraries
target_link_libraries(crypto_wallet
    OpenSSL::SSL
    OpenSSL::Crypto
    CURL::libcurl
    nlohmann_json::nlohmann_json
    Threads::Threads
    PostgreSQL::PostgreSQL
    SQLite::SQLite3
)

# Add libsecp256k1 if found
if(SECP256K1_FOUND)
    target_include_directories(crypto_wallet PRIVATE ${SECP256K1_INCLUDE_DIRS})
    target_link_libraries(crypto_wallet ${SECP256K1_LIBRARIES})
    target_compile_options(crypto_wallet PRIVATE ${SECP256K1_CFLAGS_OTHER})
    add_definitions(-DHAVE_SECP256K1)
endif()

# Installation
install(TARGETS crypto_wallet DESTINATION bin)