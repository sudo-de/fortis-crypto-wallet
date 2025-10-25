import React, { useState } from 'react';
import Layout from '../components/Layout';
import LiveClock from '../components/LiveClock';
import { useUser } from '../contexts/UserContext';

const Preferences: React.FC = () => {
  const { user, updatePreferences } = useUser();
  const [activeTab, setActiveTab] = useState<'theme' | 'display' | 'language' | 'notifications'>('theme');

  const themes = [
    {
      id: 'light',
      name: 'Light',
      description: 'Clean and bright interface',
      preview: 'bg-white border-gray-200',
      icon: '☀️'
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Easy on the eyes',
      preview: 'bg-gray-900 border-gray-700',
      icon: '🌙'
    },
    {
      id: 'auto',
      name: 'Auto',
      description: 'Follows system preference',
      preview: 'bg-gradient-to-r from-white to-gray-900 border-gray-400',
      icon: '🔄'
    }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' }
  ];

  const handleThemeChange = (theme: string) => {
    updatePreferences({ theme: theme as 'light' | 'dark' | 'auto' });
  };

  const handleLanguageChange = (language: string) => {
    updatePreferences({ language });
  };

  const handleTimezoneChange = (timezone: string) => {
    updatePreferences({ timezone });
  };

  return (
    <Layout>
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Preferences</h1>
              <div className="text-sm text-gray-600">Customize your experience</div>
            </div>
            <div className="flex items-center space-x-4">
              <LiveClock />
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="crypto-card mb-8">
            <div className="flex space-x-6">
              {[
                { id: 'theme', label: 'Theme', icon: '🎨' },
                { id: 'display', label: 'Display', icon: '📱' },
                { id: 'language', label: 'Language', icon: '🌐' },
                { id: 'notifications', label: 'Notifications', icon: '🔔' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div className="crypto-card">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Choose Your Theme</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      user?.preferences.theme === theme.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-4">{theme.icon}</div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{theme.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{theme.description}</p>
                      <div className={`w-full h-16 rounded-lg border ${theme.preview} flex items-center justify-center`}>
                        <span className="text-sm font-medium text-gray-700">Preview</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-blue-600">💡</span>
                  <span className="font-medium text-blue-900">Theme Tips</span>
                </div>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Light theme is great for daytime use</li>
                  <li>• Dark theme reduces eye strain in low light</li>
                  <li>• Auto theme follows your system settings</li>
                </ul>
              </div>
            </div>
          )}

          {/* Display Tab */}
          {activeTab === 'display' && (
            <div className="crypto-card">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Display Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Currency</label>
                  <select
                    value={user?.preferences.currency || 'USD'}
                    onChange={(e) => updatePreferences({ currency: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Number Format</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input type="radio" name="numberFormat" value="en-US" className="text-blue-600" defaultChecked />
                      <span className="text-sm text-gray-700">1,234.56 (US Format)</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="radio" name="numberFormat" value="de-DE" className="text-blue-600" />
                      <span className="text-sm text-gray-700">1.234,56 (European Format)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Date Format</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input type="radio" name="dateFormat" value="MM/DD/YYYY" className="text-blue-600" defaultChecked />
                      <span className="text-sm text-gray-700">MM/DD/YYYY (US Format)</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="radio" name="dateFormat" value="DD/MM/YYYY" className="text-blue-600" />
                      <span className="text-sm text-gray-700">DD/MM/YYYY (European Format)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Language Tab */}
          {activeTab === 'language' && (
            <div className="crypto-card">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Language & Region</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Interface Language</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                          user?.preferences.language === lang.code
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Timezone</label>
                  <select
                    value={user?.preferences.timezone || 'UTC'}
                    onChange={(e) => handleTimezoneChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {timezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="crypto-card">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user?.notifications.email || false}
                      onChange={(e) => updatePreferences({ email: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Push Notifications</h4>
                    <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user?.notifications.push || false}
                      onChange={(e) => updatePreferences({ push: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                    <p className="text-sm text-gray-600">Receive important updates via SMS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user?.notifications.sms || false}
                      onChange={(e) => updatePreferences({ sms: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default Preferences;
