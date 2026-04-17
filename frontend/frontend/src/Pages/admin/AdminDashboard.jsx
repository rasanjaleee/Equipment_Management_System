import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Package,
  TrendingUp,
  Wrench,
  Building2,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function AdminDashboard() {
  const [equipment, setEquipment] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getErrorMessage = (err, fallback = "Failed to load dashboard") => {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      (typeof err?.response?.data === "string" ? err.response.data : null) ||
      err?.message ||
      fallback
    );
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const results = await Promise.allSettled([
        axios.get("http://localhost:8080/api/equipment/all", { headers }),
        axios.get("http://localhost:8080/api/maintenance", { headers }),
        axios.get("http://localhost:8080/api/activity-logs", { headers }),
        axios.get("http://localhost:8080/api/laboratories", { headers }),
      ]);

      const [equipmentRes, maintenanceRes, activityRes, labRes] = results;

      setEquipment(
        equipmentRes.status === "fulfilled" && Array.isArray(equipmentRes.value.data)
          ? equipmentRes.value.data
          : []
      );

      setMaintenance(
        maintenanceRes.status === "fulfilled" && Array.isArray(maintenanceRes.value.data)
          ? maintenanceRes.value.data
          : []
      );

      setActivityLogs(
        activityRes.status === "fulfilled" && Array.isArray(activityRes.value.data)
          ? activityRes.value.data
          : []
      );

      setLaboratories(
        labRes.status === "fulfilled" && Array.isArray(labRes.value.data)
          ? labRes.value.data
          : []
      );
    } catch (err) {
      console.error("Dashboard load failed:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalEquipment = equipment.length;
    const working = equipment.filter((item) => item.status === "WORKING").length;
    const underRepair = equipment.filter((item) => item.status === "UNDER_REPAIR").length;
    const broken = equipment.filter((item) => item.status === "BROKEN").length;

    const pendingMaintenance = maintenance.filter(
      (item) =>
        item?.status === "PENDING" ||
        item?.status === "OPEN" ||
        item?.status === "IN_PROGRESS"
    ).length;

    const completedThisMonth = maintenance.filter((item) => {
      const status = item?.status;
      if (status !== "COMPLETED" && status !== "DONE") return false;

      const dateValue =
        item?.completedDate || item?.updatedAt || item?.date || item?.createdAt;
      if (!dateValue) return false;

      const d = new Date(dateValue);
      const now = new Date();

      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }).length;

    const overdueReturns = 0; // update later if your issuance API has due dates
    const borrowedItems = 0; // update later if your issuance API is connected

    return {
      totalEquipment,
      working,
      underRepair,
      broken,
      laboratories: laboratories.length,
      pendingMaintenance,
      completedThisMonth,
      overdueReturns,
      borrowedItems,
    };
  }, [equipment, maintenance, laboratories]);

  const equipmentStatusData = [
    { name: "Working", value: stats.working },
    { name: "Under Repair", value: stats.underRepair },
    { name: "Broken", value: stats.broken },
  ];

  const equipmentStatusColors = ["#22c55e", "#eab308", "#ef4444"];

  const maintenanceChartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts = new Array(12).fill(0);

    maintenance.forEach((item) => {
      const dateValue = item?.createdAt || item?.date || item?.updatedAt;
      if (!dateValue) return;

      const d = new Date(dateValue);
      if (Number.isNaN(d.getTime())) return;
      counts[d.getMonth()] += 1;
    });

    return months.map((month, index) => ({
      month,
      count: counts[index],
    }));
  }, [maintenance]);

  const recentActivities = useMemo(() => {
    return [...activityLogs]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 6);
  }, [activityLogs]);

  const topLaboratories = useMemo(() => {
    const map = {};

    equipment.forEach((item) => {
      const lab = item?.laboratory || "Unknown";
      map[lab] = (map[lab] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [equipment]);

  const alerts = useMemo(() => {
    const list = [];

    if (stats.broken > 0) {
      list.push({
        type: "danger",
        title: "Broken equipment detected",
        message: `${stats.broken} equipment item(s) need attention.`,
      });
    }

    if (stats.underRepair > 0) {
      list.push({
        type: "warning",
        title: "Equipment under repair",
        message: `${stats.underRepair} item(s) are currently under repair.`,
      });
    }

    if (stats.pendingMaintenance > 0) {
      list.push({
        type: "info",
        title: "Pending maintenance tasks",
        message: `${stats.pendingMaintenance} maintenance task(s) are pending.`,
      });
    }

    if (list.length === 0) {
      list.push({
        type: "success",
        title: "System looks healthy",
        message: "No urgent equipment or maintenance alerts right now.",
      });
    }

    return list;
  }, [stats]);

  const formatAction = (value) => {
    if (!value) return "-";
    return value.replace(/_/g, " ");
  };

  const formatRole = (value) => {
    if (!value) return "-";
    return value.replace("ROLE_", "");
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow p-8 text-gray-600">
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Equipment Management System Overview</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Equipment"
            value={stats.totalEquipment}
            subtitle="All registered items"
            icon={Package}
            accent="blue"
          />
          <StatCard
            title="Operational"
            value={stats.working}
            subtitle="Currently working"
            icon={CheckCircle2}
            accent="green"
          />
          <StatCard
            title="Under Repair"
            value={stats.underRepair}
            subtitle="Needs follow-up"
            icon={Wrench}
            accent="yellow"
          />
          <StatCard
            title="Broken"
            value={stats.broken}
            subtitle="Requires attention"
            icon={AlertTriangle}
            accent="red"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <MiniCard
            title="Laboratories"
            value={stats.laboratories}
            icon={Building2}
          />
          <MiniCard
            title="Pending Maintenance"
            value={stats.pendingMaintenance}
            icon={Clock3}
          />
          <MiniCard
            title="Completed This Month"
            value={stats.completedThisMonth}
            icon={TrendingUp}
          />
          <MiniCard
            title="Activity Records"
            value={activityLogs.length}
            icon={Activity}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 xl:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Equipment Status</h2>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={equipmentStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={55}
                    paddingAngle={3}
                  >
                    {equipmentStatusData.map((entry, index) => (
                      <Cell key={entry.name} fill={equipmentStatusColors[index % equipmentStatusColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Maintenance Overview</h2>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 xl:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Alerts</h2>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <AlertItem key={index} alert={alert} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 xl:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            {recentActivities.length === 0 ? (
              <p className="text-gray-500">No recent activity available.</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-gray-100 rounded-xl p-4 hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {log.username} • {formatRole(log.role)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatAction(log.action)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {log.details || "-"}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Top Laboratories</h2>
            </div>

            {topLaboratories.length === 0 ? (
              <div className="p-6 text-gray-500">No laboratory data available.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {topLaboratories.map((lab, index) => (
                  <div key={lab.name} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{lab.name}</p>
                      <p className="text-sm text-gray-500">Rank #{index + 1}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold">
                      {lab.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">System Snapshot</h2>
            </div>

            <div className="divide-y divide-gray-100">
              <SnapshotRow label="Borrowed Items" value={stats.borrowedItems} />
              <SnapshotRow label="Overdue Returns" value={stats.overdueReturns} />
              <SnapshotRow label="Pending Maintenance" value={stats.pendingMaintenance} />
              <SnapshotRow label="Completed This Month" value={stats.completedThisMonth} />
              <SnapshotRow label="Laboratories" value={stats.laboratories} />
              <SnapshotRow label="Activity Records" value={activityLogs.length} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, accent }) {
  const accentMap = {
    blue: "border-l-4 border-blue-500 bg-blue-50",
    green: "border-l-4 border-green-500 bg-green-50",
    yellow: "border-l-4 border-yellow-500 bg-yellow-50",
    red: "border-l-4 border-red-500 bg-red-50",
  };

  const iconMap = {
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
  };

  return (
    <div className={`${accentMap[accent]} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
          <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
        </div>
        <Icon size={30} className={`${iconMap[accent]} opacity-70`} />
      </div>
    </div>
  );
}

function MiniCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        <Icon size={24} className="text-gray-400" />
      </div>
    </div>
  );
}

function AlertItem({ alert }) {
  const typeClassMap = {
    danger: "bg-red-50 border-l-4 border-red-500",
    warning: "bg-yellow-50 border-l-4 border-yellow-500",
    info: "bg-blue-50 border-l-4 border-blue-500",
    success: "bg-green-50 border-l-4 border-green-500",
  };

  return (
    <div className={`${typeClassMap[alert.type]} rounded-lg p-4`}>
      <p className="font-semibold text-gray-900">{alert.title}</p>
      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
    </div>
  );
}

function SnapshotRow({ label, value }) {
  return (
    <div className="px-6 py-4 flex items-center justify-between">
      <span className="text-gray-700 font-medium">{label}</span>
      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-semibold">
        {value}
      </span>
    </div>
  );
}