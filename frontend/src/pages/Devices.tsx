import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LiveClock from '../components/LiveClock';

const Devices: React.FC = () => {
  const navigate = useNavigate();
  const [showLogoutAll, setShowLogoutAll] = useState(false);

  const devices = [
    {
      id: 1,
      name: 'MacBook Pro',
      type: 'Desktop',
      location: 'San Francisco, CA',
      lastActive: '2024-01-15T10:30:00Z',
      isCurrent: true,
      browser: 'Chrome 120.0',
      ip: '192.168.1.100'
    },
    {
      id: 2,
      name: 'iPhone 15 Pro',
      type: 'Mobile',
      location: 'San Francisco, CA',
      lastActive: '2024-01-15T09:15:00Z',
      isCurrent: false,
      browser: 'Safari 17.0',
      ip: '192.168.1.101'
    },
    {
      id: 3,
      name: 'Windows PC',
      type: 'Desktop',
      location: 'New York, NY',
      lastActive: '2024-01-14T16:45:00Z',
      isCurrent: false,
      browser: 'Edge 120.0',
      ip: '203.0.113.42'
    }
  ];

  const activities = [
    {
      id: 1,
      action: 'Login',
      device: 'MacBook Pro',
      location: 'San Francisco, CA',
      timestamp: '2024-01-15T10:30:00Z',
      ip: '192.168.1.100',
      status: 'success'
    },
    {
      id: 2,
      action: 'Password Change',
      device: 'iPhone 15 Pro',
      location: 'San Francisco, CA',
      timestamp: '2024-01-15T09:15:00Z',
      ip: '192.168.1.101',
      status: 'success'
    },
    {
      id: 3,
      action: 'Failed Login',
      device: 'Windows PC',
      location: 'New York, NY',
      timestamp: '2024-01-14T16:45:00Z',
      ip: '203.0.113.42',
      status: 'failed'
    },
    {
      id: 4,
      action: '2FA Setup',
      device: 'MacBook Pro',
      location: 'San Francisco, CA',
      timestamp: '2024-01-14T14:20:00Z',
      ip: '192.168.1.100',
      status: 'success'
    }
  ];

  const handleLogoutDevice = (deviceId: number) => {
    // Simulate logout
    console.log(`Logging out device ${deviceId}`);
  };

  const handleLogoutAll = () => {
    setShowLogoutAll(true);
  };

  const confirmLogoutAll = () => {
    // Simulate logout all
    console.log('Logging out all devices');
    setShowLogoutAll(false);
  };

  const cancelLogoutAll = () => {
    setShowLogoutAll(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'Mobile':
        return '📱';
      case 'Desktop':
        return '💻';
      case 'Tablet':
        return '📱';
      default:
        return '🖥️';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Layout>
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Device Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LiveClock />
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Device Overview */}
          <div className="crypto-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Connected Devices</h2>
              <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{devices.length} Active Devices</span>
              </div>
            </div>

            <div className="space-y-4">
              {devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-xl">{getDeviceIcon(device.type)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{device.name}</h3>
                        {device.isCurrent && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                            Current Device
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {device.type} • {device.browser} • {device.location}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Last active: {formatDate(device.lastActive)} • IP: {device.ip}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!device.isCurrent && (
                      <button
                        onClick={() => handleLogoutDevice(device.id)}
                        className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        Logout
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLogoutAll}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout All Other Devices
              </button>
            </div>
          </div>

          {/* Activity Log */}
          <div className="crypto-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
              <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                <span>🔍</span>
                <span>Security Log</span>
              </div>
            </div>

            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.status === 'success' 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      <span className={`text-sm ${
                        activity.status === 'success' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {activity.status === 'success' ? '✓' : '✗'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{activity.action}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.device} • {activity.location}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(activity.timestamp)} • IP: {activity.ip}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status === 'success' ? 'Success' : 'Failed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                View All Activity
              </button>
            </div>
          </div>

          {/* Security Tips */}
          <div className="crypto-card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Security Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-blue-600 dark:text-blue-400 text-xl">🔐</span>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Keep Devices Updated</h3>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Regularly update your devices and browsers to ensure you have the latest security patches.
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-green-600 dark:text-green-400 text-xl">🛡️</span>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Monitor Activity</h3>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Check your activity log regularly and logout any unrecognized devices immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Logout All Confirmation Modal */}
      {showLogoutAll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Logout All Devices</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will logout all devices except your current one. You'll need to sign in again on other devices.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelLogoutAll}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogoutAll}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Logout All
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Devices;
