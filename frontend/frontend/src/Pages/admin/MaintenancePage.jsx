// src/pages/admin/MaintenancePage.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import AddMaintenanceModal from "./AddMaintenanceModal";
import EditMaintenanceModal from "./EditMaintenanceModal";

export default function MaintenancePage() {
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [records, setRecords] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

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

  const loadEquipment = async () => {
    try {
      const res = await api.get("/api/equipment");
      setEquipment(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load equipment:", err);
    }
  };

  useEffect(() => {
    loadRecords();
    loadEquipment();
  }, []);

  // Map for fallback if maintenance record doesn't include equipment details
  const equipmentMap = useMemo(() => {
    const map = new Map();
    equipment.forEach((e) => map.set(e.id, e));
    return map;
  }, [equipment]);

  // Helper: extract equipmentId from either DTO or entity response
  const getEquipmentId = (r) => r?.equipmentId ?? r?.equipment?.id ?? null;

  // Helper: extract equipment info from DTO or entity or equipmentMap
  const getEquipmentInfo = (r) => {
    // Case A: backend DTO (flat fields)
    if (r?.equipmentName || r?.laboratory || r?.model) {
      return {
        id: r?.equipmentId ?? null,
        equipmentName: r?.equipmentName ?? "",
        laboratory: r?.laboratory ?? "",
        model: r?.model ?? "",
        serialNumber: r?.serialNumber ?? "",
      };
    }

    // Case B: backend entity nested "equipment"
    if (r?.equipment) {
      return {
        id: r?.equipment?.id ?? null,
        equipmentName: r?.equipment?.equipmentName ?? "",
        laboratory: r?.equipment?.laboratory ?? "",
        model: r?.equipment?.model ?? "",
        serialNumber: r?.equipment?.serialNumber ?? "",
      };
    }

    // Case C: fallback map using equipmentId
    const eqId = getEquipmentId(r);
    const eq = eqId ? equipmentMap.get(Number(eqId)) : null;
    return {
      id: eq?.id ?? eqId ?? null,
      equipmentName: eq?.equipmentName ?? "",
      laboratory: eq?.laboratory ?? "",
      model: eq?.model ?? "",
      serialNumber: eq?.serialNumber ?? "",
    };
  };

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;

    return records.filter((r) => {
      const eqId = String(getEquipmentId(r) ?? "").toLowerCase();
      const issue = String(r.issueDescription ?? "").toLowerCase();

      const eq = getEquipmentInfo(r);
      const eqName = String(eq.equipmentName ?? "").toLowerCase();
      const lab = String(eq.laboratory ?? "").toLowerCase();
      const model = String(eq.model ?? "").toLowerCase();
      const serial = String(eq.serialNumber ?? "").toLowerCase();

      return (
        eqId.includes(q) ||
        issue.includes(q) ||
        eqName.includes(q) ||
        lab.includes(q) ||
        model.includes(q) ||
        serial.includes(q)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, search, equipmentMap]);

  const handleDelete = async (id) => {
    const ok = confirm("Delete this maintenance record?");
    if (!ok) return;

    try {
      await api.delete(`/api/maintenance/${id}`);
      setRecords((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed.");
    }
  };

  // ✅ payload is already in ManyToOne format from modal
  const handleAddSave = async (payload) => {
    try {
      await api.post("/api/maintenance", payload);
      setShowAdd(false);
      await loadRecords();
    } catch (err) {
      console.error("Create failed:", err);
      alert("Failed to add maintenance record.");
    }
  };

  const handleEditSave = async (id, payload) => {
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
          onClick={() => {
            loadRecords();
            loadEquipment();
          }}
          className="ml-4 text-sm underline whitespace-nowrap"
          title="Refresh"
        >
          Refresh
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search equipment / lab / model / issue..."
          className="w-full max-w-xl px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <button
          onClick={() => setShowAdd(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-5 py-2 rounded-md shadow"
        >
          Add Maintenance Record
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-sm text-gray-600">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-200 text-left">
              <tr>
                <th className="p-3">Equipment</th>
                <th className="p-3">Issue Description</th>
                <th className="p-3">Reported Date</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Last Update</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td className="p-4 text-gray-500" colSpan={8}>
                    No maintenance records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const eq = getEquipmentInfo(r);
                  return (
                    <tr key={r.id} className="border-t">
                      <td className="p-3">
                        <div className="font-semibold">
                          {eq.equipmentName || "Unknown equipment"}
                        </div>
                        <div className="text-xs text-gray-600">
                          ID: {eq.id ?? "—"} {eq.laboratory ? `• ${eq.laboratory}` : ""}{" "}
                          {eq.model ? `• ${eq.model}` : ""}
                        </div>
                      </td>

                      <td className="p-3">{r.issueDescription}</td>
                      <td className="p-3">{r.reportedDate}</td>
                      <td className="p-3">{r.dueDate}</td>
                      <td className="p-3">{r.priority ?? "—"}</td>

                      <td className="p-3">
                        <StatusBadge status={r.status} />
                      </td>

                      <td className="p-3">{r.updatedAt ?? "—"}</td>

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
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <AddMaintenanceModal
          equipment={equipment}
          onClose={() => setShowAdd(false)}
          onSaved={handleAddSave}
        />
      )}

      {editItem && (
        <EditMaintenanceModal
          equipment={equipment}
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={(payload) => handleEditSave(editItem.id, payload)}
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