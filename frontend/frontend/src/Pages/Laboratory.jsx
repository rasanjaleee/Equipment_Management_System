import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Eye, Edit, Trash2 } from "lucide-react";
import { API_BASE_URL } from "../services/api";


export default function LaboratoryPage() {
  const [labs, setLabs] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);

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
    technicalOfficerInCharge: "",
    totalEquipment: "",
    workingEquipment: "",
    underRepairEquipment: "",
  });

  // LOAD LABORATORIES
useEffect(() => {
  const token = localStorage.getItem("token");

  axios
    .get(`${API_BASE_URL}/api/lab`, {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    })
    .then((res) => {
      setLabs(Array.isArray(res.data) ? res.data : []);
    })
    .catch((err) => {
      console.log(
        "LAB ERROR:",
        err.response?.data || err.message
      );
      setLabs([]);
    });
}, []);


// LOAD EQUIPMENT
useEffect(() => {
  const token = localStorage.getItem("token");

  axios
    .get(`${API_BASE_URL}/api/equipment/all`, {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    })
    .then((res) => {
      setEquipmentList(Array.isArray(res.data) ? res.data : []);
    })
    .catch((err) => {
      console.log(
        "EQUIPMENT ERROR:",
        err.response?.data || err.message
      );
      setEquipmentList([]);
    });
}, []);

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

    const res = await axios.post(`${API_BASE_URL}/api/lab`, payload);

    setLabs((prev) => [...prev, res.data]);
    setIsAddModalOpen(false);

    setNewLab({
      name: "",
      department: "",
      categoryDepartment: "",
      location: "",
      inCharge: "",
      technicalOfficerInCharge: "",
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

    const res = await axios.put(
      `${API_BASE_URL}/api/lab/${editLab.id}`,
      payload
    );

    setLabs(labs.map((lab) => (lab.id === editLab.id ? res.data : lab)));

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
    Laboratory Management
  </h2>

  <button
    onClick={() => setIsAddModalOpen(true)}
    className="w-full sm:w-auto bg-red-950 hover:bg-red-900 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
  >
    + Add Lab
  </button>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-semibold">
              {selectedLab.location || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">In Charge</p>
            <p className="font-semibold">
              {selectedLab.inCharge || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Technical Officer In Charge
            </p>
            <p className="font-semibold">
              {selectedLab.technicalOfficerInCharge || "-"}
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

      {/* TABLE */}
<div className="hidden md:block p-4">
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1200px] text-sm">

        <thead className="bg-gray-200 text-left">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Dept</th>
            <th className="p-3">Location</th>
            <th className="p-3">Lab In Charge</th>
            <th className="p-3">
              Technical Officer In Charge
            </th>
            <th className="p-3 text-center">Total</th>
            <th className="p-3 text-center">Working</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredLabs.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="p-4 text-gray-500"
              >
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
                  <td className="p-3">
                    {lab.name}
                  </td>

                  <td className="p-3">
                    {lab.department}
                  </td>

                  <td className="p-3">
                    {lab.location}
                  </td>

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

                    {/* VIEW */}
                    <button
                      onClick={() => {
                      setSelectedLab(lab);
                      loadLabInventory(lab.name);}}
                      className="btn-icon text-green-600 hover:text-green-800"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>

                    {/* EDIT */}
                    <button
                      onClick={() => {
                        setEditLab(lab);
                        setIsEditModalOpen(true);
                      }}
                      className="btn-icon text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>

                    {/* DELETE */}
                    <button
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

{/* Mobile Laboratory Cards */}
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

            <p className="text-sm text-gray-500 mt-1 break-words">
              {lab.department || "-"}
            </p>
          </div>

          <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="font-medium text-gray-800 break-words">
                {lab.location || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Lab In Charge</p>
              <p className="font-medium text-gray-800 break-words">
                {lab.inCharge || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Technical Officer In Charge
              </p>
              <p className="font-medium text-gray-800 break-words">
                {lab.technicalOfficerInCharge || "-"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-gray-100 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Total Equipment</p>
              <p className="text-lg font-bold text-gray-900">
                {stats.total}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Working</p>
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

      {/* ================= ADD MODAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4">Add Lab</h2>

            <form onSubmit={handleAddLab} className="space-y-3">

              <input className="w-full border p-2" placeholder="Name"
                value={newLab.name}
                onChange={(e) => setNewLab({ ...newLab, name: e.target.value })}
              />

              <select
  className="w-full border p-2"
  value={newLab.categoryDepartment}
  onChange={(e) =>
    setNewLab({
      ...newLab,
      categoryDepartment: e.target.value,
    })
  }
  required
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

              <input className="w-full border p-2" placeholder="Location"
                value={newLab.location}
                onChange={(e) => setNewLab({ ...newLab, location: e.target.value })}
              />

              <input className="w-full border p-2" placeholder="Lab In Charge"
                value={newLab.inCharge}
                onChange={(e) =>
                  setNewLab({ ...newLab, inCharge: e.target.value })
                }
              />

              <input
  className="w-full border p-2"
  placeholder="Technical Officer In Charge"
  value={newLab.technicalOfficerInCharge}
  onChange={(e) =>
    setNewLab({
      ...newLab,
      technicalOfficerInCharge: e.target.value,
    })
  }
/>

              <div className="flex justify-between pt-3">
                <button type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-gray-400 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>

                <button type="submit"
                  className="bg-amber-500 text-white px-3 py-1 rounded"
                >
                  Save
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {isEditModalOpen && editLab && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4">Edit Lab</h2>

            <form onSubmit={handleEditSave} className="space-y-3">

              <input className="w-full border p-2"
                value={editLab.name || ""}
                onChange={(e) => setEditLab({ ...editLab, name: e.target.value })}
              />

              <input className="w-full border p-2"
                value={editLab.department || ""}
                onChange={(e) => setEditLab({ ...editLab, department: e.target.value })}
              />

              <input className="w-full border p-2"
                value={editLab.categoryDepartment || ""}
                onChange={(e) => setEditLab({ ...editLab, categoryDepartment: e.target.value })}
              />

              <input className="w-full border p-2"
                value={editLab.location || ""}
                onChange={(e) => setEditLab({ ...editLab, location: e.target.value })}
              />

              <input className="w-full border p-2"
                value={editLab.inCharge || ""}
                onChange={(e) => setEditLab({ ...editLab, inCharge: e.target.value })}
              />

              <input
  className="w-full border p-2"
  placeholder="Technical Officer In Charge"
  value={editLab.technicalOfficerInCharge || ""}
  onChange={(e) =>
    setEditLab({
      ...editLab,
      technicalOfficerInCharge: e.target.value,
    })
  }
/>

              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-400 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Update
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}