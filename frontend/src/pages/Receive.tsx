import React, { useState } from 'react';
import Layout from '../components/Layout';
import LiveClock from '../components/LiveClock';

const Receive: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  const assets = [
    { symbol: 'BTC', name: 'Bitcoin', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', icon: '₿', color: 'from-orange-500 to-yellow-500' },
    { symbol: 'ETH', name: 'Ethereum', address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', icon: 'Ξ', color: 'from-blue-500 to-purple-500' },
    { symbol: 'ADA', name: 'Cardano', address: 'addr1q9rl0...', icon: '💎', color: 'from-green-500 to-teal-500' },
    { symbol: 'SOL', name: 'Solana', address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', icon: '☀️', color: 'from-purple-500 to-pink-500' }
  ];

  const selectedAssetData = assets.find(asset => asset.symbol === selectedAsset);

  return (
    <Layout>
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Receive</h1>
              <div className="text-sm text-gray-600 dark:text-gray-400">Get your wallet address</div>
            </div>
            <div className="flex items-center space-x-4">
              <LiveClock />
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="crypto-card mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Select Asset</h3>
            <div className="grid grid-cols-2 gap-4">
              {assets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset.symbol)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedAsset === asset.symbol
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
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
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{asset.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{asset.symbol}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="crypto-card">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Your {selectedAssetData?.name} Address</h3>
            
            <div className="text-center space-y-6">
              <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">QR Code</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Wallet Address</p>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 text-sm bg-white dark:bg-gray-800 px-3 py-2 rounded border dark:border-gray-600 font-mono text-gray-900 dark:text-gray-100">
                    {selectedAssetData?.address}
                  </code>
                  <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    Copy
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount (Optional)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount to request"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Memo (Optional)</label>
                  <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="Add a note for this request"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                  <span className="font-medium text-yellow-900 dark:text-yellow-100">Important</span>
                </div>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Only send {selectedAsset} to this address. Sending other cryptocurrencies may result in permanent loss.
                </p>
              </div>

              <button className="w-full crypto-button">
                Share Address
              </button>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Receive;
