import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Wallet, TrendingUp, DollarSign, Activity, Shield } from 'lucide-react';
import BalanceCard from '../components/BalanceCard';
import TransactionList from '../components/TransactionList';
import PriceChart from '../components/PriceChart';
import QuickActions from '../components/QuickActions';

const Dashboard: React.FC = () => {
  const { state } = useWallet();

  const totalBalance = state.balances.reduce((sum, balance) => sum + balance.balance, 0);
  const totalValueUSD = state.balances.reduce((sum, balance) => sum + (balance.usdValue || 0), 0);

  const stats = [
    {
      title: 'Total Balance',
      value: `${totalBalance.toFixed(8)} BTC`,
      change: '+2.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      title: 'USD Value',
      value: `$${totalValueUSD.toFixed(2)}`,
      change: '+5.2%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      title: 'Active Wallets',
      value: state.wallets.length.toString(),
      change: '+1',
      changeType: 'neutral' as const,
      icon: Wallet,
    },
    {
      title: 'Security Score',
      value: '95%',
      change: '+2%',
      changeType: 'positive' as const,
      icon: Shield,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's your crypto portfolio overview.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            All systems operational
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span
                className={`text-sm font-medium ${
                  stat.changeType === 'positive'
                    ? 'text-green-600'
                    : stat.changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                from last week
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balances */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Portfolio Balances
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {state.balances.map((balance, index) => (
                <BalanceCard key={index} balance={balance} />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <QuickActions />
          
          {/* Price Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Bitcoin Price
            </h3>
            <PriceChart />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </button>
        </div>
        <TransactionList transactions={state.transactions.slice(0, 5)} />
      </div>
    </div>
  );
};

export default Dashboard;
