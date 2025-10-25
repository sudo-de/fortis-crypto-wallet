import React, { useState } from 'react';
import Layout from '../components/Layout';
import LiveClock from '../components/LiveClock';

const Transactions: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'sent' | 'received' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const transactions = [
    {
      id: 'tx_001',
      type: 'buy',
      asset: 'Bitcoin',
      symbol: 'BTC',
      amount: 0.25,
      value: 10812.50,
      status: 'completed',
      timestamp: '2024-01-15T14:30:00Z',
      hash: '0x1234...5678',
      fee: 15.50,
      icon: '₿',
      color: 'from-orange-500 to-yellow-500'
    },
    {
      id: 'tx_002',
      type: 'sell',
      asset: 'Ethereum',
      symbol: 'ETH',
      amount: 2.5,
      value: 7126.88,
      status: 'pending',
      timestamp: '2024-01-15T11:15:00Z',
      hash: '0xabcd...efgh',
      fee: 8.25,
      icon: 'Ξ',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'tx_003',
      type: 'transfer',
      asset: 'Cardano',
      symbol: 'ADA',
      amount: 1000,
      value: 450.00,
      status: 'completed',
      timestamp: '2024-01-14T16:45:00Z',
      hash: '0x9876...5432',
      fee: 0.17,
      icon: '💎',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'tx_004',
      type: 'buy',
      asset: 'Solana',
      symbol: 'SOL',
      amount: 10,
      value: 1000.00,
      status: 'completed',
      timestamp: '2024-01-14T09:20:00Z',
      hash: '0x1111...2222',
      fee: 2.50,
      icon: '☀️',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'tx_005',
      type: 'stake',
      asset: 'Cardano',
      symbol: 'ADA',
      amount: 5000,
      value: 2250.00,
      status: 'completed',
      timestamp: '2024-01-13T12:00:00Z',
      hash: '0x3333...4444',
      fee: 0.00,
      icon: '💎',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'tx_006',
      type: 'receive',
      asset: 'Bitcoin',
      symbol: 'BTC',
      amount: 0.1,
      value: 4325.00,
      status: 'completed',
      timestamp: '2024-01-12T18:30:00Z',
      hash: '0x5555...6666',
      fee: 0.00,
      icon: '₿',
      color: 'from-orange-500 to-yellow-500'
    }
  ];

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || 
      (filter === 'sent' && (tx.type === 'sell' || tx.type === 'transfer')) ||
      (filter === 'received' && tx.type === 'receive') ||
      (filter === 'pending' && tx.status === 'pending');
    
    const matchesSearch = searchTerm === '' || 
      tx.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.hash.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'buy': return 'bg-green-100 text-green-800';
      case 'sell': return 'bg-red-100 text-red-800';
      case 'transfer': return 'bg-blue-100 text-blue-800';
      case 'receive': return 'bg-purple-100 text-purple-800';
      case 'stake': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const txTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - txTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return txTime.toLocaleDateString();
  };

  return (
    <Layout>
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredTransactions.length} transactions
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LiveClock />
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="crypto-card mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('sent')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'sent' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Sent
              </button>
              <button
                onClick={() => setFilter('received')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'received' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Received
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'pending' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Pending
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <button className="crypto-button">
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="crypto-card">
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
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Hash</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(tx.type)}`}>
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8">
                          {tx.symbol === 'BTC' && <img src="/bitcoin-logo.svg" alt="Bitcoin" className="w-8 h-8 drop-shadow-sm" />}
                          {tx.symbol === 'ETH' && <img src="/ethereum-logo.svg" alt="Ethereum" className="w-8 h-8 drop-shadow-sm" />}
                          {tx.symbol === 'ADA' && <img src="/cardano-logo.svg" alt="Cardano" className="w-8 h-8 drop-shadow-sm" />}
                          {tx.symbol === 'SOL' && <img src="/solana-logo.svg" alt="Solana" className="w-8 h-8 drop-shadow-sm" />}
                          {tx.symbol === 'DOT' && <img src="/polkadot-logo.svg" alt="Polkadot" className="w-8 h-8 drop-shadow-sm" />}
                          {!['BTC', 'ETH', 'ADA', 'SOL', 'DOT'].includes(tx.symbol) && (
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${tx.color} flex items-center justify-center text-white text-sm font-bold`}>
                              {tx.icon}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{tx.asset}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{tx.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{tx.amount.toLocaleString()}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900 dark:text-gray-100">${tx.value.toLocaleString()}</p>
                      {tx.fee > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Fee: ${tx.fee}</p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900 dark:text-gray-100">{formatTimeAgo(tx.timestamp)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-gray-900 dark:text-gray-100">
                          {tx.hash}
                        </code>
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                          View
                        </button>
                        {tx.status === 'pending' && (
                          <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium">
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No transactions found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>

        {/* Transaction Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="crypto-card">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {transactions.filter(tx => tx.type === 'buy').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Purchases</div>
            </div>
          </div>
          <div className="crypto-card">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {transactions.filter(tx => tx.type === 'sell').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sales</div>
            </div>
          </div>
          <div className="crypto-card">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {transactions.filter(tx => tx.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
          </div>
          <div className="crypto-card">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                ${transactions.reduce((sum, tx) => sum + tx.value, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Volume</div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Transactions;
