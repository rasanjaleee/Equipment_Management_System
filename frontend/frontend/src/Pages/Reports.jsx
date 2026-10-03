import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const cardStyles = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
};

const toUpper = (value) => String(value ?? '').trim().toUpperCase();

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-CA');
};

const getEquipmentStatusLabel = (status) => {
  switch (toUpper(status)) {
    case 'WORKING':
      return 'Available';
    case 'UNDER_REPAIR':
      return 'Maintenance';
    case 'BROKEN':
      return 'Broken';
    default:
      return 'Unknown';
  }
};

const getRequestStatusLabel = (status) => {
  switch (toUpper(status)) {
    case 'PENDING':
      return 'Pending';
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    default:
      return 'Unknown';
  }
};

const getStatusBadge = (status) => {
  const normalized = toUpper(status);

  if (normalized === 'AVAILABLE' || normalized === 'WORKING') {
    return 'bg-green-100 text-green-700';
  }
  if (normalized === 'ISSUED' || normalized === 'APPROVED') {
    return 'bg-blue-100 text-blue-700';
  }
  if (normalized === 'PENDING') {
    return 'bg-yellow-100 text-yellow-700';
  }
  if (normalized === 'MAINTENANCE' || normalized === 'UNDER_REPAIR' || normalized === 'BROKEN') {
    return 'bg-red-100 text-red-700';
  }
  if (normalized === 'OVERDUE') {
    return 'bg-orange-100 text-orange-700';
  }
  return 'bg-gray-100 text-gray-700';
};

export default function Reports() {
  const [equipment, setEquipment] = useState([]);
  const [requests, setRequests] = useState([]);
  const [issuances, setIssuances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError('');

        const [equipmentResponse, requestResponse, issuanceResponse] = await Promise.all([
          api.get('/api/equipment'),
          api.get('/api/borrow-requests'),
          api.get('/api/issuances'),
        ]);

        setEquipment(Array.isArray(equipmentResponse.data) ? equipmentResponse.data : []);
        setRequests(Array.isArray(requestResponse.data) ? requestResponse.data : []);
        setIssuances(Array.isArray(issuanceResponse.data) ? issuanceResponse.data : []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data ||
            'Failed to load report data. Please check the backend connection or login session.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const stats = useMemo(() => {
    const totalEquipment = equipment.length;
    const available = equipment.filter((item) => toUpper(item.status) === 'WORKING').length;
    const maintenance = equipment.filter((item) => toUpper(item.status) === 'UNDER_REPAIR').length;
    const broken = equipment.filter((item) => toUpper(item.status) === 'BROKEN').length;
    const pendingRequests = requests.filter((item) => toUpper(item.status) === 'PENDING').length;
    const approvedRequests = requests.filter((item) => toUpper(item.status) === 'APPROVED').length;
    const rejectedRequests = requests.filter((item) => toUpper(item.status) === 'REJECTED').length;
    const issuedCount = issuances.filter((item) => toUpper(item.status) === 'ISSUED').length || approvedRequests;
    const overdue = requests.filter((item) => {
      const normalized = toUpper(item.status);
      if (normalized !== 'APPROVED') return false;
      if (!item.borrowEndDate) return false;
      return new Date(item.borrowEndDate) < new Date();
    }).length;

    return {
      totalEquipment,
      available,
      issued: issuedCount,
      maintenance: maintenance + broken,
      overdue,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
    };
  }, [equipment, requests, issuances]);

  const labUsage = useMemo(() => {
    const totals = equipment.reduce((acc, item) => {
      const lab = item.laboratory || 'Unassigned';
      acc[lab] = (acc[lab] || 0) + 1;
      return acc;
    }, {});

    const total = Math.max(Object.values(totals).reduce((sum, value) => sum + value, 0), 1);

    return Object.entries(totals)
      .map(([lab, count]) => ({
        lab,
        value: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [equipment]);

  const equipmentRows = useMemo(
    () =>
      equipment.map((item) => ({
        name: item.equipmentName || 'Unknown equipment',
        lab: item.laboratory || 'Unassigned',
        status: getEquipmentStatusLabel(item.status),
        user: item.issuedTo || '—',
        date: formatDate(item.purchaseDate || item.createdAt),
      })),
    [equipment]
  );

  const requestRows = useMemo(
    () =>
      requests.map((item) => ({
        borrower: item.applicantName || item.userName || 'Unknown',
        equipment: item.equipmentName || 'Unknown equipment',
        lab: item.laboratoryName || 'Unassigned',
        status: getRequestStatusLabel(item.status),
        date: formatDate(item.borrowStartDate || item.createdAt),
      })),
    [requests]
  );

  const summaryCards = [
    { label: 'Total Equipment', value: stats.totalEquipment, accent: cardStyles.blue },
    { label: 'Available', value: stats.available, accent: cardStyles.green },
    { label: 'Issued', value: stats.issued, accent: cardStyles.yellow },
    { label: 'Maintenance', value: stats.maintenance, accent: cardStyles.red },
    { label: 'Overdue', value: stats.overdue, accent: cardStyles.orange },
    { label: 'Pending Requests', value: stats.pendingRequests, accent: cardStyles.purple },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500">Admin Panel</p>
            <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
          </div>

          <div className="mt-4 flex gap-3 md:mt-0">
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Export PDF</button>
            <button className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">Export CSV</button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className={`mb-4 inline-flex rounded-lg ${stat.accent} px-3 py-2`}>
                <span className="text-xs font-semibold uppercase tracking-wide text-white">{stat.label}</span>
              </div>
              <div className="text-3xl font-bold text-gray-800">{loading ? '...' : stat.value}</div>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Filters</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <select className="rounded-lg border border-gray-300 p-2 text-gray-700">
              <option>All Laboratories</option>
              {Array.from(new Set(equipment.map((item) => item.laboratory || 'Unassigned'))).map((lab) => (
                <option key={lab}>{lab}</option>
              ))}
            </select>

            <select className="rounded-lg border border-gray-300 p-2 text-gray-700">
              <option>All Status</option>
              <option>Available</option>
              <option>Issued</option>
              <option>Maintenance</option>
            </select>

            <input type="date" className="rounded-lg border border-gray-300 p-2 text-gray-700" />
            <input type="date" className="rounded-lg border border-gray-300 p-2 text-gray-700" />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Equipment by Laboratory</h2>
            <div className="space-y-4">
              {labUsage.length > 0 ? (
                labUsage.map((item) => (
                  <div key={item.lab}>
                    <div className="mb-1 flex justify-between text-sm text-gray-600">
                      <span>{item.lab}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${item.value}%` }}></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No laboratory data is currently available.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Borrow Request Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-gray-600">Pending</span>
                <span className="font-bold text-yellow-600">{loading ? '...' : stats.pendingRequests}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-gray-600">Approved</span>
                <span className="font-bold text-green-600">{loading ? '...' : stats.approvedRequests}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-gray-600">Rejected</span>
                <span className="font-bold text-red-600">{loading ? '...' : stats.rejectedRequests}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Overdue</span>
                <span className="font-bold text-orange-600">{loading ? '...' : stats.overdue}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Equipment Report</h2>
            <div className="overflow-x-auto">
              {equipmentRows.length > 0 ? (
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 pr-4">Equipment</th>
                      <th className="py-2 pr-4">Lab</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Purchase Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipmentRows.map((row, index) => (
                      <tr key={`${row.name}-${index}`} className="border-b border-gray-100">
                        <td className="py-2 pr-4">{row.name}</td>
                        <td className="py-2 pr-4">{row.lab}</td>
                        <td className="py-2 pr-4">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2 pr-4">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500">No equipment records are available yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Borrow Request Report</h2>
            <div className="overflow-x-auto">
              {requestRows.length > 0 ? (
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 pr-4">Borrower</th>
                      <th className="py-2 pr-4">Equipment</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestRows.map((row, index) => (
                      <tr key={`${row.borrower}-${index}`} className="border-b border-gray-100">
                        <td className="py-2 pr-4">{row.borrower}</td>
                        <td className="py-2 pr-4">{row.equipment}</td>
                        <td className="py-2 pr-4">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2 pr-4">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500">No borrow requests are currently available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
