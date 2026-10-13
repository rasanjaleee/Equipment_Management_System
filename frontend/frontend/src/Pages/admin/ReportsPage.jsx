import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../services/api";
import {
  Calendar,
  Search,
  Filter,
  RotateCcw,
  Printer,
  ArrowUpDown,
  FileSpreadsheet,
  FileText,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  Truck,
  DollarSign,
  Clock
} from "lucide-react";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("grn");
  const [error, setError] = useState("");

  // ===================== GRN STATE =====================
  const [grnData, setGrnData] = useState([]);
  const [grnPeriod, setGrnPeriod] = useState("all"); // all, week, month, year, custom
  const [grnCustomStart, setGrnCustomStart] = useState("");
  const [grnCustomEnd, setGrnCustomEnd] = useState("");
  const [grnSupplier, setGrnSupplier] = useState("");
  const [grnSearch, setGrnSearch] = useState("");
  const [grnSortBy, setGrnSortBy] = useState("date_desc");
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [grnLoading, setGrnLoading] = useState(false);

  // ===================== INVENTORY STATE =====================
  const [inventorySummary, setInventorySummary] = useState(null);
  const [inventoryList, setInventoryList] = useState([]);
  const [laboratoryFilter, setLaboratoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [invPeriod, setInvPeriod] = useState("all"); // all, week, month, year, custom
  const [invCustomStart, setInvCustomStart] = useState("");
  const [invCustomEnd, setInvCustomEnd] = useState("");
  const [invSearch, setInvSearch] = useState("");
  const [allLaboratories, setAllLaboratories] = useState([]);
  const [invLoading, setInvLoading] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const formatCost = (val) => {
    if (val === null || val === undefined || val === "") return "Rs. 0";
    const num = Number(val);
    return isNaN(num) ? `Rs. ${val}` : `Rs. ${num.toLocaleString()}`;
  };

  // Date range calculator helper
  const getDateRangeForPeriod = (period) => {
    const today = new Date();
    const formatYMD = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (period === "week") {
      const startOfWeek = new Date(today);
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      return { startDate: formatYMD(startOfWeek), endDate: formatYMD(today) };
    } else if (period === "month") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: formatYMD(startOfMonth), endDate: formatYMD(today) };
    } else if (period === "year") {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return { startDate: formatYMD(startOfYear), endDate: formatYMD(today) };
    }
    return { startDate: "", endDate: "" };
  };

  // Computed date ranges
  const grnDates = useMemo(() => {
    if (grnPeriod === "custom") {
      return { startDate: grnCustomStart, endDate: grnCustomEnd };
    }
    return getDateRangeForPeriod(grnPeriod);
  }, [grnPeriod, grnCustomStart, grnCustomEnd]);

  const invDates = useMemo(() => {
    if (invPeriod === "custom") {
      return { startDate: invCustomStart, endDate: invCustomEnd };
    }
    return getDateRangeForPeriod(invPeriod);
  }, [invPeriod, invCustomStart, invCustomEnd]);

  // Initial suppliers and laboratories load
  useEffect(() => {
    const loadInitialOptions = async () => {
      try {
        const [grnRes, invRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/reports/grn`, { headers: getHeaders() }),
          axios.get(`${API_BASE_URL}/api/reports/inventory-list`, { headers: getHeaders() })
        ]);
        if (Array.isArray(grnRes.data)) {
          const suppliers = [...new Set(grnRes.data.map((r) => r.supplier).filter(Boolean))].sort();
          setAllSuppliers(suppliers);
        }
        if (Array.isArray(invRes.data)) {
          const labs = [...new Set(invRes.data.map((i) => i.laboratory).filter(Boolean))].sort();
          setAllLaboratories(labs);
        }
      } catch (err) {
        console.warn("Could not load initial dropdown lists:", err);
      }
    };
    loadInitialOptions();
  }, []);

  // Fetch GRN report with active filters
  const fetchGrnReport = async () => {
    setGrnLoading(true);
    try {
      const params = {};
      if (grnSupplier) params.supplier = grnSupplier;
      if (grnSearch.trim()) params.search = grnSearch.trim();
      if (grnDates.startDate) params.startDate = grnDates.startDate;
      if (grnDates.endDate) params.endDate = grnDates.endDate;

      const res = await axios.get(`${API_BASE_URL}/api/reports/grn`, {
        headers: getHeaders(),
        params
      });
      setGrnData(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load GRN report");
    } finally {
      setGrnLoading(false);
    }
  };

  useEffect(() => {
    fetchGrnReport();
  }, [grnSupplier, grnSearch, grnDates.startDate, grnDates.endDate]);

  // Fetch Inventory report with active filters
  const fetchInventoryReport = async () => {
    setInvLoading(true);
    try {
      const params = {};
      if (laboratoryFilter) params.laboratory = laboratoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (invSearch.trim()) params.search = invSearch.trim();
      if (invDates.startDate) params.startDate = invDates.startDate;
      if (invDates.endDate) params.endDate = invDates.endDate;

      const [summaryRes, listRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/reports/inventory-summary`, {
          headers: getHeaders(),
          params
        }),
        axios.get(`${API_BASE_URL}/api/reports/inventory-list`, {
          headers: getHeaders(),
          params
        })
      ]);

      setInventorySummary(summaryRes.data || null);
      setInventoryList(listRes.data || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory report");
    } finally {
      setInvLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryReport();
  }, [laboratoryFilter, statusFilter, invSearch, invDates.startDate, invDates.endDate]);

  // Sort GRN data
  const sortedGrnData = useMemo(() => {
    return [...grnData].sort((a, b) => {
      if (grnSortBy === "date_desc") {
        return (b.receivedDate || "").localeCompare(a.receivedDate || "");
      }
      if (grnSortBy === "date_asc") {
        return (a.receivedDate || "").localeCompare(b.receivedDate || "");
      }
      if (grnSortBy === "cost_desc") {
        return (Number(b.totalCost) || 0) - (Number(a.totalCost) || 0);
      }
      if (grnSortBy === "cost_asc") {
        return (Number(a.totalCost) || 0) - (Number(b.totalCost) || 0);
      }
      if (grnSortBy === "items_desc") {
        return (Number(b.itemCount) || 0) - (Number(a.itemCount) || 0);
      }
      return 0;
    });
  }, [grnData, grnSortBy]);

  // GRN Summary Metrics
  const grnTotalCost = useMemo(() => {
    return grnData.reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0);
  }, [grnData]);

  const grnTotalItems = useMemo(() => {
    return grnData.reduce((sum, r) => sum + (Number(r.itemCount) || 0), 0);
  }, [grnData]);

  const grnActiveSuppliers = useMemo(() => {
    return new Set(grnData.map((r) => r.supplier).filter(Boolean)).size;
  }, [grnData]);

  // Reset filter handlers
  const handleResetGrnFilters = () => {
    setGrnPeriod("all");
    setGrnCustomStart("");
    setGrnCustomEnd("");
    setGrnSupplier("");
    setGrnSearch("");
    setGrnSortBy("date_desc");
  };

  const handleResetInvFilters = () => {
    setInvPeriod("all");
    setInvCustomStart("");
    setInvCustomEnd("");
    setLaboratoryFilter("");
    setStatusFilter("");
    setInvSearch("");
  };

  // Export Handlers with active filters
  const handleDownloadGrnCsv = async () => {
    try {
      const params = {};
      if (grnSupplier) params.supplier = grnSupplier;
      if (grnSearch.trim()) params.search = grnSearch.trim();
      if (grnDates.startDate) params.startDate = grnDates.startDate;
      if (grnDates.endDate) params.endDate = grnDates.endDate;

      const response = await axios.get(`${API_BASE_URL}/api/reports/grn/export/csv`, {
        headers: getHeaders(),
        params,
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `grn_report_${grnPeriod}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download GRN CSV");
    }
  };

  const handleDownloadGrnPdf = async () => {
    try {
      const params = {};
      if (grnSupplier) params.supplier = grnSupplier;
      if (grnSearch.trim()) params.search = grnSearch.trim();
      if (grnDates.startDate) params.startDate = grnDates.startDate;
      if (grnDates.endDate) params.endDate = grnDates.endDate;

      const response = await axios.get(`${API_BASE_URL}/api/reports/grn/export/pdf`, {
        headers: getHeaders(),
        params,
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `grn_report_${grnPeriod}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download GRN PDF");
    }
  };

  const handlePrintGrnReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setError("Unable to open print window");
      return;
    }

    const rowsHtml =
      sortedGrnData.length > 0
        ? sortedGrnData
            .map(
              (row) => `
                <tr>
                  <td>${row.grnNumber ?? "-"}</td>
                  <td>${row.supplier ?? "-"}</td>
                  <td>${row.receivedDate ?? "-"}</td>
                  <td>${row.itemCount ?? 0}</td>
                  <td>${formatCost(row.totalCost)}</td>
                </tr>
              `
            )
            .join("")
        : `
          <tr>
            <td colspan="5" style="text-align:center;">No GRN records found</td>
          </tr>
        `;

    printWindow.document.write(`
      <html>
        <head>
          <title>GRN Summary Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #222;
            }
            h1 {
              margin-bottom: 4px;
            }
            p {
              margin-top: 0;
              color: #555;
            }
            .meta {
              font-size: 13px;
              color: #666;
              margin-bottom: 16px;
              border-bottom: 1px solid #eee;
              padding-bottom: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 10px;
              text-align: center;
              font-size: 13px;
            }
            th {
              background: #f3f4f6;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <h1>GRN Summary Report</h1>
          <p>Laboratory Equipment Management System</p>
          <div class="meta">
            <strong>Date Generated:</strong> ${new Date().toLocaleDateString()} | 
            <strong>Total GRNs:</strong> ${sortedGrnData.length} | 
            <strong>Total Items:</strong> ${grnTotalItems} | 
            <strong>Total Expenditure:</strong> ${formatCost(grnTotalCost)}
          </div>
          <table>
            <thead>
              <tr>
                <th>GRN Number</th>
                <th>Supplier</th>
                <th>Date</th>
                <th>Item Count</th>
                <th>Total Cost (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadCsv = async () => {
    try {
      const params = {};
      if (laboratoryFilter) params.laboratory = laboratoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (invSearch.trim()) params.search = invSearch.trim();
      if (invDates.startDate) params.startDate = invDates.startDate;
      if (invDates.endDate) params.endDate = invDates.endDate;

      const response = await axios.get(`${API_BASE_URL}/api/reports/inventory/export/csv`, {
        headers: getHeaders(),
        params,
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `inventory_report_${invPeriod}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download Inventory CSV");
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const params = {};
      if (laboratoryFilter) params.laboratory = laboratoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (invSearch.trim()) params.search = invSearch.trim();
      if (invDates.startDate) params.startDate = invDates.startDate;
      if (invDates.endDate) params.endDate = invDates.endDate;

      const response = await axios.get(`${API_BASE_URL}/api/reports/inventory/export/pdf`, {
        headers: getHeaders(),
        params,
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `inventory_report_${invPeriod}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download Inventory PDF");
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4 sm:p-8 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Analyze goods received notes, inventory allocation, and financial summaries
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-600 text-sm font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex gap-2 p-1.5 bg-gray-200/80 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("grn")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "grn"
                ? "bg-yellow-500 text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Truck size={17} />
            <span>GRN Report</span>
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              activeTab === "inventory"
                ? "bg-yellow-500 text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Layers size={17} />
            <span>Inventory Report</span>
          </button>
        </div>

        {/* ======================= GRN REPORT TAB ======================= */}
        {activeTab === "grn" && (
          <div className="space-y-6">
            {/* GRN Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                title="Total GRNs"
                value={sortedGrnData.length}
                icon={<FileText className="text-yellow-600" size={22} />}
                subtitle="Filtered shipments"
              />
              <SummaryCard
                title="Items Received"
                value={grnTotalItems}
                icon={<Package className="text-blue-600" size={22} />}
                subtitle="Total units received"
              />
              <SummaryCard
                title="Total Expenditure"
                value={formatCost(grnTotalCost)}
                icon={<DollarSign className="text-green-600" size={22} />}
                subtitle="Cumulative procurement cost"
              />
              <SummaryCard
                title="Active Suppliers"
                value={`${grnActiveSuppliers} ${grnActiveSuppliers === 1 ? "Supplier" : "Suppliers"}`}
                icon={<Truck className="text-purple-600" size={22} />}
                subtitle="Vendors in selected period"
              />
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-yellow-600" />
                  <h3 className="font-semibold text-gray-800 text-base">Filter GRN Records</h3>
                </div>
                <button
                  onClick={handleResetGrnFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
                >
                  <RotateCcw size={14} />
                  <span>Reset Filters</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Search GRN / Supplier
                  </label>
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="e.g. GRN 756673 or Lanka..."
                      value={grnSearch}
                      onChange={(e) => setGrnSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Period Preset */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Time Period
                  </label>
                  <select
                    value={grnPeriod}
                    onChange={(e) => setGrnPeriod(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  >
                    <option value="all">All Time</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                    <option value="custom">Custom Date Range</option>
                  </select>
                </div>

                {/* Supplier Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Filter by Supplier
                  </label>
                  <select
                    value={grnSupplier}
                    onChange={(e) => setGrnSupplier(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  >
                    <option value="">All Suppliers ({allSuppliers.length})</option>
                    {allSuppliers.map((sup) => (
                      <option key={sup} value={sup}>
                        {sup}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Sort By
                  </label>
                  <select
                    value={grnSortBy}
                    onChange={(e) => setGrnSortBy(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  >
                    <option value="date_desc">Date (Newest First)</option>
                    <option value="date_asc">Date (Oldest First)</option>
                    <option value="cost_desc">Cost (High to Low)</option>
                    <option value="cost_asc">Cost (Low to High)</option>
                    <option value="items_desc">Items (High to Low)</option>
                  </select>
                </div>
              </div>

              {/* Custom Date Pickers if custom selected */}
              {grnPeriod === "custom" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={grnCustomStart}
                      onChange={(e) => setGrnCustomStart(e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={grnCustomEnd}
                      onChange={(e) => setGrnCustomEnd(e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Export Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-end">
              <button
                onClick={handleDownloadGrnCsv}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition shadow-sm"
              >
                <FileSpreadsheet size={16} />
                <span>Download GRN CSV</span>
              </button>

              <button
                onClick={handleDownloadGrnPdf}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition shadow-sm"
              >
                <FileText size={16} />
                <span>Download GRN PDF</span>
              </button>

              <button
                onClick={handlePrintGrnReport}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition shadow-sm"
              >
                <Printer size={16} />
                <span>Print GRN Report</span>
              </button>
            </div>

            {/* GRN Summary Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">GRN Summary Report</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Showing {sortedGrnData.length} recorded goods receipt(s)
                  </p>
                </div>
                {grnLoading && <span className="text-xs text-gray-400">Updating...</span>}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100/80 text-gray-700 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">GRN Number</th>
                      <th className="p-3.5">Supplier</th>
                      <th className="p-3.5 text-center">Date</th>
                      <th className="p-3.5 text-center">Item Count</th>
                      <th className="p-3.5 text-right">Total Cost (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedGrnData.map((row, index) => (
                      <tr
                        key={index}
                        className="hover:bg-yellow-50/40 transition duration-150 text-gray-800"
                      >
                        <td className="p-3.5 font-semibold text-gray-900">{row.grnNumber}</td>
                        <td className="p-3.5">{row.supplier || "-"}</td>
                        <td className="p-3.5 text-center text-gray-600 text-xs">
                          {row.receivedDate || "-"}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="inline-block bg-gray-100 px-2.5 py-0.5 rounded-full font-medium text-xs text-gray-700">
                            {row.itemCount}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-semibold text-gray-900">
                          {formatCost(row.totalCost)}
                        </td>
                      </tr>
                    ))}
                    {sortedGrnData.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-10 text-center text-gray-500">
                          <Package className="mx-auto mb-2 text-gray-300" size={36} />
                          No GRN records match your selected filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================= INVENTORY REPORT TAB ======================= */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                title="Total Equipment"
                value={inventorySummary?.totalEquipment || 0}
                icon={<Package className="text-yellow-600" size={22} />}
                subtitle="Catalog count"
              />
              <SummaryCard
                title="Working"
                value={inventorySummary?.working || 0}
                icon={<CheckCircle2 className="text-green-600" size={22} />}
                subtitle="Operational units"
              />
              <SummaryCard
                title="Under Repair"
                value={inventorySummary?.underRepair || 0}
                icon={<Clock className="text-blue-600" size={22} />}
                subtitle="Currently in maintenance"
              />
              <SummaryCard
                title="Broken"
                value={inventorySummary?.broken || 0}
                icon={<AlertCircle className="text-red-600" size={22} />}
                subtitle="Decommissioned or broken"
              />
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-yellow-600" />
                  <h3 className="font-semibold text-gray-800 text-base">
                    Filter Inventory Records
                  </h3>
                </div>
                <button
                  onClick={handleResetInvFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
                >
                  <RotateCcw size={14} />
                  <span>Reset Filters</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Search Equipment
                  </label>
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Name, model, serial, GRN..."
                      value={invSearch}
                      onChange={(e) => setInvSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Period Preset */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Purchase Period
                  </label>
                  <select
                    value={invPeriod}
                    onChange={(e) => setInvPeriod(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  >
                    <option value="all">All Time</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                    <option value="custom">Custom Date Range</option>
                  </select>
                </div>

                {/* Laboratory */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Filter by Laboratory
                  </label>
                  <select
                    value={laboratoryFilter}
                    onChange={(e) => setLaboratoryFilter(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  >
                    <option value="">All Laboratories ({allLaboratories.length})</option>
                    {allLaboratories.map((lab) => (
                      <option key={lab} value={lab}>
                        {lab}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Filter by Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="WORKING">WORKING</option>
                    <option value="UNDER_REPAIR">UNDER_REPAIR</option>
                    <option value="BROKEN">BROKEN</option>
                  </select>
                </div>
              </div>

              {/* Custom Date Pickers */}
              {invPeriod === "custom" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Start Purchase Date
                    </label>
                    <input
                      type="date"
                      value={invCustomStart}
                      onChange={(e) => setInvCustomStart(e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      End Purchase Date
                    </label>
                    <input
                      type="date"
                      value={invCustomEnd}
                      onChange={(e) => setInvCustomEnd(e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Export Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-end">
              <button
                onClick={handleDownloadCsv}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition shadow-sm"
              >
                <FileSpreadsheet size={16} />
                <span>Download Inventory CSV</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition shadow-sm"
              >
                <FileText size={16} />
                <span>Download Inventory PDF</span>
              </button>
            </div>

            {/* Inventory List Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Inventory Directory</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Showing {inventoryList.length} matching equipment record(s)
                  </p>
                </div>
                {invLoading && <span className="text-xs text-gray-400">Updating...</span>}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100/80 text-gray-700 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">ID</th>
                      <th className="p-3.5">Equipment Name</th>
                      <th className="p-3.5">Laboratory</th>
                      <th className="p-3.5">Model</th>
                      <th className="p-3.5">Serial Number</th>
                      <th className="p-3.5 text-center">Purchase Date</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5">GRN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inventoryList.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-yellow-50/40 transition duration-150 text-gray-800"
                      >
                        <td className="p-3.5 font-semibold text-gray-900">#{item.id}</td>
                        <td className="p-3.5 font-medium text-gray-900">{item.equipmentName}</td>
                        <td className="p-3.5">{item.laboratory}</td>
                        <td className="p-3.5 text-gray-600">{item.model || "-"}</td>
                        <td className="p-3.5 text-gray-600">{item.serialNumber || "-"}</td>
                        <td className="p-3.5 text-center text-gray-600 text-xs">
                          {item.purchaseDate || "-"}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-semibold text-xs ${
                              item.status === "WORKING"
                                ? "bg-green-100 text-green-800"
                                : item.status === "UNDER_REPAIR"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.status || "-"}
                          </span>
                        </td>
                        <td className="p-3.5 text-gray-600">{item.grnNumber || "-"}</td>
                      </tr>
                    ))}
                    {inventoryList.length === 0 && (
                      <tr>
                        <td colSpan="8" className="p-10 text-center text-gray-500">
                          <Package className="mx-auto mb-2 text-gray-300" size={36} />
                          No equipment found matching the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, subtitle }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex items-start justify-between transition hover:shadow-md">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
        <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {icon && <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">{icon}</div>}
    </div>
  );
}