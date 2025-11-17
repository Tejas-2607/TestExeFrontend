import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../common/StatCard';
import MetricRow from '../common/MetricRow';

const API_BASE = 'http://localhost:8080/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const { token, user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  useEffect(() => {
    // FIXED: Only fetch metrics if user is admin
    if (isAdmin) {
      fetch(`${API_BASE}/runs/metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch metrics');
          return res.json();
        })
        .then(setStats)
        .catch(err => {
          console.error('Metrics error:', err);
          // Set default stats for graceful degradation
          setStats({
            total: 0,
            passed: 0,
            failed: 0,
            passRate: 0,
            avgDurationMs: 0,
            stability: 0
          });
        });
    } else {
      // FIXED: For users, fetch their personal stats
      fetch(`${API_BASE}/users/me/tests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setStats({
            total: data.totalTests || 0,
            passed: data.passedTests || 0,
            failed: data.failedTests || 0,
            passRate: data.passRate || 0,
            avgDurationMs: 0,
            stability: 0
          });
        })
        .catch(err => {
          console.error('User stats error:', err);
          setStats({
            total: 0,
            passed: 0,
            failed: 0,
            passRate: 0,
            avgDurationMs: 0,
            stability: 0
          });
        });
    }
  }, [token, isAdmin]);

  if (!stats) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">
        {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Tests"
          value={stats.total}
          icon={<span className="w-6 h-6">📄</span>}
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
      
      {isAdmin && (
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
      )}
    </div>
  );
};

export default Dashboard;