import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Dashboard from '../dashboard/Dashboard';
import TestSuites from '../suites/TestSuites';
import TestRuns from '../runs/TestRuns';
import Analytics from '../analytics/Analytics';
import SettingsPage from '../settings/SettingsPage';

const Layout = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user, logout } = useAuth();

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: '🏠' },
    { id: 'suites', name: 'Test Suites', icon: '📁' },
    { id: 'runs', name: 'Test Runs', icon: '▶️' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'suites':
        return <TestSuites />;
      case 'runs':
        return <TestRuns />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Test Framework</h1>
          <p className="text-sm text-gray-600 mt-1">{user?.username}</p>
        </div>
        <nav className="p-4 space-y-2">
          {navigation.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="w-5 h-5">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <span className="w-5 h-5">🚪</span>
            Logout
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="ml-64 p-8">
        {renderPage()}
      </div>
    </div>
  );
};

export default Layout;