import React, { useState } from 'react';
import Layout from '../components/Layout';
import LiveClock from '../components/LiveClock';

const Send: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [fee, setFee] = useState('medium');
  const [step, setStep] = useState<'details' | 'review' | 'confirm'>('details');

  const assets = [
    { symbol: 'BTC', name: 'Bitcoin', balance: 2.5, value: 108125.00, icon: '₿', color: 'from-orange-500 to-yellow-500' },
    { symbol: 'ETH', name: 'Ethereum', balance: 15.8, value: 45000.00, icon: 'Ξ', color: 'from-blue-500 to-purple-500' },
    { symbol: 'ADA', name: 'Cardano', balance: 5000, value: 2250.00, icon: '💎', color: 'from-green-500 to-teal-500' },
    { symbol: 'SOL', name: 'Solana', balance: 25, value: 2500.00, icon: '☀️', color: 'from-purple-500 to-pink-500' }
  ];

  const selectedAssetData = assets.find(asset => asset.symbol === selectedAsset);
  const feeOptions = [
    { id: 'slow', label: 'Slow', time: '~30 min', cost: 0.5 },
    { id: 'medium', label: 'Medium', time: '~10 min', cost: 1.0 },
    { id: 'fast', label: 'Fast', time: '~5 min', cost: 2.0 }
  ];

  const handleSend = () => {
    // Handle send logic here
    console.log('Sending transaction...');
  };

  const formatAddress = (address: string) => {
    if (address.length > 20) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  return (
    <Layout>
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Send</h1>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Transfer your cryptocurrencies
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
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="crypto-card mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'details' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                  1
                </div>
                <span className={`text-sm font-medium ${step === 'details' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}>
                  Details
                </span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-4">
                <div className={`h-full transition-all duration-300 ${
                  step === 'review' || step === 'confirm' ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'review' ? 'bg-blue-500 text-white' : step === 'confirm' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  2
                </div>
                <span className={`text-sm font-medium ${step === 'review' || step === 'confirm' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}>
                  Review
                </span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-4">
                <div className={`h-full transition-all duration-300 ${
                  step === 'confirm' ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'confirm' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  3
                </div>
                <span className={`text-sm font-medium ${step === 'confirm' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}>
                  Confirm
                </span>
              </div>
            </div>
          </div>

          {/* Step 1: Details */}
          {step === 'details' && (
            <div className="crypto-card">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Transaction Details</h3>
              
              {/* Asset Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Asset</label>
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
                          <p className="text-sm text-gray-600 dark:text-gray-400">Balance: {asset.balance} {asset.symbol}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Address */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recipient Address</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter wallet address or scan QR code"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
                <div className="flex items-center space-x-2 mt-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    📷 Scan QR Code
                  </button>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    👥 Contacts
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button className="px-4 py-3 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors">
                    Max
                  </button>
                </div>
                {selectedAssetData && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ≈ ${(parseFloat(amount) * (selectedAssetData.value / selectedAssetData.balance)).toFixed(2)} USD
                  </p>
                )}
              </div>

              {/* Memo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Memo (Optional)</label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Add a note for this transaction"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Fee Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Transaction Fee</label>
                <div className="space-y-2">
                  {feeOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setFee(option.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all ${
                        fee === option.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{option.label}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{option.time}</p>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{option.cost} {selectedAsset}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep('review')}
                disabled={!recipient || !amount}
                className="w-full crypto-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Review
              </button>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 'review' && (
            <div className="crypto-card">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Review Transaction</h3>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Transaction Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Asset</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6">
                          {selectedAssetData?.symbol === 'BTC' && <img src="/bitcoin-logo.svg" alt="Bitcoin" className="w-6 h-6 drop-shadow-sm" />}
                          {selectedAssetData?.symbol === 'ETH' && <img src="/ethereum-logo.svg" alt="Ethereum" className="w-6 h-6 drop-shadow-sm" />}
                          {selectedAssetData?.symbol === 'ADA' && <img src="/cardano-logo.svg" alt="Cardano" className="w-6 h-6 drop-shadow-sm" />}
                          {selectedAssetData?.symbol === 'SOL' && <img src="/solana-logo.svg" alt="Solana" className="w-6 h-6 drop-shadow-sm" />}
                          {selectedAssetData?.symbol === 'DOT' && <img src="/polkadot-logo.svg" alt="Polkadot" className="w-6 h-6 drop-shadow-sm" />}
                          {selectedAssetData && !['BTC', 'ETH', 'ADA', 'SOL', 'DOT'].includes(selectedAssetData.symbol) && (
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${selectedAssetData.color} flex items-center justify-center text-white text-xs font-bold`}>
                              {selectedAssetData.icon}
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{selectedAssetData?.name} ({selectedAsset})</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-medium">{amount} {selectedAsset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recipient</span>
                      <span className="font-mono text-sm">{formatAddress(recipient)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fee</span>
                      <span className="font-medium">{feeOptions.find(f => f.id === fee)?.cost} {selectedAsset}</span>
                    </div>
                    {memo && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Memo</span>
                        <span className="font-medium">{memo}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-blue-600">⚠️</span>
                    <span className="font-medium text-blue-900">Important</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    Please double-check the recipient address. Cryptocurrency transactions cannot be reversed.
                  </p>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setStep('details')}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  className="flex-1 crypto-button"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div className="crypto-card">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Confirm Transaction</h3>
              
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🔐</span>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Enter your password to confirm</h4>
                  <p className="text-gray-600">This will authorize the transaction</p>
                </div>

                <div className="max-w-sm mx-auto">
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-red-600">🚨</span>
                    <span className="font-medium text-red-900">Final Warning</span>
                  </div>
                  <p className="text-sm text-red-800">
                    This transaction will send {amount} {selectedAsset} to {formatAddress(recipient)}. 
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setStep('review')}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSend}
                  className="flex-1 crypto-button"
                >
                  Send Transaction
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default Send;
