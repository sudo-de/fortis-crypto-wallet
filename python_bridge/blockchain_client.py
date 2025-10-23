import asyncio
import json
import logging
from typing import Dict, List, Optional, Union
from dataclasses import dataclass
from decimal import Decimal

# Bitcoin libraries
import requests
from bitcoin import *
from bitcoin.rpc import RawProxy

# Ethereum libraries
from web3 import Web3
from eth_account import Account
from eth_account.messages import encode_defunct

# Other crypto libraries
import requests
from typing import Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Transaction:
    hash: str
    from_address: str
    to_address: str
    amount: Decimal
    currency: str
    status: str
    timestamp: int
    gas_used: Optional[int] = None
    gas_price: Optional[int] = None

@dataclass
class Balance:
    address: str
    balance: Decimal
    currency: str
    usd_value: Optional[Decimal] = None

class BlockchainClient:
    """Advanced blockchain client supporting multiple networks"""
    
    def __init__(self):
        self.bitcoin_rpc = None
        self.ethereum_w3 = None
        self.price_cache = {}
        
    async def initialize(self):
        """Initialize connections to blockchain networks"""
        try:
            # Initialize Bitcoin RPC connection
            self.bitcoin_rpc = RawProxy()
            logger.info("Bitcoin RPC connection established")
        except Exception as e:
            logger.warning(f"Bitcoin RPC not available: {e}")
        
        try:
            # Initialize Ethereum Web3 connection
            # Using Infura for mainnet, can be configured for other networks
            self.ethereum_w3 = Web3(Web3.HTTPProvider('https://mainnet.infura.io/v3/YOUR_PROJECT_ID'))
            if self.ethereum_w3.is_connected():
                logger.info("Ethereum Web3 connection established")
            else:
                logger.warning("Ethereum Web3 connection failed")
        except Exception as e:
            logger.warning(f"Ethereum Web3 not available: {e}")
    
    # Bitcoin Operations
    async def get_bitcoin_balance(self, address: str) -> Decimal:
        """Get Bitcoin balance for an address"""
        if not self.bitcoin_rpc:
            raise Exception("Bitcoin RPC not available")
        
        try:
            # Get unspent transaction outputs
            utxos = self.bitcoin_rpc.listunspent(0, 9999999, [address])
            balance = sum(utxo['amount'] for utxo in utxos)
            return Decimal(str(balance))
        except Exception as e:
            logger.error(f"Error getting Bitcoin balance: {e}")
            return Decimal('0')
    
    async def send_bitcoin(self, from_address: str, to_address: str, amount: Decimal, private_key: str) -> str:
        """Send Bitcoin transaction"""
        if not self.bitcoin_rpc:
            raise Exception("Bitcoin RPC not available")
        
        try:
            # Create raw transaction
            utxos = self.bitcoin_rpc.listunspent(0, 9999999, [from_address])
            if not utxos:
                raise Exception("No UTXOs available")
            
            # Select UTXOs for the transaction
            total_input = sum(utxo['amount'] for utxo in utxos)
            if total_input < amount:
                raise Exception("Insufficient funds")
            
            # Create transaction
            inputs = []
            for utxo in utxos:
                inputs.append({
                    'txid': utxo['txid'],
                    'vout': utxo['vout']
                })
            
            outputs = {to_address: float(amount)}
            
            # Add change if needed
            change = total_input - amount
            if change > Decimal('0.00001'):  # Dust threshold
                outputs[from_address] = float(change)
            
            raw_tx = self.bitcoin_rpc.createrawtransaction(inputs, outputs)
            
            # Sign transaction
            signed_tx = self.bitcoin_rpc.signrawtransactionwithkey(raw_tx, [private_key])
            if not signed_tx['complete']:
                raise Exception("Transaction signing failed")
            
            # Broadcast transaction
            tx_hash = self.bitcoin_rpc.sendrawtransaction(signed_tx['hex'])
            return tx_hash
            
        except Exception as e:
            logger.error(f"Error sending Bitcoin: {e}")
            raise
    
    # Ethereum Operations
    async def get_ethereum_balance(self, address: str) -> Decimal:
        """Get Ethereum balance for an address"""
        if not self.ethereum_w3:
            raise Exception("Ethereum Web3 not available")
        
        try:
            balance_wei = self.ethereum_w3.eth.get_balance(address)
            balance_eth = self.ethereum_w3.from_wei(balance_wei, 'ether')
            return Decimal(str(balance_eth))
        except Exception as e:
            logger.error(f"Error getting Ethereum balance: {e}")
            return Decimal('0')
    
    async def send_ethereum(self, from_address: str, to_address: str, amount: Decimal, private_key: str) -> str:
        """Send Ethereum transaction"""
        if not self.ethereum_w3:
            raise Exception("Ethereum Web3 not available")
        
        try:
            # Get account from private key
            account = Account.from_key(private_key)
            
            # Get nonce
            nonce = self.ethereum_w3.eth.get_transaction_count(from_address)
            
            # Get gas price
            gas_price = self.ethereum_w3.eth.gas_price
            
            # Build transaction
            transaction = {
                'to': to_address,
                'value': self.ethereum_w3.to_wei(amount, 'ether'),
                'gas': 21000,  # Standard gas limit for ETH transfer
                'gasPrice': gas_price,
                'nonce': nonce,
                'chainId': 1  # Mainnet
            }
            
            # Sign transaction
            signed_txn = self.ethereum_w3.eth.account.sign_transaction(transaction, private_key)
            
            # Send transaction
            tx_hash = self.ethereum_w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            return tx_hash.hex()
            
        except Exception as e:
            logger.error(f"Error sending Ethereum: {e}")
            raise
    
    # ERC-20 Token Operations
    async def get_erc20_balance(self, token_address: str, wallet_address: str) -> Decimal:
        """Get ERC-20 token balance"""
        if not self.ethereum_w3:
            raise Exception("Ethereum Web3 not available")
        
        try:
            # ERC-20 balanceOf function ABI
            balance_of_abi = {
                "constant": True,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            }
            
            contract = self.ethereum_w3.eth.contract(
                address=token_address,
                abi=[balance_of_abi]
            )
            
            balance = contract.functions.balanceOf(wallet_address).call()
            return Decimal(str(balance))
            
        except Exception as e:
            logger.error(f"Error getting ERC-20 balance: {e}")
            return Decimal('0')
    
    # Multi-currency support
    async def get_balance(self, address: str, currency: str) -> Balance:
        """Get balance for any supported currency"""
        balance = Decimal('0')
        
        if currency.upper() == 'BTC':
            balance = await self.get_bitcoin_balance(address)
        elif currency.upper() == 'ETH':
            balance = await self.get_ethereum_balance(address)
        else:
            # Try as ERC-20 token
            try:
                balance = await self.get_erc20_balance(address, address)
            except:
                logger.warning(f"Unsupported currency: {currency}")
        
        return Balance(
            address=address,
            balance=balance,
            currency=currency.upper()
        )
    
    async def send_transaction(self, from_address: str, to_address: str, amount: Decimal, 
                            currency: str, private_key: str) -> str:
        """Send transaction for any supported currency"""
        if currency.upper() == 'BTC':
            return await self.send_bitcoin(from_address, to_address, amount, private_key)
        elif currency.upper() == 'ETH':
            return await self.send_ethereum(from_address, to_address, amount, private_key)
        else:
            raise Exception(f"Unsupported currency: {currency}")
    
    # Price and market data
    async def get_price(self, currency: str) -> Decimal:
        """Get current price of cryptocurrency in USD"""
        try:
            if currency in self.price_cache:
                return self.price_cache[currency]
            
            # Use CoinGecko API for price data
            url = f"https://api.coingecko.com/api/v3/simple/price?ids={currency.lower()}&vs_currencies=usd"
            response = requests.get(url)
            data = response.json()
            
            price = Decimal(str(data[currency.lower()]['usd']))
            self.price_cache[currency] = price
            return price
            
        except Exception as e:
            logger.error(f"Error getting price for {currency}: {e}")
            return Decimal('0')
    
    # Transaction history
    async def get_transaction_history(self, address: str, currency: str, limit: int = 100) -> List[Transaction]:
        """Get transaction history for an address"""
        transactions = []
        
        try:
            if currency.upper() == 'BTC':
                # Get Bitcoin transaction history
                # This would require more complex implementation with blockchain explorers
                pass
            elif currency.upper() == 'ETH':
                # Get Ethereum transaction history
                if self.ethereum_w3:
                    # This would require integration with blockchain explorers like Etherscan
                    pass
            
        except Exception as e:
            logger.error(f"Error getting transaction history: {e}")
        
        return transactions

# Async main function for testing
async def main():
    """Test the blockchain client"""
    client = BlockchainClient()
    await client.initialize()
    
    # Test getting balance
    test_address = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"  # Genesis block address
    balance = await client.get_balance(test_address, "BTC")
    print(f"Balance: {balance.balance} {balance.currency}")
    
    # Test getting price
    price = await client.get_price("bitcoin")
    print(f"Bitcoin price: ${price}")

if __name__ == "__main__":
    asyncio.run(main())
