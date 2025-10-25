import React, { useState, useEffect } from 'react';
import AdminService from '../../services/adminService';

interface ModeratorPanelProps {
  onUserFreeze: (userId: string, reason: string) => void;
  onPasswordReset: (userId: string) => void;
  onSuspiciousActivity: (activityData: any) => void;
}

const ModeratorPanel: React.FC<ModeratorPanelProps> = ({
  onUserFreeze,
  onPasswordReset,
  onSuspiciousActivity
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [freezeReason, setFreezeReason] = useState('');
  const [activityData, setActivityData] = useState({
    user_id: '',
    activity_type: '',
    description: '',
    severity: 'medium'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const userList = await AdminService.getAllUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleFreezeUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUserFreeze(selectedUser.id.toString(), freezeReason);
      setShowFreezeModal(false);
      setFreezeReason('');
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error('Failed to freeze user:', error);
    }
  };

  const handleReportActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSuspiciousActivity(activityData);
      setShowActivityModal(false);
      setActivityData({ user_id: '', activity_type: '', description: '', severity: 'medium' });
    } catch (error) {
      console.error('Failed to report activity:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Moderator Controls */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">🤝</span>
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
            Support Operations
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowActivityModal(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            + Report Suspicious Activity
          </button>
          
          <button
            onClick={loadUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh User List
          </button>
          
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Generate Support Report
          </button>
        </div>
      </div>

      {/* User Search */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredUsers.length} users found
          </div>
        </div>

        {/* User List */}
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.is_active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowFreezeModal(true);
                    }}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    disabled={!user.is_active}
                  >
                    Freeze
                  </button>
                  
                  <button
                    onClick={() => onPasswordReset(user.id.toString())}
                    className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Reset Password
                  </button>
                  
                  <button
                    onClick={() => {
                      setActivityData({ ...activityData, user_id: user.id.toString() });
                      setShowActivityModal(true);
                    }}
                    className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    Report
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Freeze User Modal */}
      {showFreezeModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Freeze User Account
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Freezing account for: <strong>{selectedUser.name}</strong> ({selectedUser.email})
              </p>
            </div>
            
            <form onSubmit={handleFreezeUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason for Freeze
                </label>
                <textarea
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Enter reason for freezing this account..."
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Freeze Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFreezeModal(false);
                    setSelectedUser(null);
                    setFreezeReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Report Suspicious Activity
            </h3>
            
            <form onSubmit={handleReportActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Activity Type
                </label>
                <select
                  value={activityData.activity_type}
                  onChange={(e) => setActivityData({ ...activityData, activity_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select type</option>
                  <option value="unusual_trading">Unusual Trading Pattern</option>
                  <option value="multiple_accounts">Multiple Account Usage</option>
                  <option value="suspicious_login">Suspicious Login Attempt</option>
                  <option value="fraudulent_activity">Fraudulent Activity</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Severity
                </label>
                <select
                  value={activityData.severity}
                  onChange={(e) => setActivityData({ ...activityData, severity: e.target.value })}
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
                  value={activityData.description}
                  onChange={(e) => setActivityData({ ...activityData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Describe the suspicious activity..."
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Report Activity
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowActivityModal(false);
                    setActivityData({ user_id: '', activity_type: '', description: '', severity: 'medium' });
                  }}
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

export default ModeratorPanel;
