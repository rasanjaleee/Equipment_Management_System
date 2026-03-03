import { useState } from "react";

export default function LaboratoryPage() {
  const [labs, setLabs] = useState([
    {
      id: 1,
      name: "Electrical Machines & Power Electronics Lab",
      department: "EIE Dept",
      categoryDepartment: "Electrical & Electronic",
      location: "Block A - Room 201",
      inCharge: "Mr. Silva",
      totalEquipment: 50,
      workingEquipment: 45,
    },
    {
      id: 2,
      name: "Power System & High Voltage Lab",
      department: "EIE Dept",
      categoryDepartment: "Electrical & Electronic",
      location: "Block A - Room 202",
      inCharge: "Ms. Fernando",
      totalEquipment: 40,
      workingEquipment: 38,
    },
    {
      id: 3,
      name: "Electronics & Measurements Lab",
      department: "EIE Dept",
      categoryDepartment: "Electrical & Electronic",
      location: "Block B - Room 101",
      inCharge: "Mr. Perera",
      totalEquipment: 55,
      workingEquipment: 50,
    },
    {
      id: 4,
      name: "Communication & Systems Engineering Lab",
      department: "EIE Dept",
      categoryDepartment: "Electrical & Electronic",
      location: "Block B - Room 102",
      inCharge: "Ms. Jayawardena",
      totalEquipment: 45,
      workingEquipment: 42,
    },
    {
      id: 5,
      name: "Undergraduate Project Development Lab",
      department: "EIE Dept",
      categoryDepartment: "Electrical & Electronic",
      location: "Block C - Room 301",
      inCharge: "Mr. Kumara",
      totalEquipment: 30,
      workingEquipment: 28,
    },
    {
      id: 6,
      name: "Information Engineering Lab",
      department: "CS Dept",
      categoryDepartment: "Electrical & Electronic",
      location: "Block C - Room 302",
      inCharge: "Ms. Silva",
      totalEquipment: 35,
      workingEquipment: 33,
    },
  ]);

  const [selectedLab, setSelectedLab] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLab, setNewLab] = useState({
    name: "",
    department: "",
    categoryDepartment: "",
    location: "",
    inCharge: "",
    totalEquipment: 0,
    workingEquipment: 0,
  });

  const filteredLabs = labs
    .filter((lab) =>
      Object.values(lab)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter((lab) =>
      departmentFilter ? lab.categoryDepartment === departmentFilter : true
    );

  const handleAddLab = (e) => {
    e.preventDefault();
    const labToAdd = { ...newLab, id: labs.length + 1 };
    setLabs([...labs, labToAdd]);
    setNewLab({
      name: "",
      department: "",
      categoryDepartment: "",
      location: "",
      inCharge: "",
      totalEquipment: 0,
      workingEquipment: 0,
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      {/* Header */}
      <div className="bg-amber-500 text-white font-bold text-xl p-4">
        Laboratory Management
      </div>

      {/* Controls */}
      <div className="flex justify-between p-6">
        <button
          className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Laboratory
        </button>

        <input
          type="text"
          placeholder="Search Labs..."
          className="border border-gray-300 px-2 py-1 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Department Filter */}
      <div className="ml-5 mb-4 text-base">
        <label>
          Filter by Department:{" "}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="ml-2 px-2 py-1 border border-gray-300 rounded"
          >
            <option value="">All Departments</option>
            <option value="Electrical & Electronic">Electrical & Electronic</option>
            <option value="Mechanical & Manufacturing">Mechanical & Manufacturing</option>
            <option value="Civil & Environmental">Civil & Environmental</option>
            <option value="Marine & Naval Architecture">Marine & Naval Architecture</option>
          </select>
        </label>
      </div>

      {/* Lab Table */}
      <div className="overflow-x-auto mx-6 mb-8 bg-white rounded shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 text-left">Lab Name</th>
              <th className="px-4 py-2 text-left">Department</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-left">Lab In-Charge</th>
              <th className="px-4 py-2 text-left">Total Equipment</th>
              <th className="px-4 py-2 text-left">Working</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLabs.length > 0 ? (
              filteredLabs.map((lab) => (
                <tr key={lab.id} className="border-b">
                  <td className="px-4 py-2">{lab.name}</td>
                  <td className="px-4 py-2">{lab.department}</td>
                  <td className="px-4 py-2">{lab.location}</td>
                  <td className="px-4 py-2">{lab.inCharge}</td>
                  <td className="px-4 py-2">{lab.totalEquipment}</td>
                  <td className="px-4 py-2">{lab.workingEquipment}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => setSelectedLab(lab)}
                    >
                      View
                    </button>
                    <button className="text-green-500 hover:underline">Edit</button>
                    <button className="text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No labs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Lab Modal */}
      {selectedLab && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-3/4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">{selectedLab.name}</h2>
              <button
                className="text-red-500 font-bold"
                onClick={() => setSelectedLab(null)}
              >
                X
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4 text-white font-bold text-center">
              <div className="bg-amber-500 p-4 rounded">Total: {selectedLab.totalEquipment}</div>
              <div className="bg-green-500 p-4 rounded">Working: {selectedLab.workingEquipment}</div>
              <div className="bg-red-500 p-4 rounded">
                Broken: {selectedLab.totalEquipment - selectedLab.workingEquipment}
              </div>
              <div className="bg-blue-500 p-4 rounded">Issued: 5</div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Equipment in this Lab</h3>
              <table className="w-full border-collapse bg-gray-50">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2 text-left">Equipment Name</th>
                    <th className="px-4 py-2 text-left">Model / Serial</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Availability</th>
                    <th className="px-4 py-2 text-left">Last Maintenance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-2">Multimeter</td>
                    <td className="px-4 py-2">MT-101</td>
                    <td className="px-4 py-2">Working</td>
                    <td className="px-4 py-2">Available</td>
                    <td className="px-4 py-2">2026-02-15</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2">Oscilloscope</td>
                    <td className="px-4 py-2">OS-500</td>
                    <td className="px-4 py-2">Repair</td>
                    <td className="px-4 py-2">Issued</td>
                    <td className="px-4 py-2">2026-02-10</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
                onClick={() => setSelectedLab(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lab Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-1/2 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Add New Laboratory</h2>
              <button
                className="text-red-500 font-bold"
                onClick={() => setIsAddModalOpen(false)}
              >
                X
              </button>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleAddLab}>
              <label className="flex flex-col text-sm font-medium">
                Lab Name:
                <input
                  type="text"
                  value={newLab.name}
                  onChange={(e) =>
                    setNewLab({ ...newLab, name: e.target.value })
                  }
                  className="border border-gray-300 px-2 py-1 rounded"
                  required
                />
              </label>

              <label className="flex flex-col text-sm font-medium">
                Department:
                <select
                  value={newLab.categoryDepartment}
                  onChange={(e) =>
                    setNewLab({ ...newLab, categoryDepartment: e.target.value })
                  }
                  className="border border-gray-300 px-2 py-1 rounded"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Electrical & Electronic">Electrical & Electronic</option>
                  <option value="Mechanical & Manufacturing">Mechanical & Manufacturing</option>
                  <option value="Civil & Environmental">Civil & Environmental</option>
                  <option value="Marine & Naval Architecture">Marine & Naval Architecture</option>
                </select>
              </label>

              <label className="flex flex-col text-sm font-medium">
                Location:
                <input
                  type="text"
                  value={newLab.location}
                  onChange={(e) =>
                    setNewLab({ ...newLab, location: e.target.value })
                  }
                  className="border border-gray-300 px-2 py-1 rounded"
                  required
                />
              </label>

              <label className="flex flex-col text-sm font-medium">
                Lab In-Charge:
                <input
                  type="text"
                  value={newLab.inCharge}
                  onChange={(e) =>
                    setNewLab({ ...newLab, inCharge: e.target.value })
                  }
                  className="border border-gray-300 px-2 py-1 rounded"
                  required
                />
              </label>

              <label className="flex flex-col text-sm font-medium">
                Total Equipment:
                <input
                  type="number"
                  value={newLab.totalEquipment}
                  onChange={(e) =>
                    setNewLab({
                      ...newLab,
                      totalEquipment: Number(e.target.value),
                    })
                  }
                  className="border border-gray-300 px-2 py-1 rounded"
                  required
                />
              </label>

              <label className="flex flex-col text-sm font-medium">
                Working Equipment:
                <input
                  type="number"
                  value={newLab.workingEquipment}
                  onChange={(e) =>
                    setNewLab({
                      ...newLab,
                      workingEquipment: Number(e.target.value),
                    })
                  }
                  className="border border-gray-300 px-2 py-1 rounded"
                  required
                />
              </label>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="submit"
                  className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
                >
                  Add Lab
                </button>
                <button
                  type="button"
                  className="text-red-500 font-bold px-4 py-2 rounded border border-red-500 hover:bg-red-50"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}