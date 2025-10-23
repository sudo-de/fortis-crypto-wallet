import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from './contexts/WalletContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Send from './pages/Send';
import Receive from './pages/Receive';
import Settings from './pages/Settings';
import Security from './pages/Security';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WalletProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/send" element={<Send />} />
                  <Route path="/receive" element={<Receive />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/security" element={<Security />} />
                </Routes>
              </Layout>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </div>
          </Router>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
