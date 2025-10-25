import React, { useState } from 'react';
import Layout from '../components/Layout';
import LiveClock from '../components/LiveClock';

const Wallet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'addresses' | 'backup' | 'recovery'>('overview');

  const wallets = [
    {
      id: 'main',
      name: 'Main Wallet',
      type: 'HD Wallet',
      balance: 127432.50,
      currency: 'USD',
      addresses: 5,
      lastUsed: '2 hours ago',
      status: 'active',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'trading',
      name: 'Trading Wallet',
      type: 'Hot Wallet',
      balance: 25000.00,
      currency: 'USD',
      addresses: 2,
      lastUsed: '1 day ago',
      status: 'active',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'savings',
      name: 'Savings Wallet',
      type: 'Cold Storage',
      balance: 50000.00,
      currency: 'USD',
      addresses: 1,
      lastUsed: '1 week ago',
      status: 'inactive',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const addresses = [
    {
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      label: 'Main Address',
      balance: 2.5,
      currency: 'BTC',
      lastUsed: '2 hours ago',
      type: 'Bitcoin'
    },
    {
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      label: 'Ethereum Address',
      balance: 15.8,
      currency: 'ETH',
      lastUsed: '1 day ago',
      type: 'Ethereum'
    },
    {
      address: 'addr1q9rl0...',
      label: 'Cardano Address',
      balance: 5000,
      currency: 'ADA',
      lastUsed: '3 days ago',
      type: 'Cardano'
    }
  ];

  return (
    <Layout>
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Wallet</h1>
              <div className="text-sm text-gray-600 dark:text-gray-400">Manage your wallets</div>
            </div>
            <div className="flex items-center space-x-4">
              <LiveClock />
              <button className="crypto-button">
                Create New Wallet
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="crypto-card mb-8">
            <div className="flex space-x-6">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'addresses', label: 'Addresses', icon: '📍' },
                { id: 'backup', label: 'Backup', icon: '💾' },
                { id: 'recovery', label: 'Recovery', icon: '🔑' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Wallet Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wallets.map((wallet) => (
                  <div key={wallet.id} className="crypto-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${wallet.color} flex items-center justify-center text-white text-xl font-bold`}>
                          💼
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{wallet.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{wallet.type}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        wallet.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {wallet.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Balance</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">${wallet.balance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Addresses</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{wallet.addresses}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Last Used</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{wallet.lastUsed}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Manage
                      </button>
                      <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                        Settings
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="crypto-card">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center">
                    <div className="text-2xl mb-2">➕</div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Create Wallet</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Add new wallet</p>
                  </button>
                  <button className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center">
                    <div className="text-2xl mb-2">🔄</div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Import Wallet</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Import existing</p>
                  </button>
                  <button className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center">
                    <div className="text-2xl mb-2">💾</div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Backup Wallet</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Export keys</p>
                  </button>
                  <button className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center">
                    <div className="text-2xl mb-2">🔑</div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Recovery</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Restore wallet</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="crypto-card">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Wallet Addresses</h3>
                <button className="crypto-button">
                  Generate New Address
                </button>
              </div>
              
              <div className="space-y-4">
                {addresses.map((addr, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          {addr.type === 'Bitcoin' && <img src="/bitcoin-logo.svg" alt="Bitcoin" className="w-6 h-6 drop-shadow-sm" />}
                          {addr.type === 'Ethereum' && <img src="/ethereum-logo.svg" alt="Ethereum" className="w-6 h-6 drop-shadow-sm" />}
                          {addr.type === 'Cardano' && <img src="/cardano-logo.svg" alt="Cardano" className="w-6 h-6 drop-shadow-sm" />}
                          {addr.type === 'Solana' && <img src="/solana-logo.svg" alt="Solana" className="w-6 h-6 drop-shadow-sm" />}
                          {addr.type === 'Polkadot' && <img src="/polkadot-logo.svg" alt="Polkadot" className="w-6 h-6 drop-shadow-sm" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{addr.label}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{addr.address}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Last used: {addr.lastUsed}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{addr.balance} {addr.currency}</p>
                        <div className="flex space-x-2 mt-2">
                          <button className="px-3 py-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                            Copy
                          </button>
                          <button className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 text-sm font-medium">
                            QR
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Backup Tab */}
          {activeTab === 'backup' && (
            <div className="crypto-card">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Wallet Backup</h3>
              
              <div className="space-y-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-yellow-600">⚠️</span>
                    <span className="font-medium text-yellow-900 dark:text-yellow-300">Important</span>
                  </div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    Always backup your wallet before making any changes. Store your backup in a secure location.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">🔑</span>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recovery Phrase</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Your 12-word recovery phrase is the most important backup. Write it down and store it safely.
                    </p>
                    <button className="w-full crypto-button">
                      Show Recovery Phrase
                    </button>
                  </div>

                  <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">📄</span>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Export Keys</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Export your private keys for advanced users. Keep them secure and never share them.
                    </p>
                    <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      Export Private Keys
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recovery Tab */}
          {activeTab === 'recovery' && (
            <div className="crypto-card">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Wallet Recovery</h3>
              
              <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-red-600">🚨</span>
                    <span className="font-medium text-red-900 dark:text-red-300">Warning</span>
                  </div>
                  <p className="text-sm text-red-800 dark:text-red-300">
                    Only use this if you've lost access to your wallet. This will create a new wallet from your recovery phrase.
                  </p>
                </div>

                <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recover Wallet</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recovery Phrase</label>
                      <textarea
                        placeholder="Enter your 12-word recovery phrase..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <button className="w-full crypto-button">
                      Recover Wallet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default Wallet;
