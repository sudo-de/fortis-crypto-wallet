interface AdminUser {
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

interface AuditLog {
  id: number;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: any;
  ip_address: string;
  created_at: string;
}

class AdminService {
  private baseUrl = 'http://localhost:8080';

  // Super Admin Functions (Full System Access)
  async getSystemStatus(): Promise<SystemStatus> {
    const response = await fetch(`${this.baseUrl}/admin/system/status`);
    const data = await response.json();
    return data.system_status;
  }

  async toggleMaintenanceMode(enabled: boolean, message?: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/system/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        maintenance_mode: enabled,
        message: message || 'System maintenance in progress'
      })
    });
    return response.json();
  }

  async getAllUsers(): Promise<AdminUser[]> {
    const response = await fetch(`${this.baseUrl}/admin/users`);
    const data = await response.json();
    return data.users || [];
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    admin_level?: string;
    permissions?: any;
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  }

  async updateUser(userId: string, userData: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  }

  async deleteUser(userId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/users/${userId}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  // Manager-Level Admin Functions (Day-to-day Operations)
  async getIncidents(): Promise<Incident[]> {
    const response = await fetch(`${this.baseUrl}/admin/incidents`);
    const data = await response.json();
    return data.incidents || [];
  }

  async createIncident(incidentData: {
    incident_type: string;
    severity: string;
    description: string;
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidentData)
    });
    return response.json();
  }

  async resolveIncident(incidentId: string, resolutionData: {
    status: string;
    resolution_notes?: string;
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/incidents/${incidentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resolutionData)
    });
    return response.json();
  }

  // Compliance Management
  async getComplianceRules(): Promise<ComplianceRule[]> {
    const response = await fetch(`${this.baseUrl}/admin/compliance`);
    const data = await response.json();
    return data.rules || [];
  }

  async createComplianceRule(ruleData: {
    rule_name: string;
    rule_type: string;
    rule_config: any;
    is_active?: boolean;
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/compliance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ruleData)
    });
    return response.json();
  }

  // System Settings
  async getSystemSettings(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/settings`);
    const data = await response.json();
    return data.settings || {};
  }

  async updateSystemSettings(settings: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return response.json();
  }

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const response = await fetch(`${this.baseUrl}/admin/audit`);
    const data = await response.json();
    return data.logs || [];
  }

  // Role-based Access Control
  getUserRole(): string {
    const userEmail = localStorage.getItem('userEmail');
    // In a real implementation, this would come from the API
    // For demo purposes, we'll check if it's the admin user
    if (userEmail === 'admin@xcryptovault.com') {
      return 'super_admin';
    }
    if (userEmail === 'sudo.de@xcryptovault.com') {
      return 'admin';
    }
    return 'user';
  }

  getUserPermissions(): any {
    const role = this.getUserRole();
    
    switch (role) {
      case 'super_admin':
        return {
          can_manage_users: true,
          can_manage_settings: true,
          can_manage_compliance: true,
          can_manage_incidents: true,
          can_view_audit_logs: true,
          can_toggle_maintenance: true,
          can_create_admins: true,
          can_delete_users: true
        };
      
      case 'admin':
        return {
          can_manage_users: true,
          can_manage_settings: false,
          can_manage_compliance: true,
          can_manage_incidents: true,
          can_view_audit_logs: true,
          can_toggle_maintenance: false,
          can_create_admins: false,
          can_delete_users: false
        };
      
      case 'moderator':
        return {
          can_manage_users: false,
          can_manage_settings: false,
          can_manage_compliance: false,
          can_manage_incidents: true,
          can_view_audit_logs: false,
          can_toggle_maintenance: false,
          can_create_admins: false,
          can_delete_users: false
        };
      
      default:
        return {
          can_manage_users: false,
          can_manage_settings: false,
          can_manage_compliance: false,
          can_manage_incidents: false,
          can_view_audit_logs: false,
          can_toggle_maintenance: false,
          can_create_admins: false,
          can_delete_users: false
        };
    }
  }

  canAccess(feature: string): boolean {
    const permissions = this.getUserPermissions();
    return permissions[feature] === true;
  }

  // Trading Operations (Manager-Level)
  async getTradingPairs(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/trading/pairs`);
    const data = await response.json();
    return data.pairs || [];
  }

  async updateTradingPair(pairId: string, pairData: any): Promise<any> {
    // This would be implemented based on your trading API
    console.log('Updating trading pair:', pairId, pairData);
    return { success: true };
  }

  async getDailyReports(): Promise<any> {
    // Mock daily reports data
    return {
      total_volume: 1250000,
      total_trades: 3420,
      active_traders: 156,
      top_pairs: [
        { pair: 'BTC/USDT', volume: 450000, trades: 1200 },
        { pair: 'ETH/USDT', volume: 380000, trades: 980 },
        { pair: 'SOL/USDT', volume: 290000, trades: 750 }
      ],
      pnl_summary: {
        total_pnl: 125000,
        fees_collected: 12500,
        net_profit: 112500
      }
    };
  }

  // Support Operations (Moderator-Level)
  async getUserInfo(userId: string): Promise<any> {
    // This would fetch user details for support purposes
    const users = await this.getAllUsers();
    return users.find(user => user.id.toString() === userId);
  }

  async freezeUserAccount(userId: string, reason: string): Promise<any> {
    // This would implement account freezing
    console.log('Freezing account:', userId, 'Reason:', reason);
    return { success: true };
  }

  async resetUserPassword(userId: string): Promise<any> {
    // This would implement password reset
    console.log('Resetting password for user:', userId);
    return { success: true };
  }

  async reportSuspiciousActivity(activityData: {
    user_id: string;
    activity_type: string;
    description: string;
    severity: string;
  }): Promise<any> {
    return this.createIncident({
      incident_type: 'suspicious_activity',
      severity: activityData.severity,
      description: `Suspicious activity reported: ${activityData.description}`
    });
  }
}

export default new AdminService();
