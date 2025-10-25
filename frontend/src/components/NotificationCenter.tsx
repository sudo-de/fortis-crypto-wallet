import React, { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Order Executed',
      message: 'Your BTC buy order for 0.5 BTC has been filled at $43,250',
      timestamp: Date.now() - 300000,
      read: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Price Alert',
      message: 'ETH has reached your target price of $2,900',
      timestamp: Date.now() - 600000,
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'Market Update',
      message: 'Bitcoin is trending up 5.2% in the last 24 hours',
      timestamp: Date.now() - 900000,
      read: true
    },
    {
      id: '4',
      type: 'error',
      title: 'Order Failed',
      message: 'Your limit order for SOL was rejected due to insufficient balance',
      timestamp: Date.now() - 1200000,
      read: true
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'success' | 'warning' | 'error' | 'info'>('all');

  // Simulate new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const notificationTypes: Notification['type'][] = ['success', 'warning', 'error', 'info'];
      const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: randomType,
        title: getRandomTitle(randomType),
        message: getRandomMessage(randomType),
        timestamp: Date.now(),
        read: false
      };

      setNotifications(prev => [newNotification, ...prev].slice(0, 20)); // Keep last 20 notifications
    }, 30000); // New notification every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getRandomTitle = (type: Notification['type']): string => {
    const titles = {
      success: ['Order Executed', 'Trade Completed', 'Position Closed', 'Profit Realized'],
      warning: ['Price Alert', 'Market Volatility', 'Low Balance', 'Risk Warning'],
      error: ['Order Failed', 'Transaction Error', 'Network Issue', 'Insufficient Funds'],
      info: ['Market Update', 'News Alert', 'System Update', 'Feature Available']
    };
    const typeTitles = titles[type];
    return typeTitles[Math.floor(Math.random() * typeTitles.length)];
  };

  const getRandomMessage = (type: Notification['type']): string => {
    const messages = {
      success: [
        'Your BTC buy order has been filled at $43,250',
        'Trade completed successfully with 2.5% profit',
        'Position closed with $1,250 profit',
        'Order executed at market price'
      ],
      warning: [
        'ETH has reached your target price of $2,900',
        'High volatility detected in the market',
        'Your account balance is below $100',
        'Risk level increased for your portfolio'
      ],
      error: [
        'Your limit order was rejected due to insufficient balance',
        'Transaction failed due to network congestion',
        'Order could not be processed at this time',
        'Insufficient funds for this transaction'
      ],
      info: [
        'Bitcoin is trending up 5.2% in the last 24 hours',
        'New trading pair SOL/USDT is now available',
        'System maintenance scheduled for tonight',
        'New feature: Order types now available'
      ]
    };
    const typeMessages = messages[type];
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'info': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filters */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-3">
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'success', label: 'Success' },
                { key: 'warning', label: 'Warning' },
                { key: 'error', label: 'Error' },
                { key: 'info', label: 'Info' }
              ].map(filterOption => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as any)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    filter === filterOption.key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-4xl mb-2">🔔</div>
                  <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-lg">{getTypeIcon(notification.type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(notification.type)}`}>
                              {notification.type}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                        {notification.action && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              notification.action?.onClick();
                            }}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {notification.action.label}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
