"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RiskLevel } from "@/lib/utils/riskScoring";

interface RiskLogEntry {
  timestamp: string;
  query: string;
  response: string;
  riskScore: RiskLevel;
  triggers: string[];
  source?: string;
  escalated: boolean;
}

export default function AdminPage() {
  const [logs, setLogs] = useState<RiskLogEntry[]>([]);
  
  useEffect(() => {
    // Load logs from localStorage on client side
    const storedLogs = localStorage.getItem('hrChatRiskLogs');
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    }
  }, []);
  
  const getRiskLevelLabel = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.HIGH:
        return "High";
      case RiskLevel.MEDIUM:
        return "Medium";
      case RiskLevel.LOW:
        return "Low";
      default:
        return "Unknown";
    }
  };
  
  const getRiskLevelColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.HIGH:
        return "bg-red-100 text-red-800";
      case RiskLevel.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case RiskLevel.LOW:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100";
    }
  };
  
  const clearLogs = () => {
    localStorage.removeItem('hrChatRiskLogs');
    setLogs([]);
  };
  
  return (
    <div className="p-6 max-w-6xl mx-auto bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Aggregate Risk Monitoring Dashboard</h1>
        <div className="space-x-4">
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Employee Selection
          </Link>
          <button
            onClick={clearLogs}
            className="bg-red-50 text-red-600 px-3 py-1 rounded border border-red-200 hover:bg-red-100"
          >
            Clear Logs
          </button>
        </div>
      </div>
      
      {logs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No risk logs available
        </div>
      ) : (
        <div className="overflow-auto rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="py-3 px-4 text-left">Timestamp</th>
                <th className="py-3 px-4 text-left">Query</th>
                <th className="py-3 px-4 text-left">Response Preview</th>
                <th className="py-3 px-4 text-left">Risk Level</th>
                <th className="py-3 px-4 text-left">Triggers</th>
                <th className="py-3 px-4 text-left">Sources</th>
                <th className="py-3 px-4 text-center">Escalated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    {log.query.substring(0, 30)}
                    {log.query.length > 30 ? "..." : ""}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    {log.response.substring(0, 30)}
                    {log.response.length > 30 ? "..." : ""}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(log.riskScore)}`}>
                      {getRiskLevelLabel(log.riskScore)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    {log.triggers.join(", ")}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {log.source || "-"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {log.escalated ? (
                      <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
                    ) : (
                      <span className="w-3 h-3 bg-gray-200 rounded-full inline-block"></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Risk Level Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-700">
              {logs.filter(log => log.riskScore === RiskLevel.LOW).length}
            </div>
            <div className="text-green-600">Low Risk Responses</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-700">
              {logs.filter(log => log.riskScore === RiskLevel.MEDIUM).length}
            </div>
            <div className="text-yellow-600">Medium Risk Responses</div>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <div className="text-3xl font-bold text-red-700">
              {logs.filter(log => log.riskScore === RiskLevel.HIGH).length}
            </div>
            <div className="text-red-600">High Risk Responses</div>
          </div>
        </div>
      </div>
    </div>
  );
} 