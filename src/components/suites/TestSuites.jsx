import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import ImportCSVModal from "./ImportCSVModal";
import ManualEntryModal from "./ManualEntryModal";

const API_BASE = "http://localhost:8080/api";

const TestSuites = () => {
  const [suites, setSuites] = useState([]);
  const [showImport, setShowImport] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const { token, user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  useEffect(() => {
    fetchSuites();
  }, []);

  const fetchSuites = () => {
    // FIXED #3: Filter suites based on role
    const endpoint = isAdmin ? `${API_BASE}/suites` : `${API_BASE}/suites/my-suites`;
    
    fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setSuites)
      .catch(console.error);
  };

  const executeSuite = async (suiteId) => {
    try {
      const res = await fetch(`${API_BASE}/suites/${suiteId}/execute`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      alert(`Suite execution started! Test Run ID: ${data.testRunId}`);
      fetchSuites();
    } catch (error) {
      alert("Failed to execute suite: " + error.message);
    }
  };

  const generateReport = async (suiteId) => {
    try {
      const res = await fetch(`${API_BASE}/suites/${suiteId}/report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      // FIXED #5: Open report in new tab
      if (data.reportPath) {
        const reportUrl = `http://localhost:8080/reports/suite-${suiteId}/suite-report.html`;
        window.open(reportUrl, '_blank');
      } else {
        alert(data.message || "Report generated successfully!");
      }
    } catch (error) {
      const errorData = await error.response?.json();
      if (errorData?.error === "Suite not executed") {
        alert(`${errorData.message}\n\nPlease execute the suite first.`);
      } else {
        alert("Failed to generate report: " + error.message);
      }
    }
  };

  const exportCSV = async (suiteId) => {
    try {
      const res = await fetch(`${API_BASE}/suites/${suiteId}/export/csv`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const error = await res.json();
        alert(error.message || "Failed to export CSV");
        return;
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `suite-${suiteId}-report.csv`;
      a.click();
    } catch (error) {
      alert("Failed to export CSV: " + error.message);
    }
  };

  // FIXED #9: Display clean role name
  const formatRole = (role) => {
    return role?.replace('ROLE_', '') || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {isAdmin ? 'All Test Suites' : 'My Test Suites'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowManual(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
          >
            <span className="w-4 h-4">+</span> Manual Entry
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span className="w-4 h-4">📤</span> Import CSV
          </button>
        </div>
      </div>

      {suites.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">
            {isAdmin ? 'No test suites available.' : 'You haven\'t created any test suites yet.'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Click "Manual Entry" or "Import CSV" to create your first suite.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {suites.map((suite) => (
            <div key={suite.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {suite.name}
                    </h3>
                    {/* FIXED #4: Show executor info for admin */}
                    {isAdmin && suite.createdBy && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        by {suite.createdBy.username} ({formatRole(suite.createdBy.roles?.[0])})
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {suite.description}
                  </p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>{suite.testCases?.length || 0} test cases</span>
                    <span
                      className={`font-semibold ${
                        suite.status === "PASSED" || suite.status === "COMPLETED"
                          ? "text-green-600"
                          : suite.status === "FAILED"
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {suite.status}
                    </span>
                    {suite.createdAt && (
                      <span>
                        Created: {new Date(suite.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => executeSuite(suite.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition flex items-center gap-1"
                    title="Execute suite"
                  >
                    <span className="w-4 h-4">▶️</span> Run
                  </button>
                  <button
                    onClick={() => generateReport(suite.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition flex items-center gap-1"
                    title="Generate and open report in new tab"
                  >
                    <span className="w-4 h-4">📄</span> Report
                  </button>
                  <button
                    onClick={() => exportCSV(suite.id)}
                    className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition flex items-center gap-1"
                    title="Export to CSV"
                  >
                    <span className="w-4 h-4">⬇️</span> CSV
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showImport && (
        <ImportCSVModal
          onClose={() => setShowImport(false)}
          onSuccess={fetchSuites}
        />
      )}
      {showManual && (
        <ManualEntryModal
          onClose={() => setShowManual(false)}
          onSuccess={fetchSuites}
        />
      )}
    </div>
  );
};

export default TestSuites;