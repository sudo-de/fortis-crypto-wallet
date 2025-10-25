import React, { useState } from 'react';
import Layout from '../components/Layout';
import LiveClock from '../components/LiveClock';

const Staking: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState('ADA');

  const stakingPools = [
    { symbol: 'ADA', name: 'Cardano', apy: 5.2, staked: 5000, rewards: 125, icon: '💎', color: 'from-green-500 to-teal-500' },
    { symbol: 'ETH', name: 'Ethereum 2.0', apy: 4.8, staked: 0, rewards: 0, icon: 'Ξ', color: 'from-blue-500 to-purple-500' },
    { symbol: 'SOL', name: 'Solana', apy: 7.1, staked: 0, rewards: 0, icon: '☀️', color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <Layout>
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Staking</h1>
              <div className="text-sm text-gray-600 dark:text-gray-400">Earn rewards by staking</div>
            </div>
            <div className="flex items-center space-x-4">
              <LiveClock />
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="crypto-card">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Staking Pools</h3>
                <div className="space-y-4">
                  {stakingPools.map((pool) => (
                    <div key={pool.symbol} className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12">
                            {pool.symbol === 'BTC' && <img src="/bitcoin-logo.svg" alt="Bitcoin" className="w-12 h-12 drop-shadow-sm" />}
                            {pool.symbol === 'ETH' && <img src="/ethereum-logo.svg" alt="Ethereum" className="w-12 h-12 drop-shadow-sm" />}
                            {pool.symbol === 'ADA' && <img src="/cardano-logo.svg" alt="Cardano" className="w-12 h-12 drop-shadow-sm" />}
                            {pool.symbol === 'SOL' && <img src="/solana-logo.svg" alt="Solana" className="w-12 h-12 drop-shadow-sm" />}
                            {pool.symbol === 'DOT' && <img src="/polkadot-logo.svg" alt="Polkadot" className="w-12 h-12 drop-shadow-sm" />}
                            {!['BTC', 'ETH', 'ADA', 'SOL', 'DOT'].includes(pool.symbol) && (
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${pool.color} flex items-center justify-center text-white text-xl font-bold`}>
                                {pool.icon}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{pool.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{pool.symbol} Staking Pool</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{pool.apy}% APY</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Annual Percentage Yield</p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Staked Amount</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{pool.staked.toLocaleString()} {pool.symbol}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Rewards</p>
                          <p className="text-lg font-semibold text-green-600">{pool.rewards.toLocaleString()} {pool.symbol}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button className="flex-1 crypto-button">
                          {pool.staked > 0 ? 'Manage Stake' : 'Start Staking'}
                        </button>
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="crypto-card">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Staking Rewards</h4>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">125 ADA</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Rewards Earned</p>
                </div>
              </div>

              <div className="crypto-card">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">How Staking Works</h4>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <p>• Lock your tokens to support the network</p>
                  <p>• Earn rewards automatically</p>
                  <p>• Help secure the blockchain</p>
                  <p>• Rewards compound over time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Staking;
