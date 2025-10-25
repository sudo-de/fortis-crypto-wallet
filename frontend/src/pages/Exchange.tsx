import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LiveClock from '../components/LiveClock';
import PriceChart from '../components/PriceChart';

const Exchange: React.FC = () => {
  const [fromAsset, setFromAsset] = useState('BTC');
  const [toAsset, setToAsset] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [assets, setAssets] = useState([
    { symbol: 'BTC', name: 'Bitcoin', balance: 2.5, price: 43250, change24h: 2.5, icon: '₿', color: 'from-orange-500 to-yellow-500' },
    { symbol: 'ETH', name: 'Ethereum', balance: 15.8, price: 2850, change24h: 1.8, icon: 'Ξ', color: 'from-blue-500 to-purple-500' },
    { symbol: 'ADA', name: 'Cardano', balance: 5000, price: 0.45, change24h: -0.5, icon: '💎', color: 'from-green-500 to-teal-500' },
    { symbol: 'SOL', name: 'Solana', balance: 25, price: 100, change24h: 3.2, icon: '☀️', color: 'from-purple-500 to-pink-500' }
  ]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [chartData, setChartData] = useState<Array<{timestamp: number, price: number}>>([]);

  const fromAssetData = assets.find(asset => asset.symbol === fromAsset);
  const toAssetData = assets.find(asset => asset.symbol === toAsset);

  // Generate initial chart data
  useEffect(() => {
    const generateChartData = () => {
      const data = [];
      const now = Date.now();
      const basePrice = fromAssetData?.price || 43250;
      
      for (let i = 24; i >= 0; i--) {
        const timestamp = now - (i * 60 * 60 * 1000); // Hourly data for 24 hours
        const price = basePrice * (1 + (Math.random() - 0.5) * 0.1); // ±5% variation
        data.push({ timestamp, price });
      }
      setChartData(data);
    };

    generateChartData();
  }, [fromAsset]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prevAssets => 
        prevAssets.map(asset => ({
          ...asset,
          price: asset.price * (1 + (Math.random() - 0.5) * 0.02), // ±1% price fluctuation
          change24h: asset.change24h + (Math.random() - 0.5) * 0.1 // Small change in 24h change
        }))
      );

      // Update chart data
      setChartData(prevData => {
        const newData = [...prevData];
        const newPrice = fromAssetData?.price * (1 + (Math.random() - 0.5) * 0.02);
        newData.push({ timestamp: Date.now(), price: newPrice });
        return newData.slice(-25); // Keep last 25 data points
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [fromAssetData]);

  const placeOrder = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      alert('Please enter a valid limit price');
      return;
    }

    setIsPlacingOrder(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock order placement
      const orderData = {
        wallet_name: 'default',
        pair: `${fromAsset}/${toAsset}`,
        type: orderType,
        side: 'buy', // Simplified for demo
        amount: parseFloat(amount),
        price: orderType === 'limit' ? parseFloat(limitPrice) : fromAssetData?.price
      };

      console.log('Order placed:', orderData);
      setOrderSuccess(true);
      
      // Reset form
      setAmount('');
      setLimitPrice('');
      
      // Hide success message after 3 seconds
      setTimeout(() => setOrderSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const calculateEstimatedAmount = () => {
    if (!amount || !fromAssetData || !toAssetData) return 0;
    const fromAmount = parseFloat(amount);
    const fromPrice = fromAssetData.price;
    const toPrice = toAssetData.price;
    return (fromAmount * fromPrice) / toPrice;
  };

  return (
    <Layout>
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Exchange</h1>
              <div className="text-sm text-gray-600 dark:text-gray-400">Trade cryptocurrencies</div>
            </div>
            <div className="flex items-center space-x-4">
              <LiveClock />
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Price Chart */}
              <div className="crypto-card mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Price Chart</h3>
                <PriceChart 
                  symbol={fromAsset} 
                  data={chartData} 
                  height={300}
                  showGrid={true}
                />
              </div>

              <div className="crypto-card">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Place Order</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Order Type</label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setOrderType('market')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          orderType === 'market' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Market Order
                      </button>
                      <button
                        onClick={() => setOrderType('limit')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          orderType === 'limit' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Limit Order
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From</label>
                      <select
                        value={fromAsset}
                        onChange={(e) => setFromAsset(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        {assets.map(asset => (
                          <option key={asset.symbol} value={asset.symbol}>{asset.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To</label>
                      <select
                        value={toAsset}
                        onChange={(e) => setToAsset(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        {assets.filter(asset => asset.symbol !== fromAsset).map(asset => (
                          <option key={asset.symbol} value={asset.symbol}>{asset.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Balance: {fromAssetData?.balance} {fromAsset}
                    </p>
                    {amount && calculateEstimatedAmount() > 0 && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        ≈ {calculateEstimatedAmount().toFixed(6)} {toAsset}
                      </p>
                    )}
                  </div>

                  {orderType === 'limit' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Limit Price</label>
                      <input
                        type="number"
                        value={limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                  )}

                  <button 
                    onClick={placeOrder}
                    disabled={isPlacingOrder}
                    className="w-full crypto-button disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                  </button>
                  
                  {orderSuccess && (
                    <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            Order placed successfully!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="crypto-card">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Market Prices</h4>
                <div className="space-y-3">
                  {assets.map(asset => (
                    <div key={asset.symbol} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8">
                          {asset.symbol === 'BTC' && <img src="/bitcoin-logo.svg" alt="Bitcoin" className="w-8 h-8 drop-shadow-sm" />}
                          {asset.symbol === 'ETH' && <img src="/ethereum-logo.svg" alt="Ethereum" className="w-8 h-8 drop-shadow-sm" />}
                          {asset.symbol === 'ADA' && <img src="/cardano-logo.svg" alt="Cardano" className="w-8 h-8 drop-shadow-sm" />}
                          {asset.symbol === 'SOL' && <img src="/solana-logo.svg" alt="Solana" className="w-8 h-8 drop-shadow-sm" />}
                          {asset.symbol === 'DOT' && <img src="/polkadot-logo.svg" alt="Polkadot" className="w-8 h-8 drop-shadow-sm" />}
                          {!['BTC', 'ETH', 'ADA', 'SOL', 'DOT'].includes(asset.symbol) && (
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${asset.color} flex items-center justify-center text-white text-sm font-bold`}>
                              {asset.icon}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{asset.symbol}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{asset.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">${asset.price.toLocaleString()}</p>
                        <p className={`text-sm ${asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="crypto-card">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Trades</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">BTC → ETH</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">2 hours ago</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">+5.2%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">ADA → SOL</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">4 hours ago</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">-1.8%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Exchange;
