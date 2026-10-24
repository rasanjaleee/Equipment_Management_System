import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../services/api";
import { Eye, Edit, Trash2, FlaskConical } from "lucide-react";
import { useData } from "../context/DataContext";


export default function LaboratoryPage() {
  const {
    laboratories: cachedLabs,
    setLaboratories: setCachedLabs,
    refreshLaboratories,
    equipmentList: cachedEquipment,
    refreshEquipment,
  } = useData();

  const user = (() => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
})();

const role = String(user?.role || "")
  .replace(/^ROLE_/i, "")
  .toUpperCase();

const canManageLabs =
  role === "ADMIN" ||
  role === "SUPER_ADMIN";

  const [labs, setLabs] = useState(cachedLabs || []);
  const [equipmentList, setEquipmentList] = useState(cachedEquipment || []);

  const [selectedLab, setSelectedLab] = useState(null);
  const [labInventory, setLabInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLab, setEditLab] = useState(null);

  const [newLab, setNewLab] = useState({
  name: "",
  department: "",
  categoryDepartment: "",
  location: "",

  inCharge: "",
  inChargeDesignation: "",
  inChargeEmail: "",
  inChargeContactNumber: "",

  technicalOfficerInCharge: "",
  technicalOfficerEmail: "",
  technicalOfficerContactNumber: "",

  operatingHours: "",
  accessInformation: "",

  totalEquipment: "",
  workingEquipment: "",
  underRepairEquipment: "",
});

  // Sync with context if already present or updated
  useEffect(() => {
    if (cachedLabs && cachedLabs.length > 0) {
      setLabs(cachedLabs);
    }
  }, [cachedLabs]);

  useEffect(() => {
    if (cachedEquipment && cachedEquipment.length > 0) {
      setEquipmentList(cachedEquipment);
    }
  }, [cachedEquipment]);

  // LOAD / SILENT REVALIDATE LABORATORIES & EQUIPMENT
  useEffect(() => {
    refreshLaboratories(false);
    refreshEquipment(false);
  }, [refreshLaboratories, refreshEquipment]);

const loadLabInventory = async (labName) => {
  if (!labName) return;

  setInventoryLoading(true);
  setInventoryError("");
  setLabInventory([]);

  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `${API_BASE_URL}/api/lab-inventory/${encodeURIComponent(labName)}`,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      }
    );

    setLabInventory(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.log(
      "LAB INVENTORY ERROR:",
      err.response?.data || err.message
    );

    setInventoryError("Failed to load equipment inventory.");
    setLabInventory([]);
  } finally {
    setInventoryLoading(false);
  }
};

  const getLabStats = (labName) => {
    const labEquipment = equipmentList.filter(
      (e) => e.laboratory?.toLowerCase() === labName?.toLowerCase()
    );

    return {
      total: labEquipment.length,
      working: labEquipment.filter((e) => e.status?.toLowerCase() === "working").length,
      underRepair: labEquipment.filter((e) => e.status?.toLowerCase() === "under_repair").length,
      broken: labEquipment.filter((e) => e.status?.toLowerCase() === "broken").length,
    };
  };

  const filteredLabs = labs
  .filter((lab) =>
    Object.values(lab || {})
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )
  .filter((lab) =>
    departmentFilter
      ? lab.categoryDepartment  === departmentFilter
      : true
  );

  const handleAddLab = async (e) => {
    e.preventDefault();

    const payload = {
      ...newLab,
      totalEquipment: Number(newLab.totalEquipment || 0),
      workingEquipment: Number(newLab.workingEquipment || 0),
      underRepairEquipment: Number(newLab.underRepairEquipment || 0),
    };

    const token = localStorage.getItem("token");

const res = await axios.post(
  `${API_BASE_URL}/api/lab`,
  payload,
  {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  }
);

    setLabs((prev) => [...prev, res.data]);
    setCachedLabs((prev) => [...prev, res.data]);
    setIsAddModalOpen(false);

    setNewLab({
  name: "",
  department: "",
  categoryDepartment: "",
  location: "",

  inCharge: "",
  inChargeDesignation: "",
  inChargeEmail: "",
  inChargeContactNumber: "",

  technicalOfficerInCharge: "",
  technicalOfficerEmail: "",
  technicalOfficerContactNumber: "",

  operatingHours: "",
  accessInformation: "",

  totalEquipment: "",
  workingEquipment: "",
  underRepairEquipment: "",
});
  };

 const handleDelete = async (id) => {
  const lab = labs.find((item) => item.id === id);

  const result = await Swal.fire({
    title: "Delete Laboratory?",
    text: lab
      ? `Are you sure you want to delete "${lab.name}"?`
      : "Are you sure you want to delete this laboratory?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    reverseButtons: true,
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    const token = localStorage.getItem("token");

    await axios.delete(`${API_BASE_URL}/api/lab/${id}`, {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    });

    setLabs((prev) => prev.filter((item) => item.id !== id));
    setCachedLabs((prev) => prev.filter((item) => item.id !== id));

    setSuccessMessage("Laboratory deleted successfully.");

setTimeout(() => {
  setSuccessMessage("");
}, 3000);

  } catch (err) {
    console.error(
      "DELETE LAB ERROR:",
      err.response?.data || err.message
    );

    await Swal.fire({
      title: "Delete Failed",
      text:
        err.response?.data?.message ||
        "Failed to delete the laboratory.",
      icon: "error",
      confirmButtonText: "OK",
      confirmButtonColor: "#dc2626",
    });
  }
};

  const handleEditSave = async (e) => {
    e.preventDefault();

    const payload = {
      ...editLab,
      totalEquipment: Number(editLab.totalEquipment || 0),
      workingEquipment: Number(editLab.workingEquipment || 0),
      underRepairEquipment: Number(editLab.underRepairEquipment || 0),
    };

    const token = localStorage.getItem("token");

const res = await axios.put(
  `${API_BASE_URL}/api/lab/${editLab.id}`,
  payload,
  {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  }
);

    setLabs(labs.map((lab) => (lab.id === editLab.id ? res.data : lab)));
    setCachedLabs((prev) => prev.map((lab) => (lab.id === editLab.id ? res.data : lab)));

    setIsEditModalOpen(false);
    setEditLab(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {successMessage && (
  <div className="mx-4 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
    ✓ {successMessage}
  </div>
)}

      {/* PAGE TITLE + ADD LAB */}
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 pt-4 sm:pt-5 pb-3">
  <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
    <span>⚗</span>
    {canManageLabs ? "Laboratory Management" : "Laboratories"}
  </h2>

  {canManageLabs && (
  <button
    onClick={() => setIsAddModalOpen(true)}
    className="w-full sm:w-auto bg-red-950 hover:bg-red-900 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
  >
    + Add Lab
  </button>
)}
</div>

      {/* FILTERS */}
<div className="mx-3 sm:mx-4 mb-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">

    {/* SEARCH */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Search Laboratory
      </label>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Enter laboratory name"
        className="w-full border border-gray-300 px-4 py-2.5 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
      />
    </div>

    {/* DEPARTMENT FILTER */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Department
      </label>

      <select
        value={departmentFilter}
        onChange={(e) => setDepartmentFilter(e.target.value)}
        className="w-full border border-gray-300 px-4 py-2.5 rounded-lg bg-white outline-none focus:ring-2 focus:ring-amber-500"
      >
        <option value="">All Departments</option>

        <option value="Electrical and Information">
          Electrical and Information
        </option>

        <option value="Civil and Environmental">
          Civil and Environmental
        </option>

        <option value="Mechanical and Manufacturing">
          Mechanical and Manufacturing
        </option>

        <option value="Marine Engineering and Naval Architecture">
          Marine Engineering and Naval Architecture
        </option>
      </select>
    </div>

  </div>
</div>

      {/* ================= VIEW LAB MODAL ================= */}
{selectedLab && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {selectedLab.name}
          </h2>

          <p className="text-sm text-gray-500">
            Laboratory Overview
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedLab(null);
            setLabInventory([]);
            setInventoryError("");
          }}
          className="text-gray-500 hover:text-gray-800 text-2xl"
          title="Close"
        >
          ×
        </button>
      </div>

      <div className="p-6">

        {/* LAB DETAILS */}
<div className="space-y-6 mb-7">

  {/* LABORATORY INFORMATION */}
  <div>
    <h3 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b">
      Laboratory Information
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div>
        <p className="text-sm text-gray-500">Department</p>
        <p className="font-semibold text-gray-900">
          {selectedLab.department ||
            selectedLab.categoryDepartment ||
            "-"}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Location</p>
        <p className="font-semibold text-gray-900">
          {selectedLab.location || "-"}
        </p>
      </div>

      <div>
        <p className="text-sm text-gray-500">Operating Hours</p>
        <p className="font-semibold text-gray-900">
          {selectedLab.operatingHours || "-"}
        </p>
      </div>
    </div>
  </div>

  {/* CONTACT DETAILS */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

    {/* ACADEMIC IN-CHARGE */}
    <div className="border border-gray-200 rounded-xl p-4">
      <h3 className="font-bold text-gray-900 mb-4">
        Academic In-Charge
      </h3>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="font-semibold text-gray-900">
            {selectedLab.inCharge || "-"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Designation</p>
          <p className="font-medium text-gray-900">
            {selectedLab.inChargeDesignation || "-"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Official Email</p>

          {selectedLab.inChargeEmail ? (
            <a
              href={`mailto:${selectedLab.inChargeEmail}`}
              className="font-medium text-blue-600 hover:underline break-all"
            >
              {selectedLab.inChargeEmail}
            </a>
          ) : (
            <p className="font-medium text-gray-900">-</p>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500">Contact Number</p>
          <p className="font-medium text-gray-900">
            {selectedLab.inChargeContactNumber || "-"}
          </p>
        </div>
      </div>
    </div>

    {/* TECHNICAL CONTACT */}
    <div className="border border-gray-200 rounded-xl p-4">
      <h3 className="font-bold text-gray-900 mb-4">
        Technical Contact
      </h3>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">
            Technical Officer In Charge
          </p>
          <p className="font-semibold text-gray-900">
            {selectedLab.technicalOfficerInCharge || "-"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Official Email</p>

          {selectedLab.technicalOfficerEmail ? (
            <a
              href={`mailto:${selectedLab.technicalOfficerEmail}`}
              className="font-medium text-blue-600 hover:underline break-all"
            >
              {selectedLab.technicalOfficerEmail}
            </a>
          ) : (
            <p className="font-medium text-gray-900">-</p>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Contact Number / Extension
          </p>
          <p className="font-medium text-gray-900">
            {selectedLab.technicalOfficerContactNumber || "-"}
          </p>
        </div>
      </div>
    </div>
  </div>

  {/* STUDENT ACCESS */}
  <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
    <h3 className="font-bold text-gray-900 mb-2">
      Student Access Information
    </h3>

    <p className="text-sm text-gray-700">
      {selectedLab.accessInformation || "Not specified"}
    </p>
  </div>

</div>

        {/* EQUIPMENT STATISTICS */}
        {(() => {
          const stats = getLabStats(selectedLab.name);

          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p>Total</p>
                <p className="text-2xl font-bold">
                  {stats.total}
                </p>
              </div>

              <div className="bg-green-100 p-4 rounded-lg text-center">
                <p>Working</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.working}
                </p>
              </div>

              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <p>Under Repair</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.underRepair}
                </p>
              </div>

              <div className="bg-red-100 p-4 rounded-lg text-center">
                <p>Broken</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.broken}
                </p>
              </div>

            </div>
          );
        })()}

        {/* EQUIPMENT INVENTORY */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">
              Equipment Inventory
            </h3>

            <button
              type="button"
              onClick={() => loadLabInventory(selectedLab.name)}
              disabled={inventoryLoading}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              {inventoryLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {inventoryLoading ? (
            <div className="border rounded-lg p-8 text-center text-gray-500">
              Loading equipment inventory...
            </div>
          ) : inventoryError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              {inventoryError}
            </div>
          ) : labInventory.length === 0 ? (
            <div className="border rounded-lg p-8 text-center text-gray-500">
              No equipment found for this laboratory.
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Mobile Equipment Inventory */}
<div className="md:hidden space-y-3">
  {labInventory.length === 0 ? (
    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
      No equipment found in this laboratory.
    </div>
  ) : (
    labInventory.map((item, index) => (
      <div
        key={index}
        className="border border-gray-200 rounded-lg p-3 bg-white"
      >
        <h4 className="font-semibold text-gray-900 break-words mb-3">
          {item.equipmentName}
        </h4>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-500">Total</p>
            <p className="font-bold text-gray-900">{item.total}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-2">
            <p className="text-xs text-gray-500">Available</p>
            <p className="font-bold text-green-600">{item.available}</p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-2">
            <p className="text-xs text-gray-500">Issued</p>
            <p className="font-bold text-yellow-600">{item.issued}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-2">
            <p className="text-xs text-gray-500">Under Repair</p>
            <p className="font-bold text-blue-600">{item.underRepair}</p>
          </div>

          <div className="bg-red-50 rounded-lg p-2 col-span-2">
            <p className="text-xs text-gray-500">Broken</p>
            <p className="font-bold text-red-600">{item.broken}</p>
          </div>
        </div>
      </div>
    ))
  )}
</div>
              <div className="hidden md:block overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-gray-200 text-left">
                    <tr>
                      <th className="p-3">Equipment</th>
                      <th className="p-3 text-center">Total</th>
                      <th className="p-3 text-center">Available</th>
                      <th className="p-3 text-center">Issued</th>
                      <th className="p-3 text-center">Under Repair</th>
                      <th className="p-3 text-center">Broken</th>
                    </tr>
                  </thead>

                  <tbody>
                    {labInventory.map((item) => (
                      <tr
                        key={item.equipmentName}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="p-3 font-medium">
                          {item.equipmentName}
                        </td>

                        <td className="p-3 text-center font-semibold">
                          {item.total}
                        </td>

                        <td className="p-3 text-center">
                          <span className="inline-flex min-w-8 justify-center rounded-full bg-green-100 px-2 py-1 font-semibold text-green-700">
                            {item.available}
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          <span className="inline-flex min-w-8 justify-center rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-700">
                            {item.issued}
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          <span className="inline-flex min-w-8 justify-center rounded-full bg-blue-100 px-2 py-1 font-semibold text-blue-700">
                            {item.underRepair}
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          <span className="inline-flex min-w-8 justify-center rounded-full bg-red-100 px-2 py-1 font-semibold text-red-700">
                            {item.broken}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>

              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end mt-6 pt-4 border-t">
          <button
            type="button"
            onClick={() => {
              setSelectedLab(null);
              setLabInventory([]);
              setInventoryError("");
            }}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  </div>
)}

      {/* ================= LABORATORY LIST ================= */}

{canManageLabs ? (
  <>
    {/* ================= ADMIN DESKTOP TABLE ================= */}
    <div className="hidden md:block p-4">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-sm">
            <thead className="bg-gray-200 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Location</th>
                <th className="p-3">Academic In-Charge</th>
                <th className="p-3">Technical Officer</th>
                <th className="p-3 text-center">Total</th>
                <th className="p-3 text-center">Working</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredLabs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-gray-500">
                    No laboratories found.
                  </td>
                </tr>
              ) : (
                filteredLabs.map((lab) => {
                  const stats = getLabStats(lab.name);

                  return (
                    <tr
                      key={lab.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-3">{lab.name}</td>
                      <td className="p-3">{lab.department}</td>
                      <td className="p-3">{lab.location}</td>

                      <td className="p-3">
                        {lab.inCharge || "-"}
                      </td>

                      <td className="p-3">
                        {lab.technicalOfficerInCharge || "-"}
                      </td>

                      <td className="p-3 text-center">
                        {stats.total}
                      </td>

                      <td className="p-3 text-center text-green-600">
                        {stats.working}
                      </td>

                      <td className="p-3">
                        <div className="flex justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLab(lab);
                              loadLabInventory(lab.name);
                            }}
                            className="btn-icon text-green-600 hover:text-green-800"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditLab(lab);
                              setIsEditModalOpen(true);
                            }}
                            className="btn-icon text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(lab.id)}
                            className="btn-icon text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* ================= ADMIN MOBILE CARDS ================= */}
    <div className="md:hidden px-3 pb-4 space-y-3">
      {filteredLabs.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500">
          No laboratories found.
        </div>
      ) : (
        filteredLabs.map((lab) => {
          const stats = getLabStats(lab.name);

          return (
            <div
              key={lab.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
            >
              <div className="mb-3">
                <h3 className="text-base font-bold text-gray-900 break-words">
                  {lab.name}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {lab.department || "-"}
                </p>
              </div>

              <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium text-gray-800">
                    {lab.location || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Lab In Charge
                  </p>
                  <p className="font-medium text-gray-800">
                    {lab.inCharge || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Technical Officer In Charge
                  </p>
                  <p className="font-medium text-gray-800">
                    {lab.technicalOfficerInCharge || "-"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-gray-100 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">
                    Total Equipment
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">
                    Working
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {stats.working}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLab(lab);
                    loadLabInventory(lab.name);
                  }}
                  className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100"
                >
                  <Eye size={16} />
                  View
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditLab(lab);
                    setIsEditModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100"
                >
                  <Edit size={16} />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(lab.id)}
                  className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  </>
) : (
  /* ================= STUDENT LABORATORY DIRECTORY ================= */
  <div className="px-3 sm:px-4 pb-8">
    {filteredLabs.length === 0 ? (
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
        <FlaskConical
          size={40}
          className="mx-auto text-gray-400 mb-3"
        />

        <h3 className="font-semibold text-gray-900">
          No laboratories found
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Try changing your search or department filter.
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredLabs.map((lab) => {
          const stats = getLabStats(lab.name);

          return (
            <div
              key={lab.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* HEADER */}
              <div className="px-5 py-5 border-b border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-red-950 text-white flex items-center justify-center">
                    <FlaskConical size={24} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 leading-snug">
                      {lab.name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {lab.department ||
                        lab.categoryDepartment ||
                        "Department not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* LAB DETAILS */}
              <div className="px-5 py-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Location
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {lab.location || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Operating Hours
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {lab.operatingHours || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Academic In-Charge
                    </p>

                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {lab.inCharge || "Not specified"}
                    </p>

                    {lab.inChargeDesignation && (
                      <p className="text-xs text-gray-500 mt-1">
                        {lab.inChargeDesignation}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Technical Officer
                    </p>

                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {lab.technicalOfficerInCharge ||
                        "Not specified"}
                    </p>
                  </div>
                </div>

                {/* EQUIPMENT SUMMARY */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
                    <p className="text-xs text-gray-500">
                      Total Equipment
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {stats.total}
                    </p>
                  </div>

                  <div className="rounded-xl bg-green-50 border border-green-100 p-3 text-center">
                    <p className="text-xs text-green-700">
                      Working Equipment
                    </p>
                    <p className="text-xl font-bold text-green-600 mt-1">
                      {stats.working}
                    </p>
                  </div>
                </div>
              </div>

              {/* VIEW BUTTON */}
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLab(lab);
                    loadLabInventory(lab.name);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-950 hover:bg-red-900 text-white font-semibold px-4 py-2.5 transition-colors"
                >
                  <Eye size={17} />
                  View Laboratory Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
)}

      {/* ================= ADD MODAL ================= */}
{isAddModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Add Laboratory
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter laboratory information and contact details
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(false)}
          className="text-gray-500 hover:text-gray-800 text-2xl"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleAddLab} className="p-6 space-y-7">

        {/* LABORATORY INFORMATION */}
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b">
            Laboratory Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Laboratory Name
              </label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                placeholder="Enter laboratory name"
                value={newLab.name}
                onChange={(e) =>
                  setNewLab({ ...newLab, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>

              <select
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white"
                value={newLab.categoryDepartment}
                onChange={(e) =>
                  setNewLab({
                    ...newLab,
                    categoryDepartment: e.target.value,
                    department: e.target.value,
                  })
                }
              >
                <option value="">Select Department</option>

                <option value="Electrical and Information">
                  Electrical and Information
                </option>

                <option value="Civil and Environmental">
                  Civil and Environmental
                </option>

                <option value="Mechanical and Manufacturing">
                  Mechanical and Manufacturing
                </option>

                <option value="Marine Engineering and Naval Architecture">
                  Marine Engineering and Naval Architecture
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                placeholder="e.g. Block B"
                value={newLab.location}
                onChange={(e) =>
                  setNewLab({ ...newLab, location: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* ACADEMIC IN-CHARGE */}
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b">
            Academic In-Charge
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                placeholder="e.g. Dr. A. B. Fernando"
                value={newLab.inCharge}
                onChange={(e) =>
                  setNewLab({ ...newLab, inCharge: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                placeholder="e.g. Senior Lecturer"
                value={newLab.inChargeDesignation}
                onChange={(e) =>
                  setNewLab({
                    ...newLab,
                    inChargeDesignation: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Official Email
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                placeholder="e.g. lecturer@eng.ruh.ac.lk"
                value={newLab.inChargeEmail}
                onChange={(e) =>
                  setNewLab({
                    ...newLab,
                    inChargeEmail: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                placeholder="e.g. +94 41 222 2681"
                value={newLab.inChargeContactNumber}
                onChange={(e) =>
                  setNewLab({
                    ...newLab,
                    inChargeContactNumber: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* TECHNICAL CONTACT */}
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b">
            Technical Contact
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technical Officer In Charge
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                placeholder="Enter technical officer name"
                value={newLab.technicalOfficerInCharge}
                onChange={(e) =>
                  setNewLab({
                    ...newLab,
                    technicalOfficerInCharge: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Official Email
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                placeholder="e.g. technical@eng.ruh.ac.lk"
                value={newLab.technicalOfficerEmail}
                onChange={(e) =>
                  setNewLab({
                    ...newLab,
                    technicalOfficerEmail: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number / Extension
              </label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                placeholder="e.g. Ext. 214"
                value={newLab.technicalOfficerContactNumber}
                onChange={(e) =>
                  setNewLab({
                    ...newLab,
                    technicalOfficerContactNumber: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* STUDENT ACCESS */}
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b">
            Student Access Information
          </h3>

          <div className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                placeholder="e.g. Monday - Friday, 8:00 AM - 4:30 PM"
                value={newLab.operatingHours}
                onChange={(e) =>
                  setNewLab({
                    ...newLab,
                    operatingHours: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Information
              </label>
              <textarea
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 resize-none"
                placeholder="e.g. Prior approval is required for laboratory access."
                value={newLab.accessInformation}
                onChange={(e) =>
                  setNewLab({
                    ...newLab,
                    accessInformation: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(false)}
            className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-red-950 text-white font-semibold hover:bg-red-900"
          >
            Save Laboratory
          </button>
        </div>

      </form>
    </div>
  </div>
)}
      {/* ================= EDIT MODAL ================= */}
{isEditModalOpen && editLab && (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Edit Laboratory
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Update laboratory information and contact details
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsEditModalOpen(false);
            setEditLab(null);
          }}
          className="text-gray-500 hover:text-gray-800 text-2xl"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleEditSave} className="p-6 space-y-7">

        {/* LABORATORY INFORMATION */}
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b">
            Laboratory Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Laboratory Name
              </label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                value={editLab.name || ""}
                onChange={(e) =>
                  setEditLab({ ...editLab, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>

              <select
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white"
                value={editLab.categoryDepartment || ""}
                onChange={(e) =>
                  setEditLab({
                    ...editLab,
                    categoryDepartment: e.target.value,
                    department: e.target.value,
                  })
                }
              >
                <option value="">Select Department</option>
                <option value="Electrical and Information">
                  Electrical and Information
                </option>
                <option value="Civil and Environmental">
                  Civil and Environmental
                </option>
                <option value="Mechanical and Manufacturing">
                  Mechanical and Manufacturing
                </option>
                <option value="Marine Engineering and Naval Architecture">
                  Marine Engineering and Naval Architecture
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                value={editLab.location || ""}
                onChange={(e) =>
                  setEditLab({ ...editLab, location: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* ACADEMIC IN-CHARGE */}
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b">
            Academic In-Charge
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                value={editLab.inCharge || ""}
                onChange={(e) =>
                  setEditLab({ ...editLab, inCharge: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                value={editLab.inChargeDesignation || ""}
                onChange={(e) =>
                  setEditLab({
                    ...editLab,
                    inChargeDesignation: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Official Email
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                value={editLab.inChargeEmail || ""}
                onChange={(e) =>
                  setEditLab({
                    ...editLab,
                    inChargeEmail: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                value={editLab.inChargeContactNumber || ""}
                onChange={(e) =>
                  setEditLab({
                    ...editLab,
                    inChargeContactNumber: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* TECHNICAL CONTACT */}
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b">
            Technical Contact
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technical Officer In Charge
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                value={editLab.technicalOfficerInCharge || ""}
                onChange={(e) =>
                  setEditLab({
                    ...editLab,
                    technicalOfficerInCharge: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Official Email
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                value={editLab.technicalOfficerEmail || ""}
                onChange={(e) =>
                  setEditLab({
                    ...editLab,
                    technicalOfficerEmail: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number / Extension
              </label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                value={editLab.technicalOfficerContactNumber || ""}
                onChange={(e) =>
                  setEditLab({
                    ...editLab,
                    technicalOfficerContactNumber: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* STUDENT ACCESS */}
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b">
            Student Access Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                value={editLab.operatingHours || ""}
                onChange={(e) =>
                  setEditLab({
                    ...editLab,
                    operatingHours: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Information
              </label>
              <textarea
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 resize-none"
                value={editLab.accessInformation || ""}
                onChange={(e) =>
                  setEditLab({
                    ...editLab,
                    accessInformation: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => {
              setIsEditModalOpen(false);
              setEditLab(null);
            }}
            className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-red-950 text-white font-semibold hover:bg-red-900"
          >
            Update Laboratory
          </button>
        </div>

      </form>
    </div>
  </div>
)}

    </div>
  );
}