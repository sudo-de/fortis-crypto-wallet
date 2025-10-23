# Fortis Crypto Wallet

A secure, command-line cryptocurrency wallet built in Rust. This wallet supports Bitcoin and provides a foundation for multi-cryptocurrency support.

## Features

- 🔐 **Secure Key Generation**: Uses industry-standard cryptographic libraries
- 🌱 **BIP39 Seed Phrases**: 12-word mnemonic seed phrases for wallet recovery
- 🔑 **HD Wallet Support**: Hierarchical deterministic wallet with BIP32/BIP44
- 💰 **Balance Checking**: Real-time balance queries from blockchain
- 📤 **Transaction Sending**: Send Bitcoin to any address
- 🏠 **Multiple Addresses**: Generate multiple addresses from a single seed
- 💾 **Local Storage**: Encrypted wallet files stored locally
- 🌐 **Network Support**: Mainnet and testnet support

## Installation

### Prerequisites

- Rust 1.70+ installed ([rustup.rs](https://rustup.rs/))
- Git

### Build from Source

```bash
git clone https://github.com/sudo-de/fortis-crypto-wallet.git
cd fortis-crypto-wallet
cargo build --release
```

## Usage

### Create a New Wallet

```bash
cargo run -- create --name my-wallet
```

This will:
- Generate a new 12-word seed phrase
- Create your first Bitcoin address
- Save the wallet securely to your home directory

**⚠️ IMPORTANT**: Store your seed phrase in a safe place! If you lose it, you'll lose access to your funds.

### Import Existing Wallet

```bash
cargo run -- import --name my-wallet --seed-phrase "your twelve word seed phrase here"
```

### Check Balance

```bash
cargo run -- balance --wallet-name my-wallet
```

### Send Bitcoin

```bash
cargo run -- send --wallet-name my-wallet --to-address 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa --amount 0.001
```

### List Addresses

```bash
cargo run -- addresses --wallet-name my-wallet
```

## Security Features

- **Private Keys Never Leave Your Device**: All cryptographic operations happen locally
- **Seed Phrase Recovery**: Your 12-word seed phrase can recover your entire wallet
- **HD Wallet**: Generate unlimited addresses from a single seed
- **Secure Storage**: Wallet files are stored in `~/.crypto-wallet/`

## Architecture

```
src/
├── main.rs          # CLI entry point
├── lib.rs           # Library exports
├── wallet.rs        # Core wallet logic
├── crypto.rs        # Cryptographic operations
├── storage.rs       # Wallet persistence
├── network.rs       # Blockchain interaction
├── cli.rs           # Command-line interface
└── error.rs         # Error handling
```

## Dependencies

- **secp256k1**: Elliptic curve cryptography for Bitcoin
- **bip39**: Mnemonic seed phrase generation
- **bip32**: Hierarchical deterministic key derivation
- **sha2/ripemd**: Cryptographic hashing
- **base58**: Bitcoin address encoding
- **reqwest**: HTTP client for blockchain queries
- **clap**: Command-line argument parsing

## Development

### Running Tests

```bash
cargo test
```

### Building for Release

```bash
cargo build --release
```

The binary will be located at `target/release/crypto-wallet`.

## Security Considerations

- This is educational software. For production use, consider additional security measures
- Always verify addresses before sending funds
- Keep your seed phrase secure and never share it
- Consider using a hardware wallet for large amounts

## Roadmap

- [ ] GUI interface
- [ ] Multi-cryptocurrency support (Ethereum, Litecoin, etc.)
- [ ] Hardware wallet integration
- [ ] Transaction history
- [ ] Address book
- [ ] Fee estimation
- [ ] Multi-signature support

## License

MIT License - see LICENSE file for details.
