import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LiveClock from '../components/LiveClock';

const TwoFactorAuth: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'setup' | 'scan' | 'verify' | 'success' | 'manage'>('setup');
  const [progress, setProgress] = useState(0);
  const [qrCode, setQrCode] = useState('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMDAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5UUEEgU1FVQVJFPC90ZXh0Pjwvc3ZnPg==');
  const [secretKey, setSecretKey] = useState('JBSWY3DPEHPK3PXP');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes] = useState([
    '1234-5678-9012',
    '2345-6789-0123',
    '3456-7890-1234',
    '4567-8901-2345',
    '5678-9012-3456',
    '6789-0123-4567',
    '7890-1234-5678',
    '8901-2345-6789'
  ]);
  const [isEnabled, setIsEnabled] = useState(() => {
    // Check localStorage for existing 2FA status
    const saved = localStorage.getItem('twoFactorEnabled');
    return saved === 'true';
  });
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  const handleSetup = () => {
    setStep('scan');
    setProgress(25);
  };

  const handleScan = () => {
    setStep('verify');
    setProgress(50);
  };

  const handleVerify = () => {
    // Simulate verification
    if (verificationCode.length === 6) {
      setStep('success');
      setProgress(100);
      setIsEnabled(true);
      localStorage.setItem('twoFactorEnabled', 'true');
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('twoFactorStatusChanged', { detail: { enabled: true } }));
    }
  };

  const handleDisable = () => {
    setShowDisableConfirm(true);
  };

  const confirmDisable = () => {
    setIsEnabled(false);
    setStep('setup');
    setProgress(0);
    setShowDisableConfirm(false);
    localStorage.setItem('twoFactorEnabled', 'false');
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('twoFactorStatusChanged', { detail: { enabled: false } }));
  };

  const cancelDisable = () => {
    setShowDisableConfirm(false);
  };

  const ProgressBar = () => (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
      <div 
        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );

  const handleDownloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (step === 'success') {
    return (
      <Layout>
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/settings?tab=security')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Two-Factor Authentication</h1>
              </div>
              <div className="flex items-center space-x-4">
                <LiveClock />
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="crypto-card text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-green-600 dark:text-green-400 text-3xl">✓</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">2FA Successfully Enabled!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                Your account is now protected with two-factor authentication. Save your backup codes in a safe place.
              </p>
              <ProgressBar />
              <div className="flex justify-center space-x-3 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <span className="text-green-600 dark:text-green-400 font-medium">1. Download App ✓</span>
                <span className="text-green-600 dark:text-green-400 font-medium">2. Scan QR ✓</span>
                <span className="text-green-600 dark:text-green-400 font-medium">3. Verify ✓</span>
                <span className="text-green-600 dark:text-green-400 font-medium">4. Complete ✓</span>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-yellow-600 dark:text-yellow-400 text-xl">⚠️</span>
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Important: Save Your Backup Codes</h3>
                </div>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-4">
                  These codes can be used to access your account if you lose your authenticator device. Each code can only be used once.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {backupCodes.slice(0, 4).map((code, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-700 rounded px-3 py-2 font-mono text-sm text-gray-900 dark:text-gray-100">
                      {code}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleDownloadBackupCodes}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
                >
                  Download Backup Codes
                </button>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/settings?tab=security')}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Back to Settings
                </button>
                <button
                  onClick={() => setStep('manage')}
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Manage 2FA
                </button>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  if (step === 'manage') {
    return (
      <Layout>
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/settings?tab=security')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage 2FA</h1>
              </div>
              <div className="flex items-center space-x-4">
                <LiveClock />
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Status Card */}
            <div className="crypto-card">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-xl">🔐</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Two-Factor Authentication</h3>
                  <p className="text-green-600 dark:text-green-400 font-medium">✓ Enabled</p>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <p className="text-green-800 dark:text-green-200 text-sm">
                  Your account is protected with two-factor authentication. You'll need your authenticator app to sign in.
                </p>
              </div>

              <button
                onClick={handleDisable}
                className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Disable Two-Factor Authentication
              </button>
            </div>

            {/* Backup Codes */}
            <div className="crypto-card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Backup Codes</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Use these codes to access your account if you lose your authenticator device.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {backupCodes.map((code, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-3 py-2 font-mono text-sm text-gray-900 dark:text-gray-100">
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleDownloadBackupCodes}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Download Codes
                </button>
                <button className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                  Generate New Codes
                </button>
              </div>
            </div>

            {/* Authenticator App Info */}
            <div className="crypto-card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Authenticator Apps</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Use any of these popular authenticator apps to generate codes:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 dark:text-blue-400 text-lg">📱</span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Google Authenticator</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Free • iOS & Android</p>
                </div>
                <div className="text-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-600 dark:text-green-400 text-lg">🔐</span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Authy</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Free • Cross-platform</p>
                </div>
                <div className="text-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-600 dark:text-purple-400 text-lg">⚡</span>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Microsoft Authenticator</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Free • iOS & Android</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  if (step === 'scan') {
    return (
      <Layout>
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setStep('setup')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Scan QR Code</h1>
              </div>
              <div className="flex items-center space-x-4">
                <LiveClock />
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="crypto-card text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 dark:text-blue-400 text-3xl">📱</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Scan QR Code</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Open your authenticator app and scan this QR code to add your account.
              </p>
              <ProgressBar />
              <div className="flex justify-center space-x-3 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <span className="text-blue-600 dark:text-blue-400 font-medium">1. Download App ✓</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">2. Scan QR</span>
                <span className={`${progress >= 50 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}`}>3. Verify</span>
                <span className={`${progress >= 100 ? 'text-green-600 dark:text-green-400 font-medium' : ''}`}>4. Complete</span>
              </div>

              <div className="space-y-8">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                    <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                  </div>
                </div>

                {/* Manual Entry */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Can't scan the QR code?</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Enter this key manually in your authenticator app:
                  </p>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <code className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">{secretKey}</code>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep('setup')}
                    className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleScan}
                    className="flex-1 crypto-button"
                  >
                    I've Scanned the Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  if (step === 'verify') {
    return (
      <Layout>
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setStep('setup')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Verify Setup</h1>
              </div>
              <div className="flex items-center space-x-4">
                <LiveClock />
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-md mx-auto">
            <div className="crypto-card text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 dark:text-blue-400 text-2xl">🔍</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Verify Your Setup</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Enter the 6-digit code from your authenticator app to complete the setup.
              </p>
              <ProgressBar />
              <div className="flex justify-center space-x-3 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <span className="text-blue-600 dark:text-blue-400 font-medium">1. Download App ✓</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">2. Scan QR ✓</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">3. Verify</span>
                <span className={`${progress >= 100 ? 'text-green-600 dark:text-green-400 font-medium' : ''}`}>4. Complete</span>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center text-2xl font-mono tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>

                <button
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 6}
                  className="w-full crypto-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify & Enable 2FA
                </button>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    <strong>Can't find the code?</strong> Make sure your authenticator app is set to the correct time and try refreshing the code.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  // If 2FA is already enabled, show management page
  if (isEnabled && step === 'setup') {
    return (
      <Layout>
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/settings?tab=security')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Two-Factor Authentication</h1>
              </div>
              <div className="flex items-center space-x-4">
                <LiveClock />
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="crypto-card">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-green-600 dark:text-green-400 text-3xl">🔐</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Two-Factor Authentication is Enabled</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your account is protected with two-factor authentication. You can manage your settings below.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-green-600 dark:text-green-400 mb-8">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Status: Enabled</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Security Active</h3>
                  </div>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    Your account is protected with two-factor authentication. You'll need your authenticator app to sign in.
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setStep('manage')}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Manage 2FA
                  </button>
                  <button
                    onClick={handleDisable}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Disable 2FA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Disable Confirmation Modal */}
        {showDisableConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Disable Two-Factor Authentication</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to disable two-factor authentication? This will make your account less secure.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelDisable}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDisable}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Disable 2FA
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    );
  }

  return (
    <Layout>
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/settings?tab=security')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {isEnabled ? 'Two-Factor Authentication' : 'Setup Two-Factor Authentication'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <LiveClock />
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="crypto-card">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-green-600 dark:text-green-400 text-3xl">🔐</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Enable Two-Factor Authentication</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Add an extra layer of security to your account by requiring a code from your authenticator app.
                </p>
                <ProgressBar />
                <div className="flex justify-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className={`${progress >= 0 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}`}>1. Download App</span>
                  <span className={`${progress >= 25 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}`}>2. Scan QR</span>
                  <span className={`${progress >= 50 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}`}>3. Verify</span>
                  <span className={`${progress >= 100 ? 'text-green-600 dark:text-green-400 font-medium' : ''}`}>4. Complete</span>
                </div>
              </div>

            <div className="space-y-8">
              {/* Download App Instructions */}
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Download an Authenticator App</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Install one of these popular authenticator apps on your mobile device to get started.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <button className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer text-left w-full">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-blue-600 dark:text-blue-400 text-2xl">📱</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Google Authenticator</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Free • iOS & Android</p>
                  </button>
                  
                  <button className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all cursor-pointer text-left w-full">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-green-600 dark:text-green-400 text-2xl">🔐</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Authy</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Free • Cross-platform</p>
                  </button>
                  
                  <button className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all cursor-pointer text-left w-full">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-purple-600 dark:text-purple-400 text-2xl">⚡</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Microsoft Authenticator</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Free • iOS & Android</p>
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/settings?tab=security')}
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetup}
                  className="flex-1 crypto-button"
                >
                  Continue Setup
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default TwoFactorAuth;
