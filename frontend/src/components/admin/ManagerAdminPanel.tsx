import React, { useState, useEffect } from 'react';
import AdminService from '../../services/adminService';

interface ManagerAdminPanelProps {
  onIncidentCreate: (incidentData: any) => void;
  onComplianceRuleCreate: (ruleData: any) => void;
}

const ManagerAdminPanel: React.FC<ManagerAdminPanelProps> = ({
  onIncidentCreate,
  onComplianceRuleCreate
}) => {
  const [dailyReports, setDailyReports] = useState<any>(null);
  const [, setTradingPairs] = useState<any[]>([]);
  const [showCreateIncident, setShowCreateIncident] = useState(false);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [newIncident, setNewIncident] = useState({
    incident_type: '',
    severity: 'medium',
    description: ''
  });
  const [newRule, setNewRule] = useState({
    rule_name: '',
    rule_type: '',
    rule_config: {},
    is_active: true
  });

  useEffect(() => {
    loadManagerData();
  }, []);

  const loadManagerData = async () => {
    try {
      const [reports, pairs] = await Promise.all([
        AdminService.getDailyReports(),
        AdminService.getTradingPairs()
      ]);
      setDailyReports(reports);
      setTradingPairs(pairs);
    } catch (error) {
      console.error('Failed to load manager data:', error);
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onIncidentCreate(newIncident);
      setNewIncident({ incident_type: '', severity: 'medium', description: '' });
      setShowCreateIncident(false);
    } catch (error) {
      console.error('Failed to create incident:', error);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onComplianceRuleCreate(newRule);
      setNewRule({ rule_name: '', rule_type: '', rule_config: {}, is_active: true });
      setShowCreateRule(false);
    } catch (error) {
      console.error('Failed to create compliance rule:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Manager Controls */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">🧭</span>
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
            Manager Operations
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowCreateIncident(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            + Create Incident
          </button>
          
          <button
            onClick={() => setShowCreateRule(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Add Compliance Rule
          </button>
          
          <button
            onClick={loadManagerData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Reports
          </button>
        </div>
      </div>

      {/* Daily Reports */}
      {dailyReports && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Trading Volume
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Volume:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ${dailyReports.total_volume.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Trades:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {dailyReports.total_trades.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Traders:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {dailyReports.active_traders}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              P&L Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total P&L:</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  +${dailyReports.pnl_summary.total_pnl.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Fees Collected:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ${dailyReports.pnl_summary.fees_collected.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Net Profit:</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  +${dailyReports.pnl_summary.net_profit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Trading Pairs */}
      {dailyReports?.top_pairs && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Trading Pairs
          </h3>
          <div className="space-y-3">
            {dailyReports.top_pairs.map((pair: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    #{index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {pair.pair}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    ${pair.volume.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {pair.trades} trades
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Incident Modal */}
      {showCreateIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create Incident
            </h3>
            
            <form onSubmit={handleCreateIncident} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Incident Type
                </label>
                <select
                  value={newIncident.incident_type}
                  onChange={(e) => setNewIncident({ ...newIncident, incident_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select type</option>
                  <option value="security_breach">Security Breach</option>
                  <option value="system_failure">System Failure</option>
                  <option value="trading_issue">Trading Issue</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Severity
                </label>
                <select
                  value={newIncident.severity}
                  onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Create Incident
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateIncident(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Compliance Rule Modal */}
      {showCreateRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create Compliance Rule
            </h3>
            
            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={newRule.rule_name}
                  onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rule Type
                </label>
                <select
                  value={newRule.rule_type}
                  onChange={(e) => setNewRule({ ...newRule, rule_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select type</option>
                  <option value="kyc">KYC Verification</option>
                  <option value="aml">AML Monitoring</option>
                  <option value="api_limits">API Rate Limits</option>
                  <option value="trading_limits">Trading Limits</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={newRule.is_active}
                  onChange={(e) => setNewRule({ ...newRule, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create Rule
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateRule(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerAdminPanel;
