import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationCenter from './NotificationCenter';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {showSidebar && <Sidebar />}
      <div className="flex-1 flex flex-col">
        {children}
        
        {/* Notification Bell */}
        <button
          onClick={() => setIsNotificationCenterOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40"
        >
          <span className="text-2xl">🔔</span>
          {/* Notification Badge */}
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </button>

      </div>
      
      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
    </div>
  );
};

export default Layout;
