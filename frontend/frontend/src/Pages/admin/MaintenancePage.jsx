// ✅ MaintenancePage.jsx (CONNECTED to Spring Boot backend)
// Assumes backend endpoints:
//   GET    /api/maintenance
//   POST   /api/maintenance
//   PUT    /api/maintenance/{id}
//   DELETE /api/maintenance/{id}
//
// And record fields:
// { id, equipmentId, issueDescription, reportedDate, dueDate, status, updatedAt }

import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios"; // ✅ adjust path if your axios.js is elsewhere
import AddMaintenanceModal from "./AddMaintenanceModal";
import EditMaintenanceModal from "./EditMaintenanceModal";

export default function MaintenancePage() {
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Load data from backend
  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/maintenance");
      setRecords(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load maintenance records:", err);
      alert("Failed to load maintenance records. Check backend & CORS.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // ✅ filter table by equipmentId or issueDescription
  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) => {
      const eq = String(r.equipmentId ?? "").toLowerCase();
      const issue = String(r.issueDescription ?? "").toLowerCase();
      return eq.includes(q) || issue.includes(q);
    });
  }, [records, search]);

  // ✅ Delete record
  const handleDelete = async (id) => {
    const ok = confirm("Delete this maintenance record?");
    if (!ok) return;

    try {
      await api.delete(`/api/maintenance/${id}`);
      // fast UI update
      setRecords((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed.");
    }
  };

  // ✅ When Add modal saves
  const handleAddSave = async (payload) => {
    // payload expected: { equipmentId, issueDescription, reportedDate, dueDate, status }
    try {
      await api.post("/api/maintenance", payload);
      setShowAdd(false);
      await loadRecords();
    } catch (err) {
      console.error("Create failed:", err);
      alert("Failed to add maintenance record.");
    }
  };

  // ✅ When Edit modal saves
  const handleEditSave = async (id, payload) => {
    // payload expected: { equipmentId, issueDescription, reportedDate, dueDate, status }
    try {
      await api.put(`/api/maintenance/${id}`, payload);
      setEditItem(null);
      await loadRecords();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update maintenance record.");
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-center w-full">
          Maintenance Management
        </h1>

        <button
          onClick={loadRecords}
          className="ml-4 text-sm underline whitespace-nowrap"
          title="Refresh"
        >
          Refresh
        </button>
      </div>

      {/* Search + button row */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search equipment..."
          className="w-full max-w-xl px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <button
          onClick={() => setShowAdd(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-5 py-2 rounded-md shadow"
        >
          Add Maintenance Record
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-sm text-gray-600">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-200 text-left">
              <tr>
                <th className="p-3">Equipment ID</th>
                <th className="p-3">Issue Description</th>
                <th className="p-3">Reported Date</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Last Update</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td className="p-4 text-gray-500" colSpan={7}>
                    No maintenance records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-3">{r.equipmentId}</td>
                    <td className="p-3">{r.issueDescription}</td>
                    <td className="p-3">{r.reportedDate}</td>
                    <td className="p-3">{r.dueDate}</td>
                    <td className="p-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="p-3">{r.updatedAt}</td>
                    <td className="p-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditItem(r)}
                          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {showAdd && (
        <AddMaintenanceModal
          onClose={() => setShowAdd(false)}
          onSaved={handleAddSave} // ✅ IMPORTANT: your modal should call onSaved(payload)
        />
      )}

      {editItem && (
        <EditMaintenanceModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={(payload) => handleEditSave(editItem.id, payload)} // ✅ modal calls onSaved(payload)
        />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "COMPLETED")
    return (
      <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 font-semibold">
        Fixed
      </span>
    );
  if (status === "IN_PROGRESS")
    return (
      <span className="px-3 py-1 rounded-full bg-blue-200 text-blue-800 font-semibold">
        Under Repair
      </span>
    );
  return (
    <span className="px-3 py-1 rounded-full bg-yellow-200 text-yellow-800 font-semibold">
      Pending
    </span>
  );
}