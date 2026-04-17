import { useEffect, useState } from "react";
import axios from "axios";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("grn");
  const [grnData, setGrnData] = useState([]);
  const [inventorySummary, setInventorySummary] = useState(null);
  const [inventoryList, setInventoryList] = useState([]);
  const [laboratoryFilter, setLaboratoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [allLaboratories, setAllLaboratories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGrnReport();
  }, []);

  useEffect(() => {
    fetchInventoryReport();
  }, [laboratoryFilter, statusFilter]);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchGrnReport = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/reports/grn", {
        headers: getHeaders(),
      });
      setGrnData(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load GRN report");
    }
  };

  const fetchInventoryReport = async () => {
    try {
      const params = {
        laboratory: laboratoryFilter,
        status: statusFilter,
      };

      const [summaryRes, listRes] = await Promise.all([
        axios.get("http://localhost:8080/api/reports/inventory-summary", {
          headers: getHeaders(),
          params,
        }),
        axios.get("http://localhost:8080/api/reports/inventory-list", {
          headers: getHeaders(),
          params,
        }),
      ]);

      setInventorySummary(summaryRes.data || null);
      setInventoryList(listRes.data || []);

      const labs = [...new Set((listRes.data || []).map((item) => item.laboratory).filter(Boolean))];
      setAllLaboratories(labs);

      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory report");
    }
  };

  const handleDownloadCsv = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/reports/inventory/export/csv", {
        headers: getHeaders(),
        params: {
          laboratory: laboratoryFilter,
          status: statusFilter,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "inventory_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download CSV");
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/reports/inventory/export/pdf", {
        headers: getHeaders(),
        params: {
          laboratory: laboratoryFilter,
          status: statusFilter,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "inventory_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download PDF");
    }
  };

  const handleDownloadGrnCsv = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/reports/grn/export/csv", {
        headers: getHeaders(),
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "grn_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download GRN CSV");
    }
  };

  const handleDownloadGrnPdf = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/reports/grn/export/pdf", {
        headers: getHeaders(),
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "grn_report.pdf");
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
      grnData.length > 0
        ? grnData
            .map(
              (row) => `
                <tr>
                  <td>${row.grnNumber ?? "-"}</td>
                  <td>${row.supplier ?? "-"}</td>
                  <td>${row.itemCount ?? 0}</td>
                  <td>$${row.totalCost ?? 0}</td>
                </tr>
              `
            )
            .join("")
        : `
          <tr>
            <td colspan="4" style="text-align:center;">No GRN records found</td>
          </tr>
        `;

    printWindow.document.write(`
      <html>
        <head>
          <title>GRN Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #222;
            }
            h1 {
              margin-bottom: 8px;
            }
            p {
              margin-top: 0;
              color: #555;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 10px;
              text-align: center;
            }
            th {
              background: #f3f4f6;
            }
          </style>
        </head>
        <body>
          <h1>GRN Summary Report</h1>
          <p>Laboratory Equipment Management System</p>
          <table>
            <thead>
              <tr>
                <th>GRN Number</th>
                <th>Supplier</th>
                <th>Item Count</th>
                <th>Total Cost</th>
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

  return (
    <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-8 min-h-full">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Reports</h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab("grn")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "grn"
                ? "bg-yellow-500 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            GRN Report
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "inventory"
                ? "bg-yellow-500 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            Inventory Report
          </button>
        </div>

        {activeTab === "grn" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleDownloadGrnCsv}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg"
                >
                  Download GRN CSV
                </button>

                <button
                  onClick={handleDownloadGrnPdf}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg"
                >
                  Download GRN PDF
                </button>

                <button
                  onClick={handlePrintGrnReport}
                  className="w-full bg-gray-700 hover:bg-gray-800 text-white px-4 py-3 rounded-lg"
                >
                  Print GRN Report
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
              <h2 className="text-lg font-semibold mb-4">GRN Summary Report</h2>

              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-200 text-center">
                    <th className="p-3">GRN Number</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3">Item Count</th>
                    <th className="p-3">Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {grnData.map((row, index) => (
                    <tr key={index} className="text-center border-t">
                      <td className="p-3">{row.grnNumber}</td>
                      <td className="p-3">{row.supplier || "-"}</td>
                      <td className="p-3">{row.itemCount}</td>
                      <td className="p-3">${row.totalCost}</td>
                    </tr>
                  ))}
                  {grnData.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-gray-500">
                        No GRN records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Filter by Laboratory</label>
                  <select
                    value={laboratoryFilter}
                    onChange={(e) => setLaboratoryFilter(e.target.value)}
                    className="w-full border p-3 rounded-lg"
                  >
                    <option value="">All Laboratories</option>
                    {allLaboratories.map((lab) => (
                      <option key={lab} value={lab}>
                        {lab}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Filter by Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border p-3 rounded-lg"
                  >
                    <option value="">All Statuses</option>
                    <option value="WORKING">WORKING</option>
                    <option value="UNDER_REPAIR">UNDER_REPAIR</option>
                    <option value="BROKEN">BROKEN</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleDownloadCsv}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg"
                  >
                    Download CSV
                  </button>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleDownloadPdf}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SummaryCard title="Total Equipment" value={inventorySummary?.totalEquipment || 0} />
              <SummaryCard title="Working" value={inventorySummary?.working || 0} />
              <SummaryCard title="Under Repair" value={inventorySummary?.underRepair || 0} />
              <SummaryCard title="Broken" value={inventorySummary?.broken || 0} />
            </div>

            <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
              <h2 className="text-lg font-semibold mb-4">Full Inventory List</h2>

              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-200 text-center">
                    <th className="p-3">ID</th>
                    <th className="p-3">Equipment Name</th>
                    <th className="p-3">Laboratory</th>
                    <th className="p-3">Model</th>
                    <th className="p-3">Serial Number</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">GRN</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryList.map((item) => (
                    <tr key={item.id} className="text-center border-t">
                      <td className="p-3">{item.id}</td>
                      <td className="p-3">{item.equipmentName}</td>
                      <td className="p-3">{item.laboratory}</td>
                      <td className="p-3">{item.model || "-"}</td>
                      <td className="p-3">{item.serialNumber || "-"}</td>
                      <td className="p-3">{item.status || "-"}</td>
                      <td className="p-3">{item.grnNumber || "-"}</td>
                    </tr>
                  ))}
                  {inventoryList.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-6 text-center text-gray-500">
                        No inventory data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 border">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
    </div>
  );
}