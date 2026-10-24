// src/pages/admin/MaintenancePage.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import AddMaintenanceModal from "./AddMaintenanceModal";
import EditMaintenanceModal from "./EditMaintenanceModal";
import { useData } from "../../context/DataContext";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Search,
  Plus,
  RefreshCw,
  FileText,
  Check,
  Edit,
  Trash2,
} from "lucide-react";

// -------------------------------------------------------------
// ?? HELPERS
// -------------------------------------------------------------
const SOURCE_MANUAL = "MANUAL"; // added from the "Add Maintenance Record" button
const SOURCE_EQUIPMENT = "EQUIPMENT"; // created from the Action Items table (equipment page flow)
const MANUAL_IDS_KEY = "manualMaintenanceIds";

const isFixedStatus = (s) => s === "WORKING" || s === "COMPLETED";
const isActiveStatus = (s) => !isFixedStatus(s);

const getRecordEquipmentId = (r) => {
  const id = r?.equipmentId ?? r?.equipment?.id;
  return id != null && id !== "" ? Number(id) : null;
};

const loadManualIds = () => {
  try {
    const raw = localStorage.getItem(MANUAL_IDS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};

const saveManualIds = (set) => {
  try {
    localStorage.setItem(MANUAL_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore */
  }
};

export default function MaintenancePage() {
  const {
    maintenanceList: cachedRecords,
    setMaintenanceList: setCachedRecords,
    refreshMaintenance,
    equipmentList: cachedEquipment,
    refreshEquipment,
  } = useData();

  const [activeTab, setActiveTab] = useState("active"); // "active" | "history"
  const [showAdd, setShowAdd] = useState(false);
  const [addSource, setAddSource] = useState(SOURCE_MANUAL);
  const [selectedEquipmentForAdd, setSelectedEquipmentForAdd] = useState("");
  const [editItem, setEditItem] = useState(null);

  const [records, setRecords] = useState(cachedRecords || []);
  const [equipment, setEquipment] = useState(cachedEquipment || []);

  // IDs of records that were added manually (fallback when the backend has no `source` field)
  const [manualIds, setManualIds] = useState(() => loadManualIds());

  const [search, setSearch] = useState("");
  const [labFilter, setLabFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(cachedRecords && cachedRecords.length > 0 ? false : true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Sync with context
  useEffect(() => {
    if (Array.isArray(cachedRecords)) {
      setRecords(cachedRecords);
      if (cachedRecords.length > 0) setLoading(false);
    }
  }, [cachedRecords]);

  useEffect(() => {
    if (Array.isArray(cachedEquipment)) {
      setEquipment(cachedEquipment);
    }
  }, [cachedEquipment]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [maintData, eqData] = await Promise.all([
        refreshMaintenance(false),
        refreshEquipment(false),
      ]);
      if (Array.isArray(maintData)) setRecords(maintData);
      if (Array.isArray(eqData)) setEquipment(eqData);
    } catch (err) {
      console.error("Failed to load maintenance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Is this record a manually added one?
  const isManualRecord = (r) => r?.source === SOURCE_MANUAL || manualIds.has(r?.id);

  // Quick lookup map of equipment by ID
  const equipmentMap = useMemo(() => {
    const map = new Map();
    equipment.forEach((e) => map.set(Number(e.id), e));
    return map;
  }, [equipment]);

  // Open (not fixed) records grouped by equipment:
  // { manual: record|null, linked: record|null, all: record[] }
  const openByEquipmentId = useMemo(() => {
    const map = new Map();
    records.forEach((r) => {
      if (!isActiveStatus(r.status)) return;
      const eqId = getRecordEquipmentId(r);
      if (!eqId) return;
      if (!map.has(eqId)) map.set(eqId, { manual: null, linked: null, all: [] });
      const entry = map.get(eqId);
      entry.all.push(r);
      if (isManualRecord(r)) entry.manual = entry.manual || r;
      else entry.linked = entry.linked || r;
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, manualIds]);

  // Helper: extract equipment info
  const getEquipmentInfo = (r) => {
    if (r?.equipmentName || r?.laboratory || r?.model) {
      return {
        id: r?.equipmentId ?? null,
        equipmentName: r?.equipmentName ?? "",
        laboratory: r?.laboratory ?? "",
        model: r?.model ?? "",
        serialNumber: r?.serialNumber ?? "",
      };
    }
    if (r?.equipment) {
      return {
        id: r?.equipment?.id ?? null,
        equipmentName: r?.equipment?.equipmentName ?? "",
        laboratory: r?.equipment?.laboratory ?? "",
        model: r?.equipment?.model ?? "",
        serialNumber: r?.equipment?.serialNumber ?? "",
      };
    }
    const eqId = getRecordEquipmentId(r);
    const eq = eqId ? equipmentMap.get(eqId) : null;
    return {
      id: eq?.id ?? eqId ?? null,
      equipmentName: eq?.equipmentName ?? "",
      laboratory: eq?.laboratory ?? "",
      model: eq?.model ?? "",
      serialNumber: eq?.serialNumber ?? "",
    };
  };

  // -------------------------------------------------------------
  // ? ACTION ITEMS (equipment-page flow only)
  // = equipment that is BROKEN / UNDER_REPAIR
  //   + equipment with an open NON-manual ticket
  // Equipment that only has an open MANUAL record is NOT shown here.
  // Fixed equipment never appears.
  // -------------------------------------------------------------
  const actionItems = useMemo(() => {
    const result = [];
    const coveredIds = new Set();

    equipment.forEach((e) => {
      if (e.status !== "BROKEN" && e.status !== "UNDER_REPAIR") return;
      const open = openByEquipmentId.get(Number(e.id));
      // belongs to a manual record -> history table only
      if (open?.manual && !open?.linked) return;
      coveredIds.add(Number(e.id));
      result.push({
        equipment: e,
        activeTicket: open?.linked || null,
        isBroken: e.status === "BROKEN",
        isUnderRepair: e.status === "UNDER_REPAIR",
      });
    });

    // Open non-manual tickets whose equipment status has not synced yet
    openByEquipmentId.forEach((open, eqId) => {
      if (!open.linked || coveredIds.has(eqId)) return;
      const eq = equipmentMap.get(eqId);
      if (!eq) return;
      coveredIds.add(eqId);
      result.push({
        equipment: eq,
        activeTicket: open.linked,
        isBroken: eq.status === "BROKEN",
        isUnderRepair: eq.status === "UNDER_REPAIR",
      });
    });

    return result;
  }, [equipment, openByEquipmentId, equipmentMap]);

  // History table = manually added records only
  const historyRecords = useMemo(() => records.filter((r) => isManualRecord(r)), [records, manualIds]);

  // -------------------------------------------------------------
  // ?? DASHBOARD METRICS
  // -------------------------------------------------------------
  const metrics = useMemo(() => {
    const completedTickets = records.filter((r) => isFixedStatus(r.status));
    const totalCost = completedTickets.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);

    return {
      totalNeedingAttention: actionItems.length,
      brokenCount: actionItems.filter((i) => i.isBroken).length,
      underRepairCount: actionItems.filter((i) => i.isUnderRepair).length,
      completedCount: completedTickets.length,
      totalCost,
    };
  }, [actionItems, records]);

  // Filtered action items
  const filteredActionItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return actionItems.filter(({ equipment: eq, activeTicket }) => {
      if (labFilter !== "ALL" && eq.laboratory !== labFilter) return false;
      if (statusFilter === "BROKEN" && eq.status !== "BROKEN") return false;
      if (statusFilter === "UNDER_REPAIR" && eq.status !== "UNDER_REPAIR") return false;
      if (statusFilter === "WITH_TICKET" && !activeTicket) return false;
      if (statusFilter === "NO_TICKET" && activeTicket) return false;

      if (!q) return true;
      const name = String(eq.equipmentName || "").toLowerCase();
      const lab = String(eq.laboratory || "").toLowerCase();
      const model = String(eq.model || "").toLowerCase();
      const serial = String(eq.serialNumber || "").toLowerCase();
      const id = String(eq.id || "").toLowerCase();
      const issue = String(activeTicket?.issueDescription || "").toLowerCase();

      return (
        name.includes(q) ||
        lab.includes(q) ||
        model.includes(q) ||
        serial.includes(q) ||
        id.includes(q) ||
        issue.includes(q)
      );
    });
  }, [actionItems, search, labFilter, statusFilter]);

  // Filtered maintenance history records (manual only)
  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return historyRecords.filter((r) => {
      const eq = getEquipmentInfo(r);
      if (labFilter !== "ALL" && eq.laboratory !== labFilter) return false;

      // Status filter
      if (statusFilter === "OPEN" && isFixedStatus(r.status)) return false; // default: hide fixed
      if (statusFilter === "BROKEN" && !(r.status === "BROKEN" || r.status === "PENDING")) return false;
      if (statusFilter === "UNDER_REPAIR" && !(r.status === "UNDER_REPAIR" || r.status === "IN_PROGRESS")) return false;
      if (statusFilter === "WORKING" && !isFixedStatus(r.status)) return false;

      if (!q) return true;
      const eqId = String(eq.id ?? "").toLowerCase();
      const issue = String(r.issueDescription ?? "").toLowerCase();
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
  }, [historyRecords, search, labFilter, statusFilter, equipmentMap]);

  // Count shown on the history tab = open manual records
  const openHistoryCount = useMemo(
    () => historyRecords.filter((r) => !isFixedStatus(r.status)).length,
    [historyRecords]
  );

  // Unique laboratories for dropdown
  const laboratories = useMemo(() => {
    const set = new Set();
    equipment.forEach((e) => {
      if (e.laboratory) set.add(e.laboratory);
    });
    return Array.from(set).sort();
  }, [equipment]);

  // Equipment list offered inside the Add modal
  const equipmentForAddModal = useMemo(() => {
    if (addSource === SOURCE_EQUIPMENT && selectedEquipmentForAdd) {
      // Coming from the Action Items table -> locked to that equipment
      return equipment.filter((e) => String(e.id) === String(selectedEquipmentForAdd));
    }
    // Manual add -> only equipment that is healthy and has no open record
    return equipment.filter((e) => {
      if (e.status === "BROKEN" || e.status === "UNDER_REPAIR") return false;
      if (openByEquipmentId.has(Number(e.id))) return false;
      return true;
    });
  }, [equipment, addSource, selectedEquipmentForAdd, openByEquipmentId]);

  // -------------------------------------------------------------
  // ? HANDLERS
  // -------------------------------------------------------------

  // Quick Fix: mark equipment as WORKING and close ALL its open tickets
  const handleQuickFix = async (equipmentId) => {
    const confirmed = confirm("Mark this equipment as FIXED and return to WORKING condition?");
    if (!confirmed) return;

    setActionLoadingId(equipmentId);
    try {
      await api.patch(`/api/equipment/${equipmentId}/status?status=WORKING`);

      const open = openByEquipmentId.get(Number(equipmentId));
      const tickets = open?.all || [];
      for (const t of tickets) {
        await api.put(`/api/maintenance/${t.id}`, {
          equipment: { id: equipmentId },
          issueDescription: t.issueDescription || "Repaired and returned to working condition",
          status: "WORKING",
          dueDate: t.dueDate || new Date().toISOString().split("T")[0],
          priority: t.priority || "MEDIUM",
          cost: t.cost,
          repairNote: t.repairNote,
          ...(t.source ? { source: t.source } : {}),
        });
      }

      await loadData();
    } catch (err) {
      console.error("Failed to mark equipment as fixed:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Start Repair: transition equipment status to UNDER_REPAIR
  const handleStartRepair = async (equipmentId, activeTicket) => {
    setActionLoadingId(equipmentId);
    try {
      await api.patch(`/api/equipment/${equipmentId}/status?status=UNDER_REPAIR`);

      if (activeTicket?.id && (activeTicket.status === "BROKEN" || activeTicket.status === "PENDING")) {
        await api.put(`/api/maintenance/${activeTicket.id}`, {
          equipment: { id: equipmentId },
          issueDescription: activeTicket.issueDescription,
          status: "UNDER_REPAIR",
          dueDate: activeTicket.dueDate,
          priority: activeTicket.priority,
          cost: activeTicket.cost,
          repairNote: activeTicket.repairNote,
          ...(activeTicket.source ? { source: activeTicket.source } : {}),
        });
      }

      await loadData();
    } catch (err) {
      console.error("Failed to start repair:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Mark a record as fixed directly from the Records & History table
  const handleMarkRecordCompleted = async (record) => {
    const eqId = getRecordEquipmentId(record);
    const ok = confirm("Mark this maintenance as FIXED and return the equipment to WORKING condition?");
    if (!ok) return;

    setActionLoadingId(`record-${record.id}`);
    try {
      await api.put(`/api/maintenance/${record.id}`, {
        equipment: eqId ? { id: eqId } : undefined,
        issueDescription: record.issueDescription,
        status: "WORKING",
        priority: record.priority,
        dueDate: record.dueDate || new Date().toISOString().split("T")[0],
        cost: record.cost,
        repairNote: record.repairNote,
        ...(record.source ? { source: record.source } : {}),
      });

      // Make sure the equipment itself goes back to WORKING
      if (eqId) {
        await api.patch(`/api/equipment/${eqId}/status?status=WORKING`);
      }

      await loadData();
    } catch (err) {
      console.error("Failed to mark record as completed:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Header button: manual maintenance (history table only)
  const handleOpenManualAdd = () => {
    setAddSource(SOURCE_MANUAL);
    setSelectedEquipmentForAdd("");
    setShowAdd(true);
  };

  // Action items "Log Details": ticket linked to equipment (action items table only)
  const handleOpenAddForEquipment = (equipmentId) => {
    setAddSource(SOURCE_EQUIPMENT);
    setSelectedEquipmentForAdd(equipmentId ? String(equipmentId) : "");
    setShowAdd(true);
  };

  const handleDeleteRecord = async (record) => {
    const ok = confirm("Delete this maintenance record?");
    if (!ok) return;

    try {
      await api.delete(`/api/maintenance/${record.id}`);

      // If an open record is deleted, make sure the equipment is not left stuck as BROKEN
      const eqId = getRecordEquipmentId(record);
      if (eqId && isActiveStatus(record.status) && isManualRecord(record)) {
        try {
          await api.patch(`/api/equipment/${eqId}/status?status=WORKING`);
        } catch (e) {
          console.error("Failed to reset equipment status:", e);
        }
      }

      setRecords((prev) => prev.filter((x) => x.id !== record.id));
      setCachedRecords((prev) => prev.filter((x) => x.id !== record.id));

      if (manualIds.has(record.id)) {
        const next = new Set(manualIds);
        next.delete(record.id);
        setManualIds(next);
        saveManualIds(next);
      }

      await loadData();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed.");
    }
  };

  const handleAddSave = async (payload) => {
    const eqId = Number(payload?.equipment?.id ?? payload?.equipmentId ?? selectedEquipmentForAdd);

    // ?? Prevent duplicate open maintenance for the same equipment
    if (eqId && openByEquipmentId.has(eqId)) {
      alert("This equipment already has an open maintenance record. Mark it as fixed before creating a new one.");
      return;
    }

    if (addSource === SOURCE_MANUAL && eqId) {
      const eq = equipmentMap.get(eqId);
      if (eq && (eq.status === "BROKEN" || eq.status === "UNDER_REPAIR")) {
        alert("This equipment is already under maintenance. Handle it from the Action Items tab.");
        return;
      }
    }

    try {
      const res = await api.post("/api/maintenance", { ...payload, source: addSource });

      // Remember manual records (fallback if backend does not store `source`)
      const newId = res?.data?.id;
      if (addSource === SOURCE_MANUAL && newId != null) {
        const next = new Set(manualIds);
        next.add(newId);
        setManualIds(next);
        saveManualIds(next);
      }

      setShowAdd(false);
      setSelectedEquipmentForAdd("");
      await loadData();
    } catch (err) {
      console.error("Create failed:", err);
      alert("Failed to add maintenance record.");
    }
  };

  const handleEditSave = async (id, payload) => {
    try {
      const body = editItem?.source ? { ...payload, source: editItem.source } : payload;
      await api.put(`/api/maintenance/${id}`, body);

      // If the edit set the record to fixed, return equipment to WORKING
      const eqId = Number(payload?.equipment?.id ?? payload?.equipmentId ?? getRecordEquipmentId(editItem));
      if (isFixedStatus(payload?.status) && eqId) {
        try {
          await api.patch(`/api/equipment/${eqId}/status?status=WORKING`);
        } catch (e) {
          console.error("Failed to reset equipment status:", e);
        }
      }

      setEditItem(null);
      await loadData();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update maintenance record.");
    }
  };

  return (
    <div className="w-full pb-10">
      {/* ========================================================= */}
      {/* ?? HEADER */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Wrench className="w-7 h-7 text-yellow-500" />
            Maintenance Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Real-time status tracking, instant repairs, and detailed maintenance logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={handleOpenManualAdd}
            className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Maintenance Record
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ?? MAINTENANCE DASHBOARD METRICS CARDS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Needing Action</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">{metrics.totalNeedingAttention}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Broken (Req. Maint.)</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">{metrics.brokenCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Currently Under Repair</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{metrics.underRepairCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-green-600 flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Fixed & Completed</p>
            <p className="text-xl sm:text-2xl font-bold text-green-700">{metrics.completedCount}</p>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Repair Cost</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800">
              Rs. {metrics.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ?? TABS & CONTROLS */}
      {/* ========================================================= */}
      <div className="bg-white rounded-t-xl border border-gray-200 p-4 border-b-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b md:border-b-0 pb-2 md:pb-0">
            <button
              onClick={() => {
                setActiveTab("active");
                setStatusFilter("ALL");
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === "active" ? "bg-yellow-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Action Items & Broken Equipment</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "active" ? "bg-white text-yellow-700" : "bg-gray-200 text-gray-700"
                }`}
              >
                {actionItems.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("history");
                setStatusFilter("OPEN");
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === "history" ? "bg-yellow-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Maintenance Records & History</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "history" ? "bg-white text-yellow-700" : "bg-gray-200 text-gray-700"
                }`}
              >
                {openHistoryCount}
              </span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search equipment, lab, issue..."
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <select
              value={labFilter}
              onChange={(e) => setLabFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="ALL">All Laboratories</option>
              {laboratories.map((lab) => (
                <option key={lab} value={lab}>
                  {lab}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {activeTab === "active" ? (
                <>
                  <option value="ALL">All Statuses</option>
                  <option value="BROKEN">Maintenance Required (Broken)</option>
                  <option value="UNDER_REPAIR">Currently Under Repair</option>
                  <option value="WITH_TICKET">Has Detailed Ticket</option>
                  <option value="NO_TICKET">No Ticket Yet (Quick Fix Ready)</option>
                </>
              ) : (
                <>
                  <option value="OPEN">Open Records (Fixed Hidden)</option>
                  <option value="ALL">All Records (Incl. Fixed)</option>
                  <option value="BROKEN">Maintenance Required</option>
                  <option value="UNDER_REPAIR">Currently Under Repair</option>
                  <option value="WORKING">Fixed / Working</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ?? TAB 1: ACTION ITEMS */}
      {/* ========================================================= */}
      {activeTab === "active" && (
        <div className="bg-white rounded-b-xl border border-gray-200 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-yellow-500" />
              Loading equipment requiring maintenance...
            </div>
          ) : filteredActionItems.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-800 text-lg">All Equipment in Working Order!</p>
              <p className="text-sm text-gray-500 mt-1">
                No equipment is currently marked as BROKEN or UNDER_REPAIR.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[1050px] text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 font-semibold border-b">
                <tr>
                  <th className="p-3.5">Equipment Info</th>
                  <th className="p-3.5">Laboratory</th>
                  <th className="p-3.5">Maintenance Status</th>
                  <th className="p-3.5">Linked Ticket Details</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredActionItems.map(({ equipment: eq, activeTicket, isBroken, isUnderRepair }) => {
                  const isActionLoading = actionLoadingId === eq.id;

                  return (
                    <tr key={eq.id} className="hover:bg-gray-50/80 transition">
                      <td className="p-3.5">
                        <div className="font-semibold text-gray-900">{eq.equipmentName}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          ID: <span className="font-mono">{eq.id}</span>
                          {eq.model && ` . Model: ${eq.model}`}
                          {eq.serialNumber && ` . S/N: ${eq.serialNumber}`}
                        </div>
                      </td>

                      <td className="p-3.5 text-gray-700 font-medium">{eq.laboratory || "-"}</td>

                      <td className="p-3.5">
                        {isBroken ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                            Maintenance Required
                          </span>
                        ) : isUnderRepair ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            Currently Under Repair
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                            {eq.status}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        {activeTicket ? (
                          <div className="text-xs space-y-1">
                            <div className="font-medium text-gray-800">
                              {activeTicket.issueDescription || "No issue details"}
                            </div>
                            <div className="text-gray-500 flex items-center gap-2">
                              <span>
                                Priority: <span className="font-semibold">{activeTicket.priority ?? "-"}</span>
                              </span>
                              <span>.</span>
                              <span>
                                Due: <span className="font-semibold">{activeTicket.dueDate ?? "-"}</span>
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            No detailed ticket logged yet (Status-based)
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleQuickFix(eq.id)}
                            disabled={isActionLoading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500 hover:bg-green-600 text-white shadow-sm transition disabled:opacity-50"
                            title="Quick Fix: Immediately mark as Working and return to inventory"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark as Fixed</span>
                          </button>

                          {isBroken && (
                            <button
                              onClick={() => handleStartRepair(eq.id, activeTicket)}
                              disabled={isActionLoading}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-sm transition disabled:opacity-50"
                              title="Transition to Under Repair status"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              <span>Start Repair</span>
                            </button>
                          )}

                          {activeTicket ? (
                            <button
                              onClick={() => setEditItem(activeTicket)}
                              disabled={isActionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                              title="Edit Maintenance Ticket Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit Ticket</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenAddForEquipment(eq.id)}
                              disabled={isActionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-yellow-100 hover:bg-yellow-200 text-yellow-800 transition"
                              title="Log full repair ticket with due date, priority, and notes"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Log Details</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* ?? TAB 2: MAINTENANCE HISTORY & LOGS (manual records) */}
      {/* ========================================================= */}
      {activeTab === "history" && (
        <div className="bg-white rounded-b-xl border border-gray-200 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-yellow-500" />
              Loading maintenance logs...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-700 text-lg">No Maintenance Logs Found</p>
              <p className="text-sm text-gray-400 mt-1">
                No maintenance records match your search or filters.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[1050px] text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 font-semibold border-b">
                <tr>
                  <th className="p-3.5">Equipment</th>
                  <th className="p-3.5">Issue Description</th>
                  <th className="p-3.5">Reported</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Repair Cost</th>
                  <th className="p-3.5">Notes</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map((r) => {
                  const eq = getEquipmentInfo(r);
                  const isRecordActionLoading = actionLoadingId === `record-${r.id}`;

                  return (
                    <tr key={r.id} className="hover:bg-gray-50/80 transition">
                      <td className="p-3.5">
                        <div className="font-semibold text-gray-900">
                          {eq.equipmentName || "Unknown equipment"}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          ID: <span className="font-mono">{eq.id ?? "-"}</span>
                          {eq.laboratory && ` . ${eq.laboratory}`}
                          {eq.model && ` . ${eq.model}`}
                        </div>
                      </td>

                      <td className="p-3.5 max-w-xs text-gray-800">{r.issueDescription || "-"}</td>

                      <td className="p-3.5 text-gray-600 whitespace-nowrap">{r.reportedDate || "-"}</td>

                      <td className="p-3.5 text-gray-600 whitespace-nowrap font-medium">{r.dueDate || "-"}</td>

                      <td className="p-3.5">
                        <PriorityBadge priority={r.priority} />
                      </td>

                      <td className="p-3.5">
                        <StatusBadge status={r.status} />
                      </td>

                      <td className="p-3.5 text-gray-800 font-medium whitespace-nowrap">
                        {r.cost != null && r.cost !== ""
                          ? `Rs. ${Number(r.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                          : "-"}
                      </td>

                      <td className="p-3.5 text-xs text-gray-500 max-w-xs truncate" title={r.repairNote}>
                        {r.repairNote || "-"}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isActiveStatus(r.status) && (
                            <button
                              onClick={() => handleMarkRecordCompleted(r)}
                              disabled={isRecordActionLoading}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-green-500 hover:bg-green-600 text-white shadow-sm transition disabled:opacity-50"
                              title="Mark repair as Completed and return equipment to Working condition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Mark Fixed</span>
                            </button>
                          )}

                          <button
                            onClick={() => setEditItem(r)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                            title="Edit Record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(r)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-100 text-red-600 transition"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* ??? MODALS */}
      {/* ========================================================= */}
      {showAdd && (
        <AddMaintenanceModal
          equipment={equipmentForAddModal}
          initialEquipmentId={selectedEquipmentForAdd}
          onClose={() => {
            setShowAdd(false);
            setSelectedEquipmentForAdd("");
          }}
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
  if (status === "WORKING" || status === "COMPLETED")
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
        Fixed / Working
      </span>
    );
  if (status === "UNDER_REPAIR" || status === "IN_PROGRESS")
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
        Under Repair
      </span>
    );
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
      Maintenance Required
    </span>
  );
}

function PriorityBadge({ priority }) {
  const p = (priority || "").toUpperCase();
  if (p === "HIGH" || p === "URGENT")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
        {p}
      </span>
    );
  if (p === "MEDIUM")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700">
        MED
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
      LOW
    </span>
  );
}
