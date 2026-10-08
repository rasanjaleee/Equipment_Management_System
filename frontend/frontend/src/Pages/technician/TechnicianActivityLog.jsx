import { useEffect, useState } from "react";
import { useData } from "../../context/DataContext";

export default function TechnicianActivityLog() {
  const { userActivityLogs: cachedLogs, refreshUserActivityLogs } = useData();
  const [logs, setLogs] = useState(cachedLogs || []);
  const [loading, setLoading] = useState(!cachedLogs || cachedLogs.length === 0);
  const [error, setError] = useState("");

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();
  const username = user?.username;

  useEffect(() => {
    if (cachedLogs && cachedLogs.length > 0) {
      setLogs(cachedLogs);
      setLoading(false);
    }
  }, [cachedLogs]);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }
    const fetchLogs = async () => {
      try {
        setError("");
        const data = await refreshUserActivityLogs(username, false);
        if (Array.isArray(data)) {
          setLogs(data);
        }
      } catch (err) {
        console.error("Failed to fetch technician logs:", err);
        if (!cachedLogs || cachedLogs.length === 0) {
          setError("Failed to load your activity logs");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [username, refreshUserActivityLogs]);

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
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-6">My Activity</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white shadow-2xl overflow-x-auto rounded-lg">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-yellow-500 text-white">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Equipment ID</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>

          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="border-b text-center">
                  <td className="px-4 py-3">{formatTimestamp(log.timestamp)}</td>
                  <td className="px-4 py-3">{formatAction(log.action)}</td>
                  <td className="px-4 py-3">{log.equipmentId ?? "-"}</td>
                  <td className="px-4 py-3">{log.details || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-8 text-center text-gray-500">
                  No activity found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}