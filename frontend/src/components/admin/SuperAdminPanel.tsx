import React, { useState, useEffect } from 'react';
import AdminService from '../../services/adminService';

interface SuperAdminPanelProps {
  onUserCreate: (userData: any) => void;
  onMaintenanceToggle: (enabled: boolean) => void;
}

const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({
  onUserCreate,
  onMaintenanceToggle
}) => {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    admin_level: 'user',
    permissions: {}
  });

  useEffect(() => {
    loadSystemStatus();
  }, []);

  const loadSystemStatus = async () => {
    try {
      const status = await AdminService.getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error('Failed to load system status:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUserCreate(newUser);
      setNewUser({ name: '', email: '', password: '', admin_level: 'user', permissions: {} });
      setShowCreateUser(false);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleMaintenanceToggle = async (enabled: boolean) => {
    try {
      await onMaintenanceToggle(enabled);
      setShowMaintenanceModal(false);
      loadSystemStatus();
    } catch (error) {
      console.error('Failed to toggle maintenance mode:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Controls */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">🛡️</span>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
            Super Admin Controls
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setShowCreateUser(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Create Admin User
          </button>
          
          <button
            onClick={() => setShowMaintenanceModal(true)}
            className={`px-4 py-2 rounded-lg ${
              systemStatus?.maintenance_mode
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            {systemStatus?.maintenance_mode ? 'Disable Maintenance' : 'Enable Maintenance'}
          </button>
        </div>
      </div>

      {/* System Status */}
      {systemStatus && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {systemStatus.total_users}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {systemStatus.active_users}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {systemStatus.open_incidents}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Open Incidents</div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New User
            </h3>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Admin Level
                </label>
                <select
                  value={newUser.admin_level}
                  onChange={(e) => setNewUser({ ...newUser, admin_level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Maintenance Mode
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {systemStatus?.maintenance_mode
                ? 'Disable maintenance mode to restore normal operations?'
                : 'Enable maintenance mode to perform system updates?'}
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleMaintenanceToggle(!systemStatus?.maintenance_mode)}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  systemStatus?.maintenance_mode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                {systemStatus?.maintenance_mode ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminPanel;
