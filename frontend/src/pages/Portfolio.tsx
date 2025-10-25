import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LiveClock from '../components/LiveClock';
import PortfolioChart from '../components/PortfolioChart';

const Portfolio: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1D' | '7D' | '1M' | '3M' | '1Y' | 'ALL'>('1M');
  const [isLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState([
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      amount: 2.5,
      value: 108125.00,
      change24h: 8.2,
      change24hValue: 8200.00,
      percentage: 45.2,
      icon: '₿',
      color: 'from-orange-500 to-yellow-500'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      amount: 15.8,
      value: 45000.00,
      change24h: -2.1,
      change24hValue: -945.00,
      percentage: 18.8,
      icon: 'Ξ',
      color: 'from-blue-500 to-purple-500'
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      amount: 5000,
      value: 2250.00,
      change24h: 5.7,
      change24hValue: 120.00,
      percentage: 8.9,
      icon: '💎',
      color: 'from-green-500 to-teal-500'
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      amount: 25,
      value: 2500.00,
      change24h: 12.3,
      change24hValue: 275.00,
      percentage: 9.8,
      icon: '☀️',
      color: 'from-purple-500 to-pink-500'
    }
  ]);
  const [totalValue, setTotalValue] = useState(239375.00);
  const [totalChange24h, setTotalChange24h] = useState(7650.00);
  const [totalChangePercent, setTotalChangePercent] = useState(3.2);
  const [chartData, setChartData] = useState<Array<{timestamp: number, value: number, change: number}>>([]);

  // Generate initial chart data
  useEffect(() => {
    const generateChartData = () => {
      const data = [];
      const now = Date.now();
      const baseValue = totalValue;
      const days = timeRange === '1D' ? 1 : timeRange === '7D' ? 7 : timeRange === '1M' ? 30 : timeRange === '3M' ? 90 : timeRange === '1Y' ? 365 : 365;
      const interval = timeRange === '1D' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 1 hour for 1D, 1 day for others
      
      for (let i = days; i >= 0; i--) {
        const timestamp = now - (i * interval);
        const randomChange = (Math.random() - 0.5) * 0.1; // ±5% daily change
        const value = baseValue * (1 + randomChange * (days - i) / days);
        const change = i === days ? 0 : randomChange * 100;
        
        data.push({ timestamp, value, change });
      }
      setChartData(data);
    };

    generateChartData();
  }, [timeRange, totalValue]);

  // Simulate real-time portfolio updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolioData(prevData => 
        prevData.map(asset => {
          const priceChange = (Math.random() - 0.5) * 0.02; // ±1% price change
          const newValue = asset.value * (1 + priceChange);
          const newChange24h = asset.change24h + (Math.random() - 0.5) * 0.1;
          const newChange24hValue = asset.change24hValue + (Math.random() - 0.5) * 100;
          
          return {
            ...asset,
            value: newValue,
            change24h: newChange24h,
            change24hValue: newChange24hValue
          };
        })
      );
      
      // Update total values based on portfolio data
      setTotalValue(prev => {
        const newValue = prev * (1 + (Math.random() - 0.5) * 0.01);
        return Math.max(newValue, 0); // Ensure non-negative
      });
      setTotalChange24h(prev => prev + (Math.random() - 0.5) * 500);
      setTotalChangePercent(prev => {
        const newPercent = prev + (Math.random() - 0.5) * 0.1;
        return Math.max(newPercent, -100); // Cap at -100%
      });

      // Update chart data with new point
      setChartData(prevData => {
        const newData = [...prevData];
        const lastValue = newData[newData.length - 1]?.value || totalValue;
        const newValue = lastValue * (1 + (Math.random() - 0.5) * 0.02);
        const change = ((newValue - lastValue) / lastValue) * 100;
        
        newData.push({
          timestamp: Date.now(),
          value: newValue,
          change: change
        });
        
        // Keep only last 30 data points for performance
        return newData.slice(-30);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Calculate portfolio totals from current data
  const calculatedTotalValue = portfolioData.reduce((sum, asset) => sum + (asset.value || 0), 0);
  const calculatedTotalChange24h = portfolioData.reduce((sum, asset) => sum + (asset.change24hValue || 0), 0);
  const calculatedTotalChangePercentage = calculatedTotalValue > 0 ? (calculatedTotalChange24h / (calculatedTotalValue - calculatedTotalChange24h)) * 100 : 0;

  // Handle loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading portfolio...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Portfolio</h1>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Value: ${totalValue.toLocaleString()}
                <span className={`ml-2 ${totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Time Range:</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="1D">1 Day</option>
                  <option value="7D">7 Days</option>
                  <option value="1M">1 Month</option>
                  <option value="3M">3 Months</option>
                  <option value="1Y">1 Year</option>
                  <option value="ALL">All Time</option>
                </select>
                <button
                  onClick={() => {
                    // Trigger chart data regeneration
                    const data = [];
                    const now = Date.now();
                    const baseValue = totalValue;
                    const days = timeRange === '1D' ? 1 : timeRange === '7D' ? 7 : timeRange === '1M' ? 30 : timeRange === '3M' ? 90 : timeRange === '1Y' ? 365 : 365;
                    const interval = timeRange === '1D' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
                    
                    for (let i = days; i >= 0; i--) {
                      const timestamp = now - (i * interval);
                      const randomChange = (Math.random() - 0.5) * 0.1;
                      const value = baseValue * (1 + randomChange * (days - i) / days);
                      const change = i === days ? 0 : randomChange * 100;
                      data.push({ timestamp, value, change });
                    }
                    setChartData(data);
                  }}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  🔄 Refresh
                </button>
              </div>
              <LiveClock />
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Total Portfolio Value */}
          <div className="lg:col-span-2">
            <div className="crypto-card">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Portfolio Overview</h3>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">${totalValue.toLocaleString()}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-sm font-medium ${totalChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalChange24h >= 0 ? '+' : ''}${totalChange24h.toLocaleString()}
                    </span>
                    <span className={`text-sm ${calculatedTotalChangePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ({calculatedTotalChangePercentage >= 0 ? '+' : ''}{calculatedTotalChangePercentage.toFixed(2)}%)
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">24h</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
              </div>
              
              {/* Portfolio Performance Chart */}
              <PortfolioChart 
                data={chartData}
                height={300}
                showGrid={true}
                timeRange={timeRange}
              />
              
              {/* P&L Tracking Section */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total P&L</p>
                      <p className="text-2xl font-bold">+$12,450.30</p>
                    </div>
                    <div className="text-3xl">💰</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Best Performer</p>
                      <p className="text-lg font-bold">SOL +12.3%</p>
                    </div>
                    <div className="text-3xl">🚀</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Worst Performer</p>
                      <p className="text-lg font-bold">ETH -2.1%</p>
                    </div>
                    <div className="text-3xl">📉</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="crypto-card">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Stats</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Assets</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{portfolioData.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Best Performer</span>
                  <span className="font-semibold text-green-600">SOL +12.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Worst Performer</span>
                  <span className="font-semibold text-red-600">ETH -2.1%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Diversification</span>
                  <span className="font-semibold text-blue-600">Good</span>
                </div>
              </div>
            </div>

            <div className="crypto-card">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Allocation</h4>
              <div className="space-y-3">
                {portfolioData.map((asset) => (
                  <div key={asset.symbol} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {asset.symbol === 'BTC' && <img src="/bitcoin-logo.svg" alt="Bitcoin" className="w-5 h-5 drop-shadow-sm" />}
                      {asset.symbol === 'ETH' && <img src="/ethereum-logo.svg" alt="Ethereum" className="w-5 h-5 drop-shadow-sm" />}
                      {asset.symbol === 'ADA' && <img src="/cardano-logo.svg" alt="Cardano" className="w-5 h-5 drop-shadow-sm" />}
                      {asset.symbol === 'SOL' && <img src="/solana-logo.svg" alt="Solana" className="w-5 h-5 drop-shadow-sm" />}
                      {asset.symbol === 'DOT' && <img src="/polkadot-logo.svg" alt="Polkadot" className="w-5 h-5 drop-shadow-sm" />}
                      {!['BTC', 'ETH', 'ADA', 'SOL', 'DOT'].includes(asset.symbol) && <span className="text-lg">{asset.icon}</span>}
                      <span className="text-sm font-medium">{asset.symbol}</span>
                    </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{asset.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Assets List */}
        <div className="crypto-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Your Assets</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                Add Asset
              </button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Sort
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Asset</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Value</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">24h Change</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Allocation</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {portfolioData.map((asset) => (
                  <tr key={asset.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10">
                          {asset.symbol === 'BTC' && <img src="/bitcoin-logo.svg" alt="Bitcoin" className="w-10 h-10 drop-shadow-sm" />}
                          {asset.symbol === 'ETH' && <img src="/ethereum-logo.svg" alt="Ethereum" className="w-10 h-10 drop-shadow-sm" />}
                          {asset.symbol === 'ADA' && <img src="/cardano-logo.svg" alt="Cardano" className="w-10 h-10 drop-shadow-sm" />}
                          {asset.symbol === 'SOL' && <img src="/solana-logo.svg" alt="Solana" className="w-10 h-10 drop-shadow-sm" />}
                          {asset.symbol === 'DOT' && <img src="/polkadot-logo.svg" alt="Polkadot" className="w-10 h-10 drop-shadow-sm" />}
                          {!['BTC', 'ETH', 'ADA', 'SOL', 'DOT'].includes(asset.symbol) && (
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${asset.color} flex items-center justify-center text-white font-bold`}>
                              {asset.icon}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{asset.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{asset.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{(asset.amount || 0).toLocaleString()}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900 dark:text-gray-100">${(asset.value || 0).toLocaleString()}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1">
                        <span className={`text-sm font-medium ${(asset.change24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(asset.change24h || 0) >= 0 ? '+' : ''}{asset.change24h || 0}%
                        </span>
                        <span className={`text-xs ${(asset.change24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ({(asset.change24h || 0) >= 0 ? '+' : ''}${(asset.change24hValue || 0).toLocaleString()})
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${asset.color}`}
                            style={{ width: `${Math.min(Math.max(asset.percentage || 0, 0), 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{(asset.percentage || 0).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Trade
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="crypto-card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">📈</span>
                  </div>
                  <div>
                    <p className="font-medium">Bitcoin purchase</p>
                    <p className="text-sm text-gray-600">0.25 BTC • 2 hours ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">+$10,812.50</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">🔄</span>
                  </div>
                  <div>
                    <p className="font-medium">Ethereum trade</p>
                    <p className="text-sm text-gray-600">2.5 ETH → USDC • 5 hours ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-blue-600">+$7,126.88</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">💎</span>
                  </div>
                  <div>
                    <p className="font-medium">Cardano staking reward</p>
                    <p className="text-sm text-gray-600">Staking reward received • 1 day ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-purple-600">+$45.20</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Portfolio;
