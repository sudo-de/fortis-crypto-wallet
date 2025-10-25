// Database Service for Frontend
export interface Wallet {
  id: number;
  name: string;
  public_key: string;
  encrypted_private_key: string;
  network: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  wallet_id: number;
  tx_hash: string;
  from_address: string;
  to_address: string;
  amount: number;
  currency: string;
  status: string;
  fee: number;
  network: string;
  timestamp: string;
  memo: string;
}

export interface TradingOrder {
  id: number;
  wallet_id: number;
  order_id: string;
  pair: string;
  type: string;
  side: string;
  amount: number;
  price: number;
  filled_amount: number;
  remaining_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  error_message: string;
}

export interface MarketData {
  id: number;
  symbol: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  high_24h: number;
  low_24h: number;
  timestamp: string;
}

export interface DatabaseStats {
  wallets: number;
  transactions: number;
  orders: number;
  database_type: string;
}

class DatabaseService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'http://localhost:8080/api/database';
  }

  // Wallet operations
  async getWallets(): Promise<Wallet[]> {
    try {
      const response = await fetch(`${this.baseUrl}/wallets`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.wallets || [];
    } catch (error) {
      console.error('Error fetching wallets:', error);
      return [];
    }
  }

  async getWallet(walletId: number): Promise<Wallet | null> {
    try {
      const response = await fetch(`${this.baseUrl}/wallets/${walletId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.wallet || null;
    } catch (error) {
      console.error('Error fetching wallet:', error);
      return null;
    }
  }

  async createWallet(walletData: {
    name: string;
    public_key: string;
    encrypted_private_key: string;
    network: string;
  }): Promise<number | null> {
    try {
      const response = await fetch(`${this.baseUrl}/wallets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(walletData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.wallet_id || null;
    } catch (error) {
      console.error('Error creating wallet:', error);
      return null;
    }
  }

  async updateWalletBalance(walletId: number, balance: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/wallets/${walletId}/balance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ balance }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      return false;
    }
  }

  // Transaction operations
  async getTransactions(walletId: number): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/wallets/${walletId}/transactions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  async createTransaction(transactionData: {
    wallet_id: number;
    tx_hash: string;
    from_address: string;
    to_address: string;
    amount: number;
    currency: string;
    status: string;
    fee?: number;
    network?: string;
    memo?: string;
  }): Promise<number | null> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.transaction_id || null;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  }

  // Trading operations
  async getTradingOrders(walletId: number): Promise<TradingOrder[]> {
    try {
      const response = await fetch(`${this.baseUrl}/wallets/${walletId}/orders`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Error fetching trading orders:', error);
      return [];
    }
  }

  async createTradingOrder(orderData: {
    wallet_id: number;
    order_id: string;
    pair: string;
    type: string;
    side: string;
    amount: number;
    price: number;
  }): Promise<number | null> {
    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.order_id || null;
    } catch (error) {
      console.error('Error creating trading order:', error);
      return null;
    }
  }

  // Market data operations
  async getMarketData(symbol: string): Promise<MarketData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/market-data/${symbol}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.market_data || null;
    } catch (error) {
      console.error('Error fetching market data:', error);
      return null;
    }
  }

  async updateMarketData(marketData: {
    symbol: string;
    price: number;
    change_24h?: number;
    volume_24h?: number;
    high_24h?: number;
    low_24h?: number;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/market-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(marketData),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating market data:', error);
      return false;
    }
  }

  // Portfolio operations
  async getPortfolioBalances(walletId: number): Promise<Record<string, number>> {
    try {
      const response = await fetch(`${this.baseUrl}/wallets/${walletId}/balances`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.balances || {};
    } catch (error) {
      console.error('Error fetching portfolio balances:', error);
      return {};
    }
  }

  // Database statistics
  async getDatabaseStats(): Promise<DatabaseStats | null> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.stats || null;
    } catch (error) {
      console.error('Error fetching database stats:', error);
      return null;
    }
  }

  // Utility methods
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      return response.ok;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  async backupDatabase(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/backup`, {
        method: 'POST',
      });
      return response.ok;
    } catch (error) {
      console.error('Error backing up database:', error);
      return false;
    }
  }

  async restoreDatabase(backupData: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ backup_data: backupData }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error restoring database:', error);
      return false;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;
