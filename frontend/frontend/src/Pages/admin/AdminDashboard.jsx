import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle2,
  Wrench,
  Clock,
  Users,
  Zap,
  Building2,
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEquipment: 0,
    working: 0,
    underRepair: 0,
    broken: 0,
    borrowedItems: 0,
    laboratories: 0,
    overdueReturns: 0,
    pendingRequests: 0,
    completedThisMonth: 0,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        equipmentRes,
        maintenanceRes,
        issuanceRes,
        laboratoriesRes,
      ] = await Promise.allSettled([
        axios.get("http://localhost:8080/api/equipment/all", { headers }),
        axios.get("http://localhost:8080/api/maintenance", { headers }),
        axios.get("http://localhost:8080/api/issuance", { headers }),
        axios.get("http://localhost:8080/api/laboratories", { headers }),
      ]);

      const equipment =
        equipmentRes.status === "fulfilled" ? equipmentRes.value.data : [];
      const maintenance =
        maintenanceRes.status === "fulfilled" ? maintenanceRes.value.data : [];
      const issuance =
        issuanceRes.status === "fulfilled" ? issuanceRes.value.data : [];
      const laboratories =
        laboratoriesRes.status === "fulfilled" ? laboratoriesRes.value.data : [];

      const totalEquipment = equipment.length;
      const working = equipment.filter((item) => item.status === "WORKING").length;
      const underRepair = equipment.filter(
        (item) => item.status === "UNDER_REPAIR"
      ).length;
      const broken = equipment.filter((item) => item.status === "BROKEN").length;

      const borrowedItems = Array.isArray(issuance)
        ? issuance.filter(
            (item) =>
              item.status === "BORROWED" ||
              item.status === "ISSUED" ||
              item.returned === false
          ).length
        : 0;

      const overdueReturns = Array.isArray(issuance)
        ? issuance.filter((item) => {
            if (!item.dueDate) return false;
            if (item.returned === true) return false;
            return new Date(item.dueDate) < new Date();
          }).length
        : 0;

      const pendingRequests = Array.isArray(maintenance)
        ? maintenance.filter(
            (item) =>
              item.status === "PENDING" ||
              item.status === "OPEN"
          ).length
        : 0;

      const completedThisMonth = Array.isArray(maintenance)
        ? maintenance.filter((item) => {
            if (
              item.status !== "COMPLETED" &&
              item.status !== "DONE"
            ) {
              return false;
            }

            const completedDate = item.completedDate || item.updatedAt || item.date;
            if (!completedDate) return false;

            const d = new Date(completedDate);
            const now = new Date();

            return (
              d.getMonth() === now.getMonth() &&
              d.getFullYear() === now.getFullYear()
            );
          }).length
        : 0;

      const laboratoryCount = Array.isArray(laboratories)
        ? laboratories.length
        : 0;

      setStats({
        totalEquipment,
        working,
        underRepair,
        broken,
        borrowedItems,
        laboratories: laboratoryCount,
        overdueReturns,
        pendingRequests,
        completedThisMonth,
      });

      setError("");
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard data");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Equipment Management System</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Zap}
            label="Total Equipment"
            value={stats.totalEquipment}
            color="blue"
          />
          <StatCard
            icon={CheckCircle2}
            label="Operational"
            value={stats.working}
            color="green"
          />
          <StatCard
            icon={Wrench}
            label="Under Repair"
            value={stats.underRepair}
            color="yellow"
          />
          <StatCard
            icon={AlertCircle}
            label="Broken"
            value={stats.broken}
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SecondaryCard
            icon={Users}
            label="Borrowed Items"
            value={stats.borrowedItems}
          />
          <SecondaryCard
            icon={Building2}
            label="Laboratories"
            value={stats.laboratories}
          />
          <SecondaryCard
            icon={Clock}
            label="Pending Tasks"
            value={stats.pendingRequests}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AlertCard
            type="warning"
            title="Overdue Returns"
            message={`${stats.overdueReturns} items awaiting return`}
            icon={AlertCircle}
          />
          <AlertCard
            type="success"
            title="Completed This Month"
            message={`${stats.completedThisMonth} maintenance tasks`}
            icon={CheckCircle2}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TableCard
            title="Equipment Status"
            data={[
              { label: "Working", value: stats.working, color: "bg-green-100 text-green-800" },
              { label: "Under Repair", value: stats.underRepair, color: "bg-yellow-100 text-yellow-800" },
              { label: "Broken", value: stats.broken, color: "bg-red-100 text-red-800" },
            ]}
          />
          <TableCard
            title="Maintenance Status"
            data={[
              { label: "Pending", value: stats.pendingRequests, color: "bg-blue-100 text-blue-800" },
              { label: "In Progress", value: stats.underRepair, color: "bg-purple-100 text-purple-800" },
              { label: "Completed", value: stats.completedThisMonth, color: "bg-green-100 text-green-800" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorMap = {
    blue: "border-l-4 border-blue-500 bg-blue-50",
    green: "border-l-4 border-green-500 bg-green-50",
    yellow: "border-l-4 border-yellow-500 bg-yellow-50",
    red: "border-l-4 border-red-500 bg-red-50",
  };

  const iconColorMap = {
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
  };

  return (
    <div className={`${colorMap[color]} rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
        </div>
        <Icon size={28} className={`${iconColorMap[color]} opacity-60`} />
      </div>
    </div>
  );
};

const SecondaryCard = ({ icon: Icon, label, value }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
        </div>
        <Icon size={24} className="text-gray-400" />
      </div>
    </div>
  );
};

const AlertCard = ({ type, title, message, icon: Icon }) => {
  const typeMap = {
    warning: "bg-yellow-50 border-l-4 border-yellow-500",
    success: "bg-green-50 border-l-4 border-green-500",
  };

  const iconColorMap = {
    warning: "text-yellow-600",
    success: "text-green-600",
  };

  return (
    <div className={`${typeMap[type]} rounded-lg p-6 shadow-sm`}>
      <div className="flex items-start gap-4">
        <Icon size={24} className={iconColorMap[type]} />
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-gray-600 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

const TableCard = ({ title, data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {data.map((item, idx) => (
          <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            <span className="text-gray-700 font-medium">{item.label}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.color}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;