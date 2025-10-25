import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useUser();
  const { theme } = useTheme();

  const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '🏠',
    activeIcon: '🏡',
  },
  {
    name: 'Admin',
    href: '/admin',
    icon: '🛡️',
    activeIcon: '🛡️',
  },
    {
      name: 'Wallet',
      href: '/wallet',
      icon: '💼',
      activeIcon: '🎒',
    },
    {
      name: 'Portfolio',
      href: '/portfolio',
      icon: '📊',
      activeIcon: '📈',
    },
    {
      name: 'Transactions',
      href: '/transactions',
      icon: '💸',
      activeIcon: '💰',
    },
    {
      name: 'Send',
      href: '/send',
      icon: '📤',
      activeIcon: 'ᯓ➤',
    },
    {
      name: 'Receive',
      href: '/receive',
      icon: '📥',
      activeIcon: '📨',
    },
    {
      name: 'Exchange',
      href: '/exchange',
      icon: '🔄',
      activeIcon: '⚡',
    },
    {
      name: 'Trading',
      href: '/trading',
      icon: '📈',
      activeIcon: '📊',
    },
    {
      name: 'Database',
      href: '/database',
      icon: '🗄️',
      activeIcon: '💾',
    },
    {
      name: 'Staking',
      href: '/staking',
      icon: '🥩',
      activeIcon: '💎',
    },
    {
      name: 'NFTs',
      href: '/nfts',
      icon: '🖼️',
      activeIcon: '🎨',
    },
  ];

  const accountItems = [
    {
      name: 'Profile',
      href: '/profile',
      icon: '👤',
      activeIcon: '👨‍💼',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: '⚙️',
      activeIcon: '🔧',
    },
    {
      name: 'Help',
      href: '/help',
      icon: '❓',
      activeIcon: '💡',
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`bg-white dark:bg-gray-800 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 transition-all duration-300 flex flex-col ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 hover:scale-105 transition-all duration-300">
                <img 
                  src="/bitcoin-logo.svg" 
                  alt="Bitcoin" 
                  className="w-8 h-8 drop-shadow-lg hover:drop-shadow-xl"
                />
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                XCryptoVault
              </h2>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg 
              className={`w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* User Info */}
      {user && !isCollapsed && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const active = isActive(item.href);
            const linkClasses = `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
              active
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
            }`;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={linkClasses}
                title={isCollapsed ? item.name : ''}
              >
                <span className="text-lg">
                  {active ? item.activeIcon : item.icon}
                </span>
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Account Navigation */}
        <div className="space-y-1 pt-4">
          {!isCollapsed && (
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Account
            </div>
          )}
          {accountItems.map((item) => {
            const active = isActive(item.href);
            const linkClasses = `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
              active
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
            }`;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={linkClasses}
                title={isCollapsed ? item.name : ''}
              >
                <span className="text-lg">
                  {active ? item.activeIcon : item.icon}
                </span>
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
