import { useCallback, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../services/api";

const DEFAULT_MESSAGE =
  "The system is currently undergoing scheduled maintenance. Please check back later.";

const getCurrentRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return String(user?.role || "").replace(/^ROLE_/i, "").toUpperCase();
  } catch {
    return "";
  }
};

export default function MaintenanceNotice() {
  const [status, setStatus] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/settings/maintenance-status`
      );
      setStatus(response.data);
    } catch (error) {
      // Do not show a maintenance notice when the status endpoint itself is unavailable.
      console.warn("Could not check maintenance status:", error);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const intervalId = window.setInterval(fetchStatus, 30000);
    return () => window.clearInterval(intervalId);
  }, [fetchStatus]);

  const role = getCurrentRole();
  const isAdministrator = role === "ADMIN" || role === "SUPER_ADMIN";
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  if (!isAuthenticated || !status?.maintenanceActive || isAdministrator) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-slate-900/95 px-6 py-12 text-white"
    >
      <div className="w-full max-w-2xl rounded-2xl border border-amber-300/40 bg-slate-800 p-8 text-center shadow-2xl">
        <AlertTriangle
          aria-hidden="true"
          className="mx-auto mb-5 h-14 w-14 text-amber-400"
        />
        <h1 className="text-2xl font-bold">Scheduled maintenance</h1>
        <p className="mt-4 text-lg leading-8 text-slate-200">
          {status.message?.trim() || DEFAULT_MESSAGE}
        </p>
        <p className="mt-6 text-sm text-slate-400">
          Normal system functions will be available again when maintenance is
          complete.
        </p>
      </div>
    </div>
  );
}
