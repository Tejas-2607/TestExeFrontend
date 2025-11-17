import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import StatCard from "../common/StatCard";
import MetricRow from "../common/MetricRow";

const API_BASE = "http://localhost:8080/api";

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [suites, setSuites] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE}/suites`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setSuites)
      .catch(console.error);
  }, [token]);

  const fetchAnalytics = async (suiteId) => {
    try {
      const res = await fetch(
        `${API_BASE}/suites/${suiteId}/analytics?days=7`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Test Suite
        </label>
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={selectedSuite || ""}
          onChange={(e) => {
            setSelectedSuite(e.target.value);
            fetchAnalytics(e.target.value);
          }}
        >
          <option value="">Select a suite...</option>
          {suites.map((suite) => (
            <option key={suite.id} value={suite.id}>
              {suite.name}
            </option>
          ))}
        </select>
      </div>
      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Tests"
              value={analytics.summary.totalTests}
              icon={<span className="w-6 h-6">📄</span>}
              color="bg-blue-500"
            />
            <StatCard
              title="Passed"
              value={analytics.summary.passed}
              icon={<span className="w-6 h-6">✅</span>}
              color="bg-green-500"
            />
            <StatCard
              title="Failed"
              value={analytics.summary.failed}
              icon={<span className="w-6 h-6">❌</span>}
              color="bg-red-500"
            />
            <StatCard
              title="Pass Rate"
              value={`${analytics.summary.passRate.toFixed(1)}%`}
              icon={<span className="w-6 h-6">📈</span>}
              color="bg-purple-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                Performance Metrics
              </h3>
              <div className="space-y-3">
                <MetricRow
                  label="Avg Duration"
                  value={`${analytics.summary.avgDurationMs.toFixed(0)}ms`}
                />
                <MetricRow
                  label="Stability"
                  value={`${analytics.summary.stability.toFixed(1)}%`}
                />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Trends (7 Days)</h3>
              <div className="space-y-2">
                {analytics.trends.data.slice(0, 5).map((trend, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{trend.date}</span>
                    <span className="font-semibold text-gray-800">
                      {trend.passRate.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {analytics.flakyTests.count > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-5 h-5 text-yellow-600">⚠️</span>
                Flaky Tests ({analytics.flakyTests.count})
              </h3>
              <div className="space-y-2">
                {analytics.flakyTests.tests.slice(0, 5).map((test, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-yellow-50 rounded"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {test.testName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {test.totalRuns} runs | {test.retryCount} retries
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-yellow-700">
                      Score: {test.flakyScore.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;
