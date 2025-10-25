import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LiveClock from '../components/LiveClock';

interface Order {
  order_id: string;
  pair: string;
  type: 'market' | 'limit';
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  filled_amount: number;
  remaining_amount: number;
  status: 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected';
  created_at: number;
  updated_at: number;
}

interface MarketData {
  symbol: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  high_24h: number;
  low_24h: number;
  timestamp: number;
}

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

interface OrderBook {
  pair: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: number;
}

const Trading: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'orderbook' | 'portfolio'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [loading, setLoading] = useState(false);

  const tradingPairs = [
    { symbol: 'BTC/USDT', base: 'BTC', quote: 'USDT' },
    { symbol: 'ETH/USDT', base: 'ETH', quote: 'USDT' },
    { symbol: 'ADA/USDT', base: 'ADA', quote: 'USDT' },
    { symbol: 'SOL/USDT', base: 'SOL', quote: 'USDT' }
  ];

  useEffect(() => {
    fetchOrders();
    fetchMarketData();
    fetchOrderBook();
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchOrders();
      fetchMarketData();
      fetchOrderBook();
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedPair]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Mock data for now - in real implementation, call backend API
      const mockOrders: Order[] = [
        {
          order_id: 'ORD123456',
          pair: 'BTC/USDT',
          type: 'limit',
          side: 'buy',
          amount: 0.5,
          price: 42000,
          filled_amount: 0.2,
          remaining_amount: 0.3,
          status: 'partially_filled',
          created_at: Date.now() - 3600000,
          updated_at: Date.now() - 1800000
        },
        {
          order_id: 'ORD123457',
          pair: 'ETH/USDT',
          type: 'market',
          side: 'sell',
          amount: 2.0,
          price: 2800,
          filled_amount: 2.0,
          remaining_amount: 0,
          status: 'filled',
          created_at: Date.now() - 7200000,
          updated_at: Date.now() - 7200000
        }
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketData = async () => {
    try {
      // Mock data for now
      const mockMarketData: MarketData[] = [
        { symbol: 'BTC', price: 43250, change_24h: 2.5, volume_24h: 1500000000, high_24h: 44500, low_24h: 42000, timestamp: Date.now() },
        { symbol: 'ETH', price: 2850, change_24h: 1.8, volume_24h: 800000000, high_24h: 2950, low_24h: 2750, timestamp: Date.now() },
        { symbol: 'ADA', price: 0.45, change_24h: -0.5, volume_24h: 50000000, high_24h: 0.48, low_24h: 0.42, timestamp: Date.now() },
        { symbol: 'SOL', price: 100, change_24h: 3.2, volume_24h: 200000000, high_24h: 105, low_24h: 95, timestamp: Date.now() }
      ];
      setMarketData(mockMarketData);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  const fetchOrderBook = async () => {
    try {
      // Mock order book data
      const mockOrderBook: OrderBook = {
        pair: selectedPair,
        bids: [
          { price: 43200, amount: 0.5, total: 21600 },
          { price: 43150, amount: 1.2, total: 51780 },
          { price: 43100, amount: 0.8, total: 34480 },
          { price: 43050, amount: 2.1, total: 90405 },
          { price: 43000, amount: 1.5, total: 64500 }
        ],
        asks: [
          { price: 43250, amount: 0.3, total: 12975 },
          { price: 43300, amount: 0.9, total: 38970 },
          { price: 43350, amount: 1.1, total: 47685 },
          { price: 43400, amount: 0.7, total: 30380 },
          { price: 43450, amount: 1.8, total: 78210 }
        ],
        timestamp: Date.now()
      };
      setOrderBook(mockOrderBook);
    } catch (error) {
      console.error('Error fetching order book:', error);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      setLoading(true);
      // Mock cancellation - in real implementation, call backend API
      setOrders(orders.filter(order => order.order_id !== orderId));
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled': return 'text-green-600 bg-green-100';
      case 'partially_filled': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSideColor = (side: string) => {
    return side === 'buy' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Layout>
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Trading</h1>
              <div className="text-sm text-gray-600 dark:text-gray-400">Trading interface</div>
            </div>
            <div className="flex items-center space-x-4">
              <LiveClock />
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Trading Pairs Selector */}
          <div className="mb-6">
            <div className="flex space-x-2">
              {tradingPairs.map(pair => (
                <button
                  key={pair.symbol}
                  onClick={() => setSelectedPair(pair.symbol)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPair === pair.symbol
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {pair.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Market Data Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {marketData.map(asset => (
              <div key={asset.symbol} className="crypto-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{asset.symbol}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      ${asset.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${asset.change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {asset.change_24h >= 0 ? '+' : ''}{asset.change_24h.toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Vol: ${(asset.volume_24h / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trading Interface Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'orders', name: 'Orders', count: orders.length },
                  { id: 'orderbook', name: 'Order Book', count: null },
                  { id: 'portfolio', name: 'Portfolio', count: null }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                    {tab.count !== null && (
                      <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="crypto-card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Order History</h3>
                <button
                  onClick={fetchOrders}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Pair
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Side
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Filled
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {orders.map(order => (
                      <tr key={order.order_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-100">
                          {order.order_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {order.pair}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {order.type}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getSideColor(order.side)}`}>
                          {order.side.toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {order.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          ${order.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {order.filled_amount} / {order.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => cancelOrder(order.order_id)}
                              className="text-red-600 hover:text-red-900 font-medium"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Order Book Tab */}
          {activeTab === 'orderbook' && orderBook && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="crypto-card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Buy Orders</h3>
                <div className="space-y-2">
                  {orderBook.bids.map((bid, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <span className="text-green-600 font-medium">${bid.price.toLocaleString()}</span>
                      <span className="text-gray-900 dark:text-gray-100">{bid.amount}</span>
                      <span className="text-gray-600 dark:text-gray-400">${bid.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="crypto-card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Sell Orders</h3>
                <div className="space-y-2">
                  {orderBook.asks.map((ask, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                      <span className="text-red-600 font-medium">${ask.price.toLocaleString()}</span>
                      <span className="text-gray-900 dark:text-gray-100">{ask.amount}</span>
                      <span className="text-gray-600 dark:text-gray-400">${ask.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="crypto-card">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Portfolio Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg text-white">
                  <h4 className="text-lg font-semibold mb-2">Total Value</h4>
                  <p className="text-3xl font-bold">$125,430.50</p>
                  <p className="text-blue-100">+5.2% (24h)</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 rounded-lg text-white">
                  <h4 className="text-lg font-semibold mb-2">P&L (24h)</h4>
                  <p className="text-3xl font-bold">+$6,250.30</p>
                  <p className="text-green-100">+5.2%</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-lg text-white">
                  <h4 className="text-lg font-semibold mb-2">Active Orders</h4>
                  <p className="text-3xl font-bold">{orders.filter(o => o.status === 'pending').length}</p>
                  <p className="text-purple-100">Pending</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default Trading;
