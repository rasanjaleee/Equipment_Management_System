import { useEffect, useState } from "react";
import axios from "axios";

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:8080/api/activity-logs", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setLogs(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch activity logs:", err);
      setError("Failed to load activity logs");
    }
  };

  const formatRole = (role) => {
    if (!role) return "-";
    return role.replace("ROLE_", "");
  };

  const formatAction = (action) => {
    if (!action) return "-";
    return action.replace(/_/g, " ");
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "-";
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-8 min-h-full">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Activity Log</h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white shadow-2xl overflow-x-auto rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-yellow-500 text-white">
              <tr>
                <th className="px-4 py-3 text-center">ID</th>
                <th className="px-4 py-3 text-center">Time</th>
                <th className="px-4 py-3 text-center">Username</th>
                <th className="px-4 py-3 text-center">Role</th>
                <th className="px-4 py-3 text-center">Action</th>
                <th className="px-4 py-3 text-center">Equipment ID</th>
                <th className="px-4 py-3 text-center">Details</th>
              </tr>
            </thead>

            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="border-b text-center hover:bg-gray-50">
                    <td className="px-4 py-3">{log.id}</td>
                    <td className="px-4 py-3">{formatTimestamp(log.timestamp)}</td>
                    <td className="px-4 py-3">{log.username || "-"}</td>
                    <td className="px-4 py-3">{formatRole(log.role)}</td>
                    <td className="px-4 py-3">{formatAction(log.action)}</td>
                    <td className="px-4 py-3">{log.equipmentId ?? "-"}</td>
                    <td className="px-4 py-3">{log.details || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No activity logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}