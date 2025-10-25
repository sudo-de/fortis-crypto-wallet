import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminService from '../services/adminService';
import SuperAdminPanel from '../components/admin/SuperAdminPanel';
import ManagerAdminPanel from '../components/admin/ManagerAdminPanel';
import ModeratorPanel from '../components/admin/ModeratorPanel';

interface User {
  id: number;
  email: string;
  name: string;
  admin_level: string;
  permissions: string;
  is_active: boolean;
  created_at: string;
  last_login: string;
}

interface SystemStatus {
  status: string;
  uptime: string;
  database: string;
  total_users: number;
  active_users: number;
  new_users_24h: number;
  open_incidents: number;
  maintenance_mode: boolean;
}

interface Incident {
  id: number;
  incident_type: string;
  severity: string;
  description: string;
  status: string;
  created_at: string;
  resolved_at: string;
}

interface ComplianceRule {
  id: number;
  rule_name: string;
  rule_type: string;
  rule_config: any;
  is_active: boolean;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('user');

  // Get current user role from localStorage or API
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');
    
    if (userEmail && userName && userId) {
      const role = AdminService.getUserRole();
      setUserRole(role);
      setCurrentUser({
        id: parseInt(userId),
        email: userEmail,
        name: userName,
        admin_level: role,
        permissions: JSON.stringify(AdminService.getUserPermissions()),
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      });
    }
    
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Load system status
      const statusResponse = await fetch('http://localhost:8080/admin/system/status');
      const statusData = await statusResponse.json();
      if (statusData.success) {
        setSystemStatus(statusData.system_status);
      }

      // Load users
      const usersResponse = await fetch('http://localhost:8080/admin/users');
      const usersData = await usersResponse.json();
      if (usersData.success) {
        setUsers(usersData.users);
      }

      // Load incidents
      const incidentsResponse = await fetch('http://localhost:8080/admin/incidents');
      const incidentsData = await incidentsResponse.json();
      if (incidentsData.success) {
        setIncidents(incidentsData.incidents);
      }

      // Load compliance rules
      const complianceResponse = await fetch('http://localhost:8080/admin/compliance');
      const complianceData = await complianceResponse.json();
      if (complianceData.success) {
        setComplianceRules(complianceData.rules);
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeColor = (adminLevel: string) => {
    switch (adminLevel) {
      case 'super_admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'moderator': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canAccess = (permission: string) => {
    return AdminService.canAccess(permission);
  };

  // Handler functions for different admin operations
  const handleUserCreate = async (userData: any) => {
    try {
      const response = await AdminService.createUser(userData);
      if (response.success) {
        loadAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };


  const handleMaintenanceToggle = async (enabled: boolean) => {
    try {
      const response = await AdminService.toggleMaintenanceMode(enabled);
      if (response.success) {
        loadAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to toggle maintenance mode:', error);
    }
  };

  const handleIncidentCreate = async (incidentData: any) => {
    try {
      const response = await AdminService.createIncident(incidentData);
      if (response.success) {
        loadAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to create incident:', error);
    }
  };


  const handleComplianceRuleCreate = async (ruleData: any) => {
    try {
      const response = await AdminService.createComplianceRule(ruleData);
      if (response.success) {
        loadAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to create compliance rule:', error);
    }
  };

  const handleUserFreeze = async (userId: string, reason: string) => {
    try {
      const response = await AdminService.freezeUserAccount(userId, reason);
      if (response.success) {
        loadAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to freeze user:', error);
    }
  };

  const handlePasswordReset = async (userId: string) => {
    try {
      const response = await AdminService.resetUserPassword(userId);
      if (response.success) {
        // Show success message
        console.log('Password reset successful');
      }
    } catch (error) {
      console.error('Failed to reset password:', error);
    }
  };

  const handleSuspiciousActivity = async (activityData: any) => {
    try {
      const response = await AdminService.reportSuspiciousActivity(activityData);
      if (response.success) {
        loadAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to report suspicious activity:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🛡️ Admin Dashboard
              </h1>
              {currentUser && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(currentUser.admin_level)}`}>
                  {currentUser.admin_level.replace('_', ' ').toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'users', name: 'Users', icon: '👥' },
              { id: 'system', name: 'System', icon: '⚙️' },
              { id: 'incidents', name: 'Incidents', icon: '🚨' },
              { id: 'compliance', name: 'Compliance', icon: '📋' },
              { id: 'audit', name: 'Audit Logs', icon: '📝' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Role-based Admin Panels */}
        {userRole === 'super_admin' && activeTab === 'overview' && (
          <SuperAdminPanel
            onUserCreate={handleUserCreate}
            onMaintenanceToggle={handleMaintenanceToggle}
          />
        )}

        {userRole === 'admin' && activeTab === 'overview' && (
          <ManagerAdminPanel
            onIncidentCreate={handleIncidentCreate}
            onComplianceRuleCreate={handleComplianceRuleCreate}
          />
        )}

        {userRole === 'moderator' && activeTab === 'overview' && (
          <ModeratorPanel
            onUserFreeze={handleUserFreeze}
            onPasswordReset={handlePasswordReset}
            onSuspiciousActivity={handleSuspiciousActivity}
          />
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && userRole === 'user' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h3>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have admin privileges. Contact your administrator for access.
            </p>
          </div>
        )}

        {activeTab === 'overview' && !['super_admin', 'admin', 'moderator', 'user'].includes(userRole) && (
          <div className="space-y-6">
            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {systemStatus?.total_users || 0}
                    </p>
                  </div>
                  <div className="text-3xl">👥</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {systemStatus?.active_users || 0}
                    </p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Incidents</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {systemStatus?.open_incidents || 0}
                    </p>
                  </div>
                  <div className="text-3xl">🚨</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Status</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {systemStatus?.status || 'Unknown'}
                    </p>
                  </div>
                  <div className="text-3xl">🟢</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.admin_level)}`}>
                        {user.admin_level || 'user'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Incidents</h3>
                <div className="space-y-3">
                  {incidents.slice(0, 5).map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {incident.incident_type}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {incident.description}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && canAccess('can_manage_users') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                + Add User
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.admin_level)}`}>
                            {user.admin_level || 'user'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && canAccess('can_manage_settings') && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Management</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {systemStatus?.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Uptime:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {systemStatus?.uptime || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Database:</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {systemStatus?.database || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Maintenance Mode:</span>
                    <span className={`text-sm font-medium ${systemStatus?.maintenance_mode ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {systemStatus?.maintenance_mode ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                    Enable Maintenance Mode
                  </button>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    System Backup
                  </button>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Clear Cache
                  </button>
                  <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Emergency Shutdown
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Incident Management</h2>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                + Create Incident
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {incidents.map((incident) => (
                      <tr key={incident.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {incident.incident_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                            {incident.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {incident.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            incident.status === 'open' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          }`}>
                            {incident.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(incident.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                              View
                            </button>
                            <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                              Resolve
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && canAccess('can_manage_compliance') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Compliance Management</h2>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                + Add Rule
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Rule Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {complianceRules.map((rule) => (
                      <tr key={rule.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {rule.rule_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {rule.rule_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rule.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {rule.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(rule.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No audit logs available yet.</p>
            </div>
          </div>
        )}

        {/* Access Denied Message */}
        {!canAccess('can_manage_users') && activeTab === 'users' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h3>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to access user management.
            </p>
          </div>
        )}

        {!canAccess('can_manage_settings') && activeTab === 'system' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h3>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to access system settings.
            </p>
          </div>
        )}

        {!canAccess('can_manage_compliance') && activeTab === 'compliance' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h3>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to access compliance management.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
