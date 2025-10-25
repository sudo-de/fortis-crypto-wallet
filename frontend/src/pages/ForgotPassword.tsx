import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!email) {
        setError('Please enter your email address');
        return;
      }

      // Send forgot password request to PostgreSQL
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        setIsEmailSent(true);
      } else {
        setError(response.message || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Check Your Email
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="text-green-600 dark:text-green-400 text-sm">
              ✅ <strong>Email Sent Successfully!</strong> Please check your inbox and follow the instructions to reset your password.
            </div>
          </div>

          <div className="text-center space-y-4">
            <button
              onClick={handleBackToLogin}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
            >
              Back to Login
            </button>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setIsEmailSent(false)}
                className="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🔑</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        {/* Reset Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex">
                <div className="text-red-500 text-sm">⚠️ {error}</div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending reset link...
              </div>
            ) : (
              'Send Reset Link'
            )}
          </button>

          {/* Back to Login */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-sm text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
            >
              ← Back to Login
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <div className="text-blue-600 dark:text-blue-400 text-sm">
              🔒 <strong>Security:</strong> Password reset links expire in 1 hour for your security.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
