import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AuthWrapper from './components/AuthWrapper';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Preferences from './pages/Preferences';
import Portfolio from './pages/Portfolio';
import Transactions from './pages/Transactions';
import Send from './pages/Send';
import Receive from './pages/Receive';
import Exchange from './pages/Exchange';
import Trading from './pages/Trading';
import Database from './pages/Database';
import Staking from './pages/Staking';
import NFTs from './pages/NFTs';
import Help from './pages/Help';
import ChangePassword from './pages/ChangePassword';
import TwoFactorAuth from './pages/TwoFactorAuth';
import Devices from './pages/Devices';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Crypto Logo */}
        <div className="flex justify-center">
          <img 
            src="/crypto-logo.svg" 
            alt="Crypto Logo" 
            className="w-24 h-24 animate-pulse"
          />
        </div>
        
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          XCryptoVault
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Cryptocurrency vault and trading platform
        </p>
        
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 font-medium">
            Secure vault technology • Multi-chain support
          </span>
        </div>
        
        {/* Crypto Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="crypto-card">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure</h3>
            <p className="text-gray-600">Military-grade vault security</p>
          </div>
          <div className="crypto-card">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast</h3>
            <p className="text-gray-600">Lightning-fast transactions</p>
          </div>
          <div className="crypto-card">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Chain</h3>
            <p className="text-gray-600">Cross-chain vault technology</p>
          </div>
        </div>

        {/* Navigation to Login */}
        <div className="mt-12 space-x-4">
          <Link 
            to="/login" 
            className="crypto-button inline-flex items-center space-x-2 text-lg px-8 py-4"
          >
            <span>🔐</span>
            <span>Sign In</span>
          </Link>
          <Link 
            to="/register" 
            className="crypto-button inline-flex items-center space-x-2 text-lg px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <span>📝</span>
            <span>Sign Up</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected Routes */}
          <Route path="/*" element={
            <AuthWrapper>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/preferences" element={<Preferences />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/send" element={<Send />} />
                <Route path="/receive" element={<Receive />} />
                <Route path="/exchange" element={<Exchange />} />
                <Route path="/trading" element={<Trading />} />
                <Route path="/database" element={<Database />} />
                <Route path="/staking" element={<Staking />} />
                <Route path="/nfts" element={<NFTs />} />
                <Route path="/help" element={<Help />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/two-factor-auth" element={<TwoFactorAuth />} />
                <Route path="/devices" element={<Devices />} />
              </Routes>
            </AuthWrapper>
          } />
        </Routes>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
