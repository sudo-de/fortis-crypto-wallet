import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LiveClock from '../components/LiveClock';
import { authService } from '../services/authService';

const Dashboard: React.FC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <Layout>
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LiveClock />
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                    alt="User"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sudo De</span>
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span>👤</span>
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span>⚙️</span>
                      <span>Settings</span>
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                    >
                      <span>🚪</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="crypto-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Portfolio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$127,432.50</p>
                <p className="text-sm text-green-600">+12.5% (24h)</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          <div className="crypto-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bitcoin</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$43,250.00</p>
                <p className="text-sm text-green-600">+8.2% (24h)</p>
              </div>
              <div className="w-8 h-8">
                <img 
                  src="/bitcoin-logo.svg" 
                  alt="Bitcoin" 
                  className="w-8 h-8 drop-shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="crypto-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ethereum</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">$2,850.75</p>
                <p className="text-sm text-red-600">-2.1% (24h)</p>
              </div>
              <div className="w-8 h-8">
                <img 
                  src="/ethereum-logo.svg" 
                  alt="Ethereum" 
                  className="w-8 h-8 drop-shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="crypto-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Trades</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">24</p>
                <p className="text-sm text-blue-600">3 pending</p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </div>
        </div>

        {/* Charts and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Portfolio Chart */}
          <div className="crypto-card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Portfolio Performance</h3>
            <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-600 dark:text-gray-300">Chart visualization would go here</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">+15.3% this month</p>
              </div>
            </div>
          </div>

          {/* Market Overview */}
          <div className="crypto-card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Market Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6">
                    <img 
                      src="/bitcoin-logo.svg" 
                      alt="Bitcoin" 
                      className="w-6 h-6 drop-shadow-sm"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Bitcoin</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">BTC</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">$43,250</p>
                  <p className="text-sm text-green-600">+8.2%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6">
                    <img 
                      src="/ethereum-logo.svg" 
                      alt="Ethereum" 
                      className="w-6 h-6 drop-shadow-sm"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Ethereum</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">ETH</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">$2,850</p>
                  <p className="text-sm text-red-600">-2.1%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6">
                    <img 
                      src="/cardano-logo.svg" 
                      alt="Cardano" 
                      className="w-6 h-6 drop-shadow-sm"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Cardano</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">ADA</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">$0.45</p>
                  <p className="text-sm text-green-600">+5.7%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="crypto-card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Asset</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Value</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      Buy
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Bitcoin</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">0.25 BTC</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">$10,812.50</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      Completed
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">2 hours ago</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                      Sell
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Ethereum</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">2.5 ETH</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">$7,126.88</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                      Pending
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">5 hours ago</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      Transfer
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Cardano</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">1,000 ADA</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">$450.00</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      Completed
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">1 day ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="crypto-button">
              <div className="flex items-center justify-center space-x-2">
                <span>💸</span>
                <span>Buy Crypto</span>
              </div>
            </button>
            <button className="crypto-button">
              <div className="flex items-center justify-center space-x-2">
                <span>📤</span>
                <span>Send</span>
              </div>
            </button>
            <button className="crypto-button">
              <div className="flex items-center justify-center space-x-2">
                <span>📥</span>
                <span>Receive</span>
              </div>
            </button>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Dashboard;
