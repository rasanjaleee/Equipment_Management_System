import { useState, useEffect } from "react";
import axios from "axios";

export default function LaboratoryPage() {
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/lab")
      .then((res) => setLabs(Array.isArray(res.data) ? res.data : []))
      .catch((err) =>
        console.log("GET ERROR:", err.response?.data || err.message)
      );
  }, []);

  const [selectedLab, setSelectedLab] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLab, setEditLab] = useState(null);

  const [newLab, setNewLab] = useState({
    name: "",
    department: "",
    categoryDepartment: "",
    location: "",
    inCharge: "",
    totalEquipment: "",
    workingEquipment: "",
    underRepairEquipment: "",
  });

  const filteredLabs = labs
    .filter((lab) =>
      Object.values(lab || {})
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter((lab) =>
      departmentFilter ? lab.categoryDepartment === departmentFilter : true
    );

  const handleAddLab = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...newLab,
        totalEquipment: Number(newLab.totalEquipment || 0),
        workingEquipment: Number(newLab.workingEquipment || 0),
        underRepairEquipment: Number(newLab.underRepairEquipment || 0),
      };

      const res = await axios.post("http://localhost:8080/api/lab", payload);

      setLabs((prev) => [...prev, res.data]);

      setNewLab({
        name: "",
        department: "",
        categoryDepartment: "",
        location: "",
        inCharge: "",
        totalEquipment: "",
        workingEquipment: "",
        underRepairEquipment: "",
      });

      setIsAddModalOpen(false);
    } catch (err) {
      console.log("ADD ERROR:", err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/lab/${id}`);
      setLabs(labs.filter((lab) => lab.id !== id));
    } catch (err) {
      console.log("DELETE ERROR:", err.response?.data || err.message);
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...editLab,
        totalEquipment: Number(editLab.totalEquipment || 0),
        workingEquipment: Number(editLab.workingEquipment || 0),
        underRepairEquipment: Number(editLab.underRepairEquipment || 0),
      };

      const res = await axios.put(
        `http://localhost:8080/api/lab/${editLab.id}`,
        payload
      );

      setLabs(labs.map((lab) => (lab.id === editLab.id ? res.data : lab)));

      setIsEditModalOpen(false);
      setEditLab(null);
    } catch (err) {
      console.log("UPDATE ERROR:", err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="bg-amber-500 text-white p-4 font-bold text-xl">
        Laboratory Management
      </div>

      {/* CONTROLS */}
      <div className="flex justify-between p-4">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-amber-500 text-white px-4 py-2 rounded"
        >
          Add Lab
        </button>

        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="border px-3 py-2 rounded w-64"
        />
      </div>

      {/* FILTER */}
      <div className="p-4">
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Departments</option>
          <option value="Electrical & Electronic">Electrical & Electronic</option>
          <option value="Mechanical & Manufacturing">Mechanical & Manufacturing</option>
          <option value="Civil & Environmental">Civil & Environmental</option>
          <option value="Marine & Naval Architecture">Marine & Naval Architecture</option>
        </select>
      </div>

      {/* VIEW CARD */}
      {selectedLab && (
        <div className="mx-4 mb-4 p-4 bg-white shadow rounded-lg">
          <h2 className="text-xl font-bold mb-4">
            {selectedLab.name} - Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p>Total</p>
              <p className="text-2xl font-bold">{selectedLab.totalEquipment}</p>
            </div>

            <div className="bg-green-100 p-4 rounded-lg text-center">
              <p>Working</p>
              <p className="text-2xl font-bold text-green-600">
                {selectedLab.workingEquipment}
              </p>
            </div>

            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <p>Under Repair</p>
              <p className="text-2xl font-bold text-blue-600">
                {selectedLab.underRepairEquipment || 0}
              </p>
            </div>

            <div className="bg-red-100 p-4 rounded-lg text-center">
              <p>Broken</p>
              <p className="text-2xl font-bold text-red-600">
                {selectedLab.totalEquipment -
                  (selectedLab.workingEquipment +
                    (selectedLab.underRepairEquipment || 0))}
              </p>
            </div>

          </div>

          <button
            onClick={() => setSelectedLab(null)}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Close
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full border border-gray-200">

            <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
              <tr>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Dept</th>
                <th className="p-3 border">Location</th>
                <th className="p-3 border">InCharge</th>
                <th className="p-3 border text-center">Total</th>
                <th className="p-3 border text-center">Working</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="text-gray-700 text-sm">
              {filteredLabs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No labs found.
                  </td>
                </tr>
              ) : (
                filteredLabs.map((lab, index) => (
                  <tr
                    key={lab.id}
                    className={`border hover:bg-gray-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-3 border font-medium">{lab.name}</td>
                    <td className="p-3 border">{lab.department}</td>
                    <td className="p-3 border">{lab.location}</td>
                    <td className="p-3 border">{lab.inCharge}</td>
                    <td className="p-3 border text-center">{lab.totalEquipment}</td>
                    <td className="p-3 border text-center text-green-600 font-semibold">
                      {lab.workingEquipment}
                    </td>

                    <td className="p-3 border text-center space-x-2">
                      <button
                        onClick={() => setSelectedLab(lab)}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </button>

                      <button
                        onClick={() => {
                          setEditLab(lab);
                          setIsEditModalOpen(true);
                        }}
                        className="text-green-600 hover:underline"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(lab.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <h2 className="text-xl font-bold mb-4">Add Lab</h2>

            <form onSubmit={handleAddLab} className="space-y-3">
              <input className="w-full border p-2" placeholder="Name"
                value={newLab.name}
                onChange={(e) => setNewLab({ ...newLab, name: e.target.value })}
              />
              <input className="w-full border p-2" placeholder="Department"
                value={newLab.department}
                onChange={(e) => setNewLab({ ...newLab, department: e.target.value })}
              />
              <input className="w-full border p-2" placeholder="Category Department"
                value={newLab.categoryDepartment}
                onChange={(e) => setNewLab({ ...newLab, categoryDepartment: e.target.value })}
              />
              <input className="w-full border p-2" placeholder="Location"
                value={newLab.location}
                onChange={(e) => setNewLab({ ...newLab, location: e.target.value })}
              />
              <input className="w-full border p-2" placeholder="InCharge"
                value={newLab.inCharge}
                onChange={(e) => setNewLab({ ...newLab, inCharge: e.target.value })}
              />
              <input className="w-full border p-2" type="number" placeholder="Total Equipment"
                value={newLab.totalEquipment}
                onChange={(e) => setNewLab({ ...newLab, totalEquipment: e.target.value })}
              />
              <input className="w-full border p-2" type="number" placeholder="Working Equipment"
                value={newLab.workingEquipment}
                onChange={(e) => setNewLab({ ...newLab, workingEquipment: e.target.value })}
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

      {/* ✅ EDIT MODAL (ONLY ADDED PART) */}
      {isEditModalOpen && editLab && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[400px]">

            <h2 className="text-xl font-bold mb-4">Edit Lab</h2>

            <form onSubmit={handleEditSave} className="space-y-3">

              <input className="w-full border p-2"
                value={editLab.name}
                onChange={(e) => setEditLab({ ...editLab, name: e.target.value })}
              />

              <input className="w-full border p-2"
                value={editLab.department}
                onChange={(e) => setEditLab({ ...editLab, department: e.target.value })}
              />

              <input className="w-full border p-2"
                value={editLab.categoryDepartment}
                onChange={(e) => setEditLab({ ...editLab, categoryDepartment: e.target.value })}
              />

              <input className="w-full border p-2"
                value={editLab.location}
                onChange={(e) => setEditLab({ ...editLab, location: e.target.value })}
              />

              <input className="w-full border p-2"
                value={editLab.inCharge}
                onChange={(e) => setEditLab({ ...editLab, inCharge: e.target.value })}
              />

              <input className="w-full border p-2" type="number"
                value={editLab.totalEquipment}
                onChange={(e) => setEditLab({ ...editLab, totalEquipment: e.target.value })}
              />

              <input className="w-full border p-2" type="number"
                value={editLab.workingEquipment}
                onChange={(e) => setEditLab({ ...editLab, workingEquipment: e.target.value })}
              />

              <div className="flex justify-between pt-3">
                <button type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditLab(null);
                  }}
                  className="bg-gray-400 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>

                <button type="submit"
                  className="bg-green-600 text-white px-3 py-1 rounded"
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