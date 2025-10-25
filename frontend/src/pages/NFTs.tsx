import React, { useState } from 'react';
import Layout from '../components/Layout';
import LiveClock from '../components/LiveClock';

const NFTs: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'owned' | 'created'>('all');

  const nfts = [
    { id: 1, name: 'Crypto Punk #1234', collection: 'CryptoPunks', price: 45.2, image: '🎨', status: 'owned' },
    { id: 2, name: 'Bored Ape #5678', collection: 'Bored Ape Yacht Club', price: 12.5, image: '🐵', status: 'owned' },
    { id: 3, name: 'Art Block #9999', collection: 'Art Blocks', price: 8.7, image: '🎭', status: 'created' }
  ];

  return (
    <Layout>
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">NFTs</h1>
              <div className="text-sm text-gray-600 dark:text-gray-400">Manage your digital collectibles</div>
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
          <div className="crypto-card mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Your NFT Collection</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('owned')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'owned' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Owned
                </button>
                <button
                  onClick={() => setFilter('created')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'created' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Created
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nfts.map((nft) => (
                <div key={nft.id} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                    <span className="text-6xl">{nft.image}</span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{nft.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{nft.collection}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{nft.price} ETH</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        nft.status === 'owned' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      }`}>
                        {nft.status === 'owned' ? 'Owned' : 'Created'}
                      </span>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        View
                      </button>
                      <button className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
                        Sell
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default NFTs;
