import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import Layout from '../components/Layout';
import LiveClock from '../components/LiveClock';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    const saved = localStorage.getItem('twoFactorEnabled');
    return saved === 'true';
  });
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  if (!user) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Please log in to view your profile</h2>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSave = () => {
    updateUser(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: user.name,
      email: user.email,
    });
    setIsEditing(false);
  };

  const handleCopyUserId = async () => {
    try {
      await navigator.clipboard.writeText('xw5dwhf57egd872vgr');
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const handleTwoFactorToggle = () => {
    navigate('/two-factor-auth');
  };

  const handleSecuritySettings = () => {
    navigate('/settings?tab=security');
  };

  const handleDeviceManagement = () => {
    navigate('/devices');
  };

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

  return (
    <Layout>
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
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
        {/* Enhanced Profile Header */}
        <div className="crypto-card mb-8 overflow-hidden">
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10 p-8">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-2xl ring-4 ring-blue-100 dark:ring-blue-900/30"
                  />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs">👑</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h2>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-full shadow-lg">
                        ✓ Verified
                      </span>
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold rounded-full shadow-lg">
                        👑 Premium
                      </span>
                    </div>
                  </div>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-3">{user.email}</p>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-gray-600 dark:text-gray-400">Online</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 dark:text-gray-400">Member since</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{new Date(user.joinDate).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 dark:text-gray-400">Security Score</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="w-14 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                        </div>
                        <span className="font-bold text-green-600 dark:text-green-400">98%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-3">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="crypto-button text-lg px-6 py-3"
                    >
                      ✏️ Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg font-semibold"
                      >
                        💾 Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg font-semibold"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  )}
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-semibold">
                    ⚙️ Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="crypto-card">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Personal Information</h3>
            </div>
            
            <div className="space-y-6">
              {/* Profile Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-lg">👤</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Account Level</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">Premium</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-lg">🛡️</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Security Score</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">98/100</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-sm">📝</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-gray-100 font-medium">{user.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      ✓ Verified
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 text-sm">📧</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-gray-100 font-medium">{user.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      ✓ Verified
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 dark:text-orange-400 text-sm">🆔</span>
                    </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User ID</label>
                        <div className="mt-1">
                          <p className="text-gray-900 dark:text-gray-100 font-mono text-lg font-bold bg-white dark:bg-gray-800 px-3 py-1 rounded border dark:border-gray-600 tracking-wider">
                            xw5dwhf57egd872vgr
                          </p>
                        </div>
                      </div>
                  </div>
                  <button 
                    onClick={handleCopyUserId}
                    className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${
                      copySuccess 
                        ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
                        : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    {copySuccess ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 text-sm">📅</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</label>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{new Date(user.joinDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.floor((new Date().getTime() - new Date(user.joinDate).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      Loyal Member
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Information */}
          <div className="crypto-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Security</h3>
              <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Secure Account</span>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-xl">🔐</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Two-Factor Authentication</h4>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        twoFactorEnabled 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {twoFactorEnabled ? '✓ Enabled' : '⚠ Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleTwoFactorToggle}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    twoFactorEnabled 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                </button>
              </div>

              {/* Change Password */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 text-xl">🔑</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Change Password</h4>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        Last changed: 30 days ago
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleChangePassword}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Change Password
                </button>
              </div>

              {/* Security Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 text-sm">🛡️</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Password Protection</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Require password for transactions</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.security.requirePasswordForTransactions 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                      {user.security.requirePasswordForTransactions ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 dark:text-orange-400 text-sm">🔒</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">Auto Lock</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Automatically lock after inactivity</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.security.autoLock 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                      {user.security.autoLock ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={handleSecuritySettings}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span>🔐</span>
                    <span>Security Settings</span>
                  </button>
                  <button 
                    onClick={handleDeviceManagement}
                    className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span>📱</span>
                    <span>Device Management</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Account Statistics */}
        <div className="mt-8">
          <div className="crypto-card">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Account Statistics</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 dark:text-blue-400 text-xl">📊</span>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Transactions</div>
                <div className="text-xs text-green-600 dark:text-green-400 font-semibold">+12% this month</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 dark:text-green-400 text-xl">💰</span>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">$24,567</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Portfolio Value</div>
                <div className="text-xs text-green-600 dark:text-green-400 font-semibold">+8.5% this month</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 dark:text-purple-400 text-xl">🏆</span>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">Gold</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Achievement Level</div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">85% to Platinum</div>
              </div>
            </div>
          </div>
        </div>
      </main>


    </Layout>
  );
};

export default Profile;
