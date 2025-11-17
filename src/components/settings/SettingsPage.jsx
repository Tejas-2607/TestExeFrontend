import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MetricRow from '../common/MetricRow';

const SettingsPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">User Information</h3>
        <div className="space-y-3">
          <MetricRow label="Username" value={user?.username} />
          <MetricRow label="Email" value={user?.email} />
          <MetricRow
            label="Roles"
            value={user?.roles?.join(', ') || 'USER'}
          />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition flex items-center gap-2"
        >
          <span className="w-4 h-4">🚪</span> Logout
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;