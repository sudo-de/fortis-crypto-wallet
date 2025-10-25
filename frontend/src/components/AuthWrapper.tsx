import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = authService.isAuthenticated();
      
      setIsAuthenticated(isAuth);
      setIsLoading(false);

      // If not authenticated and not on auth pages, redirect to login
      if (!isAuth && !isAuthPage(location.pathname)) {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  const isAuthPage = (pathname: string) => {
    return ['/login', '/register', '/forgot-password'].includes(pathname);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">₿</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading wallet...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and on auth pages, show auth pages
  if (!isAuthenticated && isAuthPage(location.pathname)) {
    return <>{children}</>;
  }

  // If not authenticated and not on auth pages, show loading (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show the main app
  return <>{children}</>;
};

export default AuthWrapper;
