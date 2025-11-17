import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import ImportCSVModal from "./ImportCSVModal";
import ManualEntryModal from "./ManualEntryModal";

const API_BASE = "http://localhost:8080/api";

const TestSuites = () => {
  const [suites, setSuites] = useState([]);
  const [showImport, setShowImport] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchSuites();
  }, []);

  const fetchSuites = () => {
    fetch(`${API_BASE}/suites`, {
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
      alert("Report generated successfully!");
    } catch (error) {
      alert("Failed to generate report: " + error.message);
    }
  };

  const exportCSV = async (suiteId) => {
    try {
      const res = await fetch(`${API_BASE}/suites/${suiteId}/export/csv`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Test Suites</h2>
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
      <div className="grid grid-cols-1 gap-4">
        {suites.map((suite) => (
          <div key={suite.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {suite.name}
                </h3>
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
                        : "text-teal-600"
                    }`}
                  >
                    {suite.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => executeSuite(suite.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition flex items-center gap-1"
                >
                  <span className="w-4 h-4">▶️</span> Run
                </button>
                <button
                  onClick={() => generateReport(suite.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition flex items-center gap-1"
                >
                  <span className="w-4 h-4">📄</span> Report
                </button>
                <button
                  onClick={() => exportCSV(suite.id)}
                  className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition flex items-center gap-1"
                >
                  <span className="w-4 h-4">⬇️</span> CSV
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
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
