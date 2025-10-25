import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  twoFactorEnabled: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    transactions: boolean;
    largeTransactions: boolean;
    failedTransactions: boolean;
    loginAlerts: boolean;
    securityUpdates: boolean;
    passwordChanges: boolean;
    marketing: boolean;
    marketUpdates: boolean;
    productUpdates: boolean;
  };
  privacy: {
    showBalance: boolean;
    showTransactions: boolean;
    allowAnalytics: boolean;
    showProfile: boolean;
    allowMarketing: boolean;
    allowLocation: boolean;
  };
  security: {
    sessionTimeout: number; // in minutes
    requirePasswordForTransactions: boolean;
    autoLock: boolean;
    transactionLimits: boolean;
    suspiciousActivityAlerts: boolean;
    biometricAuth: boolean;
    ipWhitelist: boolean;
    securityAlerts: boolean;
    hardwareSecurityModule: boolean;
    multiSignature: boolean;
  };
  preferences: {
    currency: string;
    language: string;
    timezone: string;
    numberFormat: string;
    dateFormat: string;
    theme: string;
    transactionSpeed: string;
    priceAlertThreshold: string;
    autoRefreshInterval: string;
    fontSize: string;
    highContrastMode: boolean;
    soundEffects: boolean;
    developerMode: boolean;
    autoSave: boolean;
    colorScheme: string;
    autoDarkMode: boolean;
    sidebarPosition: string;
    compactMode: boolean;
    gridDensity: string;
    animations: boolean;
    particleEffects: boolean;
    glassmorphism: boolean;
    autoCleanup: boolean;
    cacheSizeLimit: string;
    cloudBackup: boolean;
    autoSync: boolean;
    debugLogging: boolean;
    performanceMonitoring: boolean;
    betaFeatures: boolean;
    aiAssistant: boolean;
    predictiveAnalytics: boolean;
  };
}

interface UserContextType {
  user: User | null;
  updateUser: (updates: Partial<User>) => void;
  updateNotifications: (notifications: Partial<User['notifications']>) => void;
  updatePrivacy: (privacy: Partial<User['privacy']>) => void;
  updateSecurity: (security: Partial<User['security']>) => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => void;
  login: (userData: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: User = {
  id: '1',
  name: 'Sudo De',
  email: 'sudo.de@xcryptovault.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  joinDate: '2023-01-15',
  twoFactorEnabled: true,
  notifications: {
    email: true,
    push: true,
    sms: false,
    transactions: true,
    largeTransactions: true,
    failedTransactions: true,
    loginAlerts: true,
    securityUpdates: true,
    passwordChanges: true,
    marketing: false,
    marketUpdates: true,
    productUpdates: true,
  },
  privacy: {
    showBalance: true,
    showTransactions: false,
    allowAnalytics: true,
    showProfile: true,
    allowMarketing: false,
    allowLocation: false,
  },
  security: {
    sessionTimeout: 30,
    requirePasswordForTransactions: true,
    autoLock: true,
    transactionLimits: true,
    suspiciousActivityAlerts: true,
    biometricAuth: false,
    ipWhitelist: false,
    securityAlerts: true,
    hardwareSecurityModule: false,
    multiSignature: false,
  },
  preferences: {
    currency: 'USD',
    language: 'en',
    timezone: 'UTC',
    numberFormat: 'US',
    dateFormat: 'MM/DD/YYYY',
    theme: 'dark',
    transactionSpeed: 'medium',
    priceAlertThreshold: '5',
    autoRefreshInterval: '30',
    fontSize: 'medium',
    highContrastMode: false,
    soundEffects: true,
    developerMode: false,
    autoSave: true,
    colorScheme: 'dark',
    autoDarkMode: false,
    sidebarPosition: 'left',
    compactMode: false,
    gridDensity: 'normal',
    animations: true,
    particleEffects: false,
    glassmorphism: false,
    autoCleanup: true,
    cacheSizeLimit: '1000',
    cloudBackup: false,
    autoSync: false,
    debugLogging: false,
    performanceMonitoring: false,
    betaFeatures: false,
    aiAssistant: false,
    predictiveAnalytics: false,
  },
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(defaultUser);

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const updateNotifications = (notifications: Partial<User['notifications']>) => {
    setUser(prev => prev ? { 
      ...prev, 
      notifications: { ...prev.notifications, ...notifications } 
    } : null);
  };

  const updatePrivacy = (privacy: Partial<User['privacy']>) => {
    setUser(prev => prev ? { 
      ...prev, 
      privacy: { ...prev.privacy, ...privacy } 
    } : null);
  };

  const updateSecurity = (security: Partial<User['security']>) => {
    setUser(prev => prev ? { 
      ...prev, 
      security: { ...prev.security, ...security } 
    } : null);
  };

  const updatePreferences = (preferences: Partial<User['preferences']>) => {
    setUser(prev => prev ? { 
      ...prev, 
      preferences: { ...prev.preferences, ...preferences } 
    } : null);
  };

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{
      user,
      updateUser,
      updateNotifications,
      updatePrivacy,
      updateSecurity,
      updatePreferences,
      login,
      logout,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
