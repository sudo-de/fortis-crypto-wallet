import React, { useState } from 'react';
import Layout from '../components/Layout';
import LiveClock from '../components/LiveClock';

const Help: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('faq');

  const faqs = [
    {
      category: 'getting-started',
      question: 'How do I create a new wallet?',
      answer: 'To create a new wallet, click on "Create Wallet" and follow the setup process. Make sure to securely store your recovery phrase.',
      helpful: 89
    },
    {
      category: 'getting-started',
      question: 'How do I import an existing wallet?',
      answer: 'Go to Settings > Import Wallet and enter your recovery phrase or private key. Make sure you\'re in a secure environment.',
      helpful: 76
    },
    {
      category: 'getting-started',
      question: 'What is a recovery phrase?',
      answer: 'A recovery phrase is a 12-24 word sequence that allows you to restore your wallet. Store it safely offline.',
      helpful: 92
    },
    {
      category: 'security',
      question: 'How do I enable two-factor authentication?',
      answer: 'Go to Settings > Security > Two-Factor Authentication and follow the setup process with your authenticator app.',
      helpful: 85
    },
    {
      category: 'security',
      question: 'How do I secure my private keys?',
      answer: 'Never share your private keys. Use hardware wallets for large amounts and enable all security features.',
      helpful: 94
    },
    {
      category: 'security',
      question: 'What should I do if I suspect unauthorized access?',
      answer: 'Immediately transfer funds to a new wallet, change passwords, and contact support. Enable 2FA if not already active.',
      helpful: 78
    },
    {
      category: 'transactions',
      question: 'Why is my transaction pending?',
      answer: 'Transactions can be pending due to network congestion or low fees. You can increase the fee to speed up confirmation.',
      helpful: 87
    },
    {
      category: 'transactions',
      question: 'How do I check transaction status?',
      answer: 'Go to the Transactions tab to see all your transaction history and current status. You can also check on blockchain explorers.',
      helpful: 81
    },
    {
      category: 'transactions',
      question: 'What are gas fees?',
      answer: 'Gas fees are transaction costs on blockchain networks. Higher fees mean faster confirmation times.',
      helpful: 73
    },
    {
      category: 'troubleshooting',
      question: 'I forgot my password, what should I do?',
      answer: 'Use your recovery phrase to restore your wallet. Never share your recovery phrase with anyone.',
      helpful: 91
    },
    {
      category: 'troubleshooting',
      question: 'The app is not loading, what should I do?',
      answer: 'Try refreshing the page, clearing browser cache, or checking your internet connection. Contact support if issues persist.',
      helpful: 69
    },
    {
      category: 'troubleshooting',
      question: 'My balance is not updating, what\'s wrong?',
      answer: 'This can happen due to network issues. Try refreshing the page or waiting a few minutes. Check your internet connection.',
      helpful: 77
    }
  ];

  const categories = [
    { id: 'all', label: 'All Topics', icon: '📚' },
    { id: 'getting-started', label: 'Getting Started', icon: '🚀' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'transactions', label: 'Transactions', icon: '💸' },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: '🔧' }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Help & Support</h1>
              <div className="text-sm text-gray-600 dark:text-gray-400">Get help with your wallet</div>
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
          {/* Navigation Tabs */}
          <div className="crypto-card mb-8">
            <div className="flex space-x-1 mb-6">
              {[
                { id: 'faq', label: 'FAQ', icon: '❓' },
                { id: 'guides', label: 'Guides', icon: '📖' },
                { id: 'contact', label: 'Contact', icon: '💬' },
                { id: 'status', label: 'Status', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Frequently Asked Questions</h3>
            
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>

                <div className="space-y-4">
                  {filteredFaqs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                      <button 
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{faq.question}</h4>
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{faq.helpful}% helpful</span>
                            <svg 
                              className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        {expandedFaq === index && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{faq.answer}</p>
                            <div className="flex items-center space-x-4">
                              <button className="text-xs text-green-600 dark:text-green-400 hover:text-green-700">
                                ✓ Yes, this helped
                              </button>
                              <button className="text-xs text-red-600 dark:text-red-400 hover:text-red-700">
                                ✗ No, this didn't help
                              </button>
                            </div>
                          </div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guides Tab */}
            {activeTab === 'guides' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Step-by-Step Guides</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: 'Getting Started',
                      description: 'Complete setup guide for new users',
                      icon: '🚀',
                      steps: 8,
                      duration: '15 min'
                    },
                    {
                      title: 'Security Setup',
                      description: 'Secure your wallet with best practices',
                      icon: '🔒',
                      steps: 6,
                      duration: '10 min'
                    },
                    {
                      title: 'Trading Basics',
                      description: 'Learn how to buy and sell crypto',
                      icon: '💱',
                      steps: 12,
                      duration: '20 min'
                    },
                    {
                      title: 'Features',
                      description: 'Master wallet features',
                      icon: '⚡',
                      steps: 15,
                      duration: '30 min'
                    },
                    {
                      title: 'Troubleshooting',
                      description: 'Common issues and solutions',
                      icon: '🔧',
                      steps: 10,
                      duration: '15 min'
                    },
                    {
                      title: 'Mobile App',
                      description: 'Using the mobile application',
                      icon: '📱',
                      steps: 7,
                      duration: '12 min'
                    }
                  ].map((guide, index) => (
                    <div key={index} className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-lg transition-shadow">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-3xl">{guide.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{guide.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{guide.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span>{guide.steps} steps</span>
                        <span>{guide.duration}</span>
                      </div>
                      <button className="w-full crypto-button text-sm">
                        Start Guide
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Contact Support</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-2xl">📧</span>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Email Support</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Get help via email</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">support@xcryptovault.com</p>
                      <button className="crypto-button">Send Email</button>
                    </div>

                    <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-2xl">💬</span>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Live Chat</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Available 24/7</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600 dark:text-green-400">Online now</span>
                      </div>
                      <button className="crypto-button">Start Chat</button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Submit a Ticket</h4>
                      <form className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="Brief description of your issue"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                            <option>Technical Issue</option>
                            <option>Account Problem</option>
                            <option>Transaction Issue</option>
                            <option>Security Concern</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                          <textarea
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="Please provide detailed information about your issue..."
                          ></textarea>
                        </div>
                        <button className="w-full crypto-button">Submit Ticket</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status Tab */}
            {activeTab === 'status' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">System Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Service Status</h4>
                    <div className="space-y-3">
                      {[
                        { service: 'Web Application', status: 'operational', uptime: '99.9%' },
                        { service: 'API Services', status: 'operational', uptime: '99.8%' },
                        { service: 'Blockchain Nodes', status: 'operational', uptime: '99.7%' },
                        { service: 'Email Services', status: 'operational', uptime: '99.9%' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.service}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600 dark:text-green-400">{item.status}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">({item.uptime})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Updates</h4>
                    <div className="space-y-3">
                      {[
                        { date: '2024-01-15', update: 'Security enhancements deployed', type: 'security' },
                        { date: '2024-01-12', update: 'New trading features available', type: 'feature' },
                        { date: '2024-01-10', update: 'Performance optimizations', type: 'improvement' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            item.type === 'security' ? 'bg-red-500' :
                            item.type === 'feature' ? 'bg-blue-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-gray-100">{item.update}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </Layout>
  );
};

export default Help;
