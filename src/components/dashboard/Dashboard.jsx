import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../common/StatCard';
import MetricRow from '../common/MetricRow';

const API_BASE = 'http://localhost:8080/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE}/runs/metrics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setStats)
      .catch(console.error);
  }, [token]);

  if (!stats) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Tests"
          value={stats.total}
          icon={<span className="w-6 h-6">📄</span>} // Replace with actual icon import if needed
          color="bg-blue-500"
        />
        <StatCard
          title="Passed"
          value={stats.passed}
          icon={<span className="w-6 h-6">✅</span>}
          color="bg-green-500"
        />
        <StatCard
          title="Failed"
          value={stats.failed}
          icon={<span className="w-6 h-6">❌</span>}
          color="bg-red-500"
        />
        <StatCard
          title="Pass Rate"
          value={`${stats.passRate.toFixed(1)}%`}
          icon={<span className="w-6 h-6">📈</span>}
          color="bg-purple-500"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <MetricRow label="Avg Duration" value={`${stats.avgDurationMs.toFixed(0)}ms`} />
            <MetricRow label="Stability (Last 10)" value={`${stats.stability.toFixed(1)}%`} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2">
              <span className="w-4 h-4">+</span> Create Test Suite
            </button>
            <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition flex items-center justify-center gap-2">
              <span className="w-4 h-4">▶️</span> Run Tests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;