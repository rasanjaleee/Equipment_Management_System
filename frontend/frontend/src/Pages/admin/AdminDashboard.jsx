import React, { useState, useEffect } from 'react';
import { Wrench } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard = () => {
  // State for dynamic stats
  const [stats, setStats] = useState({
    totalEquipment: 0,
    working: 0,
    underRepair: 0,
    broken: 0,
    borrowedItems: 0,
    laboratories: 0,
    overdueReturns: 0,
    pendingRequests: 0,
  });

  // Fetch data from your backend/admin panel
  useEffect(() => {
    // Replace this with your actual API call
    const fetchData = async () => {
      // const response = await fetch('/api/admin/stats');
      // const data = await response.json();
      const mockData = {
        totalEquipment: 247,
        working: 198,
        underRepair: 28,
        broken: 21,
        borrowedItems: 8,
        laboratories: 5,
        overdueReturns: 3,
        pendingRequests: 12,
      };
      setStats(mockData);
    };

    fetchData();
  }, []);

  return (
    <AdminLayout pageTitle="Dashboard">
      {/* Stats Grid */}
      <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
        <StatCard label="Total Equipment" value={stats.totalEquipment} color="bg-red-500" />
        <StatCard label="Working" value={stats.working} color="bg-green-500" />
        <StatCard label="Under Repair" value={stats.underRepair} color="bg-red-500" />
        <StatCard label="Broken" value={stats.broken} color="bg-red-500" />
        <StatCard label="Borrowed Items" value={stats.borrowedItems} color="bg-red-500" />
        <StatCard label="Laboratories" value={stats.laboratories} color="bg-green-500" />
        <StatCard label="Overdue Returns" value={stats.overdueReturns} color="bg-red-500" />
        <StatCard label="Pending Requests" value={stats.pendingRequests} color="bg-red-500" />
      </div>
    </AdminLayout>
  );
};

// Sub-component for individual Stat Cards
const StatCard = ({ label, value, color }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <div className={`${color} p-2 rounded-lg inline-block mb-3`}>
          <Wrench size={18} className="text-white" />
        </div>
        <h3 className="text-gray-500 font-medium text-xs">{label}</h3>
        <p className="text-gray-400 text-xs mt-1">+12 this month</p>
      </div>
      <div className="text-3xl font-light text-gray-800">
        {value.toString().padStart(2, '0')}
      </div>
    </div>
  );
};

export default AdminDashboard;