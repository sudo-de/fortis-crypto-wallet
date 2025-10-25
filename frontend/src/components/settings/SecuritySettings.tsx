import React from 'react';
import { useNavigate } from 'react-router-dom';

const SecuritySettings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Security Settings
      </h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Password</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Update your password</p>
          </div>
          <button
            onClick={() => navigate('/change-password')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Change
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
          </div>
          <button
            onClick={() => navigate('/two-factor-auth')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Enable
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
