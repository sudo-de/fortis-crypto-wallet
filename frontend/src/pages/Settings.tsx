import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import Layout from '../components/Layout';
import LiveClock from '../components/LiveClock';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateNotifications, updatePrivacy, updateSecurity, updatePreferences } = useUser();
  const [activeTab, setActiveTab] = useState<'notifications' | 'privacy' | 'security' | 'general' | 'appearance' | 'data' | 'advanced'>('general');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    const saved = localStorage.getItem('twoFactorEnabled');
    return saved === 'true';
  });

  // Handle URL parameter to set active tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['notifications', 'privacy', 'security', 'general', 'appearance', 'data', 'advanced'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  // Listen for changes in localStorage and custom events
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('twoFactorEnabled');
      setTwoFactorEnabled(saved === 'true');
    };

    const handleTwoFactorStatusChange = (event: CustomEvent) => {
      setTwoFactorEnabled(event.detail.enabled);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('twoFactorStatusChanged', handleTwoFactorStatusChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('twoFactorStatusChanged', handleTwoFactorStatusChange as EventListener);
    };
  }, []);

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const handleTwoFactorAuth = () => {
    navigate('/two-factor-auth');
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Please log in to access settings</h2>
          </div>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'security', label: 'Security', icon: '🛡️' },
    { id: 'data', label: 'Data & Storage', icon: '💾' },
    { id: 'advanced', label: 'System', icon: '🔧' },
  ] as const;

  return (
    <Layout>
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="crypto-card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Settings</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="crypto-card">
              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Notification Settings</h3>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Communication Channels */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Communication Channels</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 text-sm">📧</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates via email</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.notifications.email}
                              onChange={(e) => updateNotifications({ email: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <span className="text-green-600 dark:text-green-400 text-sm">📱</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Push Notifications</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Receive push notifications on your device</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.notifications.push}
                              onChange={(e) => updateNotifications({ push: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 dark:text-orange-400 text-sm">💬</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">SMS Notifications</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Receive important updates via SMS</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.notifications.sms}
                              onChange={(e) => updateNotifications({ sms: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Notifications */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Transaction Notifications</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <span className="text-green-600 dark:text-green-400 text-sm">💰</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Transaction Alerts</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when transactions are completed</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.notifications.transactions}
                              onChange={(e) => updateNotifications({ transactions: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                              <span className="text-yellow-600 dark:text-yellow-400 text-sm">⚠️</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Large Transaction Alerts</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified for transactions above $1,000</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.notifications.largeTransactions}
                              onChange={(e) => updateNotifications({ largeTransactions: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                              <span className="text-red-600 dark:text-red-400 text-sm">🚨</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Failed Transaction Alerts</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when transactions fail</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.notifications.failedTransactions}
                              onChange={(e) => updateNotifications({ failedTransactions: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Security Notifications */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Security Notifications</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 dark:text-purple-400 text-sm">🔐</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Login Alerts</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified of new login attempts</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.notifications.loginAlerts}
                              onChange={(e) => updateNotifications({ loginAlerts: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 text-sm">🛡️</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Security Updates</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified about security updates and patches</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.notifications.securityUpdates}
                              onChange={(e) => updateNotifications({ securityUpdates: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 dark:text-indigo-400 text-sm">🔑</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Password Changes</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when your password is changed</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.notifications.passwordChanges}
                              onChange={(e) => updateNotifications({ passwordChanges: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Marketing Notifications */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Marketing & Updates</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
                              <span className="text-pink-600 dark:text-pink-400 text-sm">📢</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Marketing Emails</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Receive promotional offers and updates</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.notifications.marketing}
                              onChange={(e) => updateNotifications({ marketing: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                              <span className="text-teal-600 dark:text-teal-400 text-sm">📈</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Market Updates</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Receive cryptocurrency market news and updates</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.notifications.marketUpdates}
                              onChange={(e) => updateNotifications({ marketUpdates: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center">
                              <span className="text-cyan-600 dark:text-cyan-400 text-sm">🎯</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Product Updates</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified about new features and improvements</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.notifications.productUpdates}
                              onChange={(e) => updateNotifications({ productUpdates: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Notification Preferences */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Notification Preferences</h4>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-blue-600 dark:text-blue-400 text-xl">⏰</span>
                            <h5 className="font-semibold text-blue-900 dark:text-blue-100">Quiet Hours</h5>
                          </div>
                          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                            Set specific hours when you don't want to receive notifications (except security alerts).
                          </p>
                          <div className="flex items-center space-x-4">
                            <select className="px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                              <option>10:00 PM - 8:00 AM</option>
                              <option>11:00 PM - 7:00 AM</option>
                              <option>12:00 AM - 6:00 AM</option>
                              <option>Disabled</option>
                            </select>
                          </div>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-green-600 dark:text-green-400 text-xl">🔔</span>
                            <h5 className="font-semibold text-green-900 dark:text-green-100">Notification Frequency</h5>
                          </div>
                          <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                            Choose how often you want to receive digest notifications.
                          </p>
                          <div className="flex items-center space-x-4">
                            <select className="px-3 py-2 border border-green-200 dark:border-green-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                              <option>Real-time</option>
                              <option>Hourly</option>
                              <option>Daily</option>
                              <option>Weekly</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Privacy Settings</h3>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Data Visibility */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Data Visibility</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 text-sm">💰</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Show Balance</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Display your portfolio balance publicly</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.privacy.showBalance}
                              onChange={(e) => updatePrivacy({ showBalance: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <span className="text-green-600 dark:text-green-400 text-sm">📊</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Show Transactions</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Display your transaction history publicly</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.privacy.showTransactions}
                              onChange={(e) => updatePrivacy({ showTransactions: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 dark:text-purple-400 text-sm">👤</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Show Profile</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Make your profile visible to other users</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.privacy.showProfile}
                              onChange={(e) => updatePrivacy({ showProfile: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Data Collection */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Data Collection</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 dark:text-orange-400 text-sm">📈</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Allow Analytics</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Help improve our service with anonymous usage data</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.privacy.allowAnalytics}
                              onChange={(e) => updatePrivacy({ allowAnalytics: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                              <span className="text-red-600 dark:text-red-400 text-sm">🎯</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Marketing Communications</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Receive promotional emails and updates</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.privacy.allowMarketing}
                              onChange={(e) => updatePrivacy({ allowMarketing: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                              <span className="text-yellow-600 dark:text-yellow-400 text-sm">📍</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Location Tracking</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Allow location-based features and security alerts</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.privacy.allowLocation}
                              onChange={(e) => updatePrivacy({ allowLocation: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Data Retention */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Data Retention</h4>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-blue-600 dark:text-blue-400 text-xl">🗂️</span>
                            <h5 className="font-semibold text-blue-900 dark:text-blue-100">Transaction History</h5>
                          </div>
                          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                            Your transaction data is stored securely and encrypted. You can request data deletion at any time.
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-blue-700 dark:text-blue-300">Retention Period: 7 years</span>
                            <button className="text-blue-600 dark:text-blue-400 hover:underline">
                              Request Deletion
                            </button>
                          </div>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-green-600 dark:text-green-400 text-xl">🔒</span>
                            <h5 className="font-semibold text-green-900 dark:text-green-100">Personal Data</h5>
                          </div>
                          <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                            Your personal information is protected with end-to-end encryption and never shared with third parties.
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-green-700 dark:text-green-300">Encryption: AES-256</span>
                            <button className="text-green-600 dark:text-green-400 hover:underline">
                              View Privacy Policy
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Privacy Actions */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Privacy Actions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <span>📥</span>
                          <span>Download My Data</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <span>🗑️</span>
                          <span>Delete Account</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Security Settings</h3>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Authentication Security */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Authentication Security</h4>
                      <div className="space-y-4">
                        {/* Two-Factor Authentication */}
                        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <span className="text-green-600 dark:text-green-400 text-xl">🔐</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Two-Factor Authentication</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  twoFactorEnabled 
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                }`}>
                                  {twoFactorEnabled ? '✓ Enabled' : '⚠ Disabled'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {twoFactorEnabled ? 'Protecting your account' : 'Recommended for security'}
                                </span>
                              </div>
                            </div>
                            <button 
                              onClick={handleTwoFactorAuth}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                twoFactorEnabled 
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50' 
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                            </button>
                          </div>
                        </div>

                        {/* Change Password */}
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 text-xl">🔑</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Change Password</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Update your account password for better security</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                  Last changed: 30 days ago
                                </span>
                              </div>
                            </div>
                            <button 
                              onClick={handleChangePassword}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              Change Password
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Security */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Transaction Security</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 dark:text-purple-400 text-sm">🛡️</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Password Protection</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Require password for transactions</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.security.requirePasswordForTransactions}
                              onChange={(e) => updateSecurity({ requirePasswordForTransactions: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                              <span className="text-red-600 dark:text-red-400 text-sm">💰</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Transaction Limits</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Set daily transaction limits</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.security.transactionLimits}
                              onChange={(e) => updateSecurity({ transactionLimits: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                              <span className="text-yellow-600 dark:text-yellow-400 text-sm">⚠️</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Suspicious Activity Alerts</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified of unusual activity</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.security.suspiciousActivityAlerts}
                              onChange={(e) => updateSecurity({ suspiciousActivityAlerts: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <span className="text-green-600 dark:text-green-400 text-sm">🔒</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Biometric Authentication</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Use fingerprint or face ID</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.security.biometricAuth}
                              onChange={(e) => updateSecurity({ biometricAuth: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Session Security */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Session Security</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 dark:text-orange-400 text-sm">🔒</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Auto Lock</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Automatically lock when idle</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.security.autoLock}
                              onChange={(e) => updateSecurity({ autoLock: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                              <span className="text-yellow-600 dark:text-yellow-400 text-sm">⏰</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Session Timeout</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Automatically log out after inactivity</p>
                            </div>
                          </div>
                          <select
                            value={user.security.sessionTimeout}
                            onChange={(e) => updateSecurity({ sessionTimeout: parseInt(e.target.value) })}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={120}>2 hours</option>
                            <option value={0}>Never</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 text-sm">🌐</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">IP Whitelist</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Restrict access to specific IP addresses</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.security.ipWhitelist}
                              onChange={(e) => updateSecurity({ ipWhitelist: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Device Security */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Device Security</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 dark:text-purple-400 text-sm">📱</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Device Management</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Manage trusted devices and sessions</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => navigate('/devices')}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                          >
                            Manage Devices
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 dark:text-indigo-400 text-sm">🔍</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Login History</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">View recent login attempts and locations</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            View History
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center">
                              <span className="text-cyan-600 dark:text-cyan-400 text-sm">🚨</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Security Alerts</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified of security events</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.security.securityAlerts}
                              onChange={(e) => updateSecurity({ securityAlerts: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Advanced Security */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Security</h4>
                      <div className="space-y-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-red-600 dark:text-red-400 text-xl">🔐</span>
                            <h5 className="font-semibold text-red-900 dark:text-red-100">Hardware Security Module</h5>
                          </div>
                          <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                            Use hardware security modules for enhanced key protection and secure key generation.
                          </p>
                          <div className="flex items-center space-x-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={user.security.hardwareSecurityModule}
                                onChange={(e) => updateSecurity({ hardwareSecurityModule: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                            <span className="text-sm text-red-700 dark:text-red-300">
                              {user.security.hardwareSecurityModule ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-yellow-600 dark:text-yellow-400 text-xl">🛡️</span>
                            <h5 className="font-semibold text-yellow-900 dark:text-yellow-100">Multi-Signature Wallets</h5>
                          </div>
                          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                            Require multiple signatures for high-value transactions to prevent unauthorized access.
                          </p>
                          <div className="flex items-center space-x-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={user.security.multiSignature}
                                onChange={(e) => updateSecurity({ multiSignature: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                            <span className="text-sm text-yellow-700 dark:text-yellow-300">
                              {user.security.multiSignature ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-green-600 dark:text-green-400 text-xl">🔒</span>
                            <h5 className="font-semibold text-green-900 dark:text-green-100">Encryption Level</h5>
                          </div>
                          <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                            Your data is protected with AES-256 encryption. This is the highest standard for data protection.
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-green-700 dark:text-green-300">Encryption: AES-256</span>
                            <span className="text-green-700 dark:text-green-300">Status: Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* General Tab */}
              {activeTab === 'general' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">General Settings</h3>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Localization */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Localization</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 text-sm">🌍</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Language</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Interface language</p>
                            </div>
                          </div>
                          <select
                            value={user.preferences.language}
                            onChange={(e) => updatePreferences({ language: e.target.value })}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                            <option value="zh">中文</option>
                            <option value="ja">日本語</option>
                            <option value="ko">한국어</option>
                            <option value="pt">Português</option>
                            <option value="ru">Русский</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <span className="text-green-600 dark:text-green-400 text-sm">💰</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Currency</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Default currency for displaying values</p>
                            </div>
                          </div>
                          <select
                            value={user.preferences.currency}
                            onChange={(e) => updatePreferences({ currency: e.target.value })}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="JPY">JPY - Japanese Yen</option>
                            <option value="CAD">CAD - Canadian Dollar</option>
                            <option value="AUD">AUD - Australian Dollar</option>
                            <option value="CHF">CHF - Swiss Franc</option>
                            <option value="CNY">CNY - Chinese Yuan</option>
                            <option value="INR">INR - Indian Rupee</option>
                            <option value="KRW">KRW - South Korean Won</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 dark:text-purple-400 text-sm">🕐</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Timezone</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Your local timezone</p>
                            </div>
                          </div>
                          <select
                            value={user.preferences.timezone}
                            onChange={(e) => updatePreferences({ timezone: e.target.value })}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="America/Chicago">Central Time (CT)</option>
                            <option value="America/Denver">Mountain Time (MT)</option>
                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            <option value="Europe/London">London (GMT)</option>
                            <option value="Europe/Paris">Paris (CET)</option>
                            <option value="Europe/Berlin">Berlin (CET)</option>
                            <option value="Asia/Tokyo">Tokyo (JST)</option>
                            <option value="Asia/Shanghai">Shanghai (CST)</option>
                            <option value="Asia/Seoul">Seoul (KST)</option>
                            <option value="Australia/Sydney">Sydney (AEST)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Display Preferences */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Display Preferences</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 dark:text-orange-400 text-sm">📊</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Number Format</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">How numbers are displayed</p>
                            </div>
                          </div>
                          <select
                            value={user.preferences.numberFormat}
                            onChange={(e) => updatePreferences({ numberFormat: e.target.value })}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value="US">1,234.56 (US Format)</option>
                            <option value="EU">1.234,56 (EU Format)</option>
                            <option value="IN">1,23,456.78 (Indian Format)</option>
                            <option value="JP">1,234.56 (Japanese Format)</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center">
                              <span className="text-cyan-600 dark:text-cyan-400 text-sm">📅</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Date Format</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">How dates are displayed</p>
                            </div>
                          </div>
                          <select
                            value={user.preferences.dateFormat}
                            onChange={(e) => updatePreferences({ dateFormat: e.target.value })}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                            <option value="DD MMM YYYY">DD MMM YYYY (Long)</option>
                          </select>
                        </div>

                      </div>
                    </div>

                    {/* Trading Preferences */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Trading Preferences</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                              <span className="text-yellow-600 dark:text-yellow-400 text-sm">⚡</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Default Transaction Speed</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Default speed for transactions</p>
                            </div>
                          </div>
                          <select
                            value={user.preferences.transactionSpeed}
                            onChange={(e) => updatePreferences({ transactionSpeed: e.target.value })}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value="slow">Slow (Low Fee)</option>
                            <option value="medium">Medium (Standard Fee)</option>
                            <option value="fast">Fast (High Fee)</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                              <span className="text-red-600 dark:text-red-400 text-sm">⚠️</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Price Alert Threshold</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Percentage change to trigger alerts</p>
                            </div>
                          </div>
                          <select
                            value={user.preferences.priceAlertThreshold}
                            onChange={(e) => updatePreferences({ priceAlertThreshold: e.target.value })}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value="1">1%</option>
                            <option value="5">5%</option>
                            <option value="10">10%</option>
                            <option value="20">20%</option>
                            <option value="50">50%</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 dark:text-indigo-400 text-sm">🔄</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Auto-Refresh Interval</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">How often to refresh market data</p>
                            </div>
                          </div>
                          <select
                            value={user.preferences.autoRefreshInterval}
                            onChange={(e) => updatePreferences({ autoRefreshInterval: e.target.value })}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value="5">5 seconds</option>
                            <option value="10">10 seconds</option>
                            <option value="30">30 seconds</option>
                            <option value="60">1 minute</option>
                            <option value="300">5 minutes</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Accessibility */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Accessibility</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                              <span className="text-teal-600 dark:text-teal-400 text-sm">🔍</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Font Size</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Adjust text size for better readability</p>
                            </div>
                          </div>
                          <select
                            value={user.preferences.fontSize}
                            onChange={(e) => updatePreferences({ fontSize: e.target.value })}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                            <option value="extra-large">Extra Large</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                              <span className="text-emerald-600 dark:text-emerald-400 text-sm">♿</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">High Contrast Mode</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Enhanced contrast for better visibility</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.preferences.highContrastMode}
                              onChange={(e) => updatePreferences({ highContrastMode: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
                              <span className="text-violet-600 dark:text-violet-400 text-sm">🔊</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Sound Effects</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Play sounds for transactions and alerts</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.preferences.soundEffects}
                              onChange={(e) => updatePreferences({ soundEffects: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Appearance Settings</h3>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Theme Customization */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Theme Customization</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 dark:text-purple-400 text-sm">🎨</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Color Scheme</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred color palette</p>
                            </div>
                          </div>
                          <select
                            value={user.preferences.colorScheme}
                            onChange={(e) => updatePreferences({ colorScheme: e.target.value })}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value="dark">Dark Mode</option>
                            <option value="blue">Blue Theme</option>
                            <option value="green">Green Theme</option>
                            <option value="purple">Purple Theme</option>
                            <option value="orange">Orange Theme</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 text-sm">🌈</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Accent Color</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Primary accent color for highlights</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full cursor-pointer border-2 border-blue-700"></div>
                            <div className="w-8 h-8 bg-green-500 rounded-full cursor-pointer border-2 border-transparent"></div>
                            <div className="w-8 h-8 bg-purple-500 rounded-full cursor-pointer border-2 border-transparent"></div>
                            <div className="w-8 h-8 bg-orange-500 rounded-full cursor-pointer border-2 border-transparent"></div>
                            <div className="w-8 h-8 bg-red-500 rounded-full cursor-pointer border-2 border-transparent"></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <span className="text-green-600 dark:text-green-400 text-sm">🌙</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Auto Dark Mode</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Automatically switch based on system</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.preferences.autoDarkMode}
                              onChange={(e) => updatePreferences({ autoDarkMode: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Layout Options */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Layout Options</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 dark:text-orange-400 text-sm">📐</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Sidebar Position</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Choose sidebar placement</p>
                            </div>
                          </div>
                          <select
                            value={user.preferences.sidebarPosition}
                            onChange={(e) => updatePreferences({ sidebarPosition: e.target.value })}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center">
                              <span className="text-cyan-600 dark:text-cyan-400 text-sm">📱</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Compact Mode</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Use compact layout for smaller screens</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.preferences.compactMode}
                              onChange={(e) => updatePreferences({ compactMode: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
                              <span className="text-pink-600 dark:text-pink-400 text-sm">🎯</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Grid Density</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Control spacing between elements</p>
                            </div>
                          </div>
                          <select
                            value={user.preferences.gridDensity}
                            onChange={(e) => updatePreferences({ gridDensity: e.target.value })}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value="compact">Compact</option>
                            <option value="normal">Normal</option>
                            <option value="comfortable">Comfortable</option>
                            <option value="spacious">Spacious</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Visual Effects */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Visual Effects</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 dark:text-indigo-400 text-sm">✨</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Animations</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Enable smooth transitions and animations</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.preferences.animations}
                              onChange={(e) => updatePreferences({ animations: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                              <span className="text-teal-600 dark:text-teal-400 text-sm">🌟</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Particle Effects</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Show particle effects on interactions</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.preferences.particleEffects}
                              onChange={(e) => updatePreferences({ particleEffects: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
                              <span className="text-violet-600 dark:text-violet-400 text-sm">🎭</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Glassmorphism</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Enable glass-like transparency effects</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.preferences.glassmorphism}
                              onChange={(e) => updatePreferences({ glassmorphism: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data & Storage Tab */}
              {activeTab === 'data' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Data & Storage Settings</h3>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Storage Management */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Storage Management</h4>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <span className="text-blue-600 dark:text-blue-400 text-xl">💾</span>
                              <h5 className="font-semibold text-blue-900 dark:text-blue-100">Storage Usage</h5>
                            </div>
                            <span className="text-sm text-blue-700 dark:text-blue-300">2.4 GB / 10 GB</span>
                          </div>
                          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-4">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '24%' }}></div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-semibold text-blue-900 dark:text-blue-100">1.2 GB</div>
                              <div className="text-blue-700 dark:text-blue-300">Cache</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-blue-900 dark:text-blue-100">0.8 GB</div>
                              <div className="text-blue-700 dark:text-blue-300">Data</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-blue-900 dark:text-blue-100">0.4 GB</div>
                              <div className="text-blue-700 dark:text-blue-300">Media</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <span className="text-green-600 dark:text-green-400 text-sm">🗑️</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Auto-Cleanup</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Automatically clear old cache and temporary files</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.preferences.autoCleanup}
                              onChange={(e) => updatePreferences({ autoCleanup: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 dark:text-orange-400 text-sm">📦</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Cache Size Limit</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Maximum cache storage size</p>
                            </div>
                          </div>
                          <select
                            value={user.preferences.cacheSizeLimit}
                            onChange={(e) => updatePreferences({ cacheSizeLimit: e.target.value })}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <option value="100">100 MB</option>
                            <option value="500">500 MB</option>
                            <option value="1000">1 GB</option>
                            <option value="2000">2 GB</option>
                            <option value="5000">5 GB</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Backup & Sync */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Backup & Sync</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 dark:text-purple-400 text-sm">☁️</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Cloud Backup</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Automatically backup data to cloud</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.preferences.cloudBackup}
                              onChange={(e) => updatePreferences({ cloudBackup: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center">
                              <span className="text-cyan-600 dark:text-cyan-400 text-sm">🔄</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Auto Sync</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Sync data across devices automatically</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.preferences.autoSync}
                              onChange={(e) => updatePreferences({ autoSync: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                              <span className="text-red-600 dark:text-red-400 text-sm">📥</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Export Data</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Download your data as backup</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                            Export Now
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Data Management */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Data Management</h4>
                      <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-yellow-600 dark:text-yellow-400 text-xl">⚠️</span>
                            <h5 className="font-semibold text-yellow-900 dark:text-yellow-100">Clear All Data</h5>
                          </div>
                          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
                            This will permanently delete all your local data, cache, and preferences. This action cannot be undone.
                          </p>
                          <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors">
                            Clear All Data
                          </button>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-green-600 dark:text-green-400 text-xl">🔄</span>
                            <h5 className="font-semibold text-green-900 dark:text-green-100">Reset to Defaults</h5>
                          </div>
                          <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                            Reset all settings to their default values while keeping your data intact.
                          </p>
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                            Reset Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Tab */}
              {activeTab === 'advanced' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">System Settings</h3>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Developer Tools */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Developer Tools</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 text-sm">🔧</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Developer Mode</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Enable advanced debugging tools</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.preferences.developerMode}
                              onChange={(e) => updatePreferences({ developerMode: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <span className="text-green-600 dark:text-green-400 text-sm">🐛</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Debug Logging</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Enable detailed debug information</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.preferences.debugLogging}
                              onChange={(e) => updatePreferences({ debugLogging: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 dark:text-purple-400 text-sm">📊</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Performance Monitoring</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Track application performance metrics</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.preferences.performanceMonitoring}
                              onChange={(e) => updatePreferences({ performanceMonitoring: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Experimental Features */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Experimental Features</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 dark:text-orange-400 text-sm">🧪</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Beta Features</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Enable experimental beta features</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.preferences.betaFeatures}
                              onChange={(e) => updatePreferences({ betaFeatures: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center">
                              <span className="text-cyan-600 dark:text-cyan-400 text-sm">🚀</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">AI Assistant</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Enable AI-powered features and suggestions</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.preferences.aiAssistant}
                              onChange={(e) => updatePreferences({ aiAssistant: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
                              <span className="text-pink-600 dark:text-pink-400 text-sm">🔮</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">Predictive Analytics</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Use machine learning for market predictions</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={user.preferences.predictiveAnalytics}
                              onChange={(e) => updatePreferences({ predictiveAnalytics: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* System Information */}
                    <div className="crypto-card">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">System Information</h4>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-blue-600 dark:text-blue-400 text-xl">ℹ️</span>
                            <h5 className="font-semibold text-blue-900 dark:text-blue-100">Application Details</h5>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-blue-700 dark:text-blue-300">Version:</span>
                              <span className="text-blue-900 dark:text-blue-100 ml-2">1.0.0</span>
                            </div>
                            <div>
                              <span className="text-blue-700 dark:text-blue-300">Build:</span>
                              <span className="text-blue-900 dark:text-blue-100 ml-2">2024.01.15</span>
                            </div>
                            <div>
                              <span className="text-blue-700 dark:text-blue-300">Platform:</span>
                              <span className="text-blue-900 dark:text-blue-100 ml-2">Web</span>
                            </div>
                            <div>
                              <span className="text-blue-700 dark:text-blue-300">Environment:</span>
                              <span className="text-blue-900 dark:text-blue-100 ml-2">Production</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-green-600 dark:text-green-400 text-xl">🔧</span>
                            <h5 className="font-semibold text-green-900 dark:text-green-100">System Actions</h5>
                          </div>
                          <div className="flex space-x-3">
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                              Check Updates
                            </button>
                            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              View Logs
                            </button>
                            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              System Info
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Settings;
