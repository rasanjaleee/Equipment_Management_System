import { useEffect, useState } from "react";
import axios from "axios";

export default function TechnicianEquipment() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [statusMap, setStatusMap] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8080/api/equipment/all", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEquipmentList(res.data);

      const initialStatusMap = {};
      res.data.forEach((item) => {
        initialStatusMap[item.id] = item.status;
      });
      setStatusMap(initialStatusMap);
    } catch (err) {
      console.error("Failed to fetch equipment:", err);
      setError("Failed to load equipment");
    }
  };

  const handleStatusChange = (id, value) => {
    setStatusMap((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdate = async (item) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("equipmentName", item.equipmentName || "");
      formData.append("laboratory", item.laboratory || "");
      formData.append("model", item.model || "");
      formData.append("serialNumber", item.serialNumber || "");
      formData.append("cost", item.cost ?? "");
      formData.append("purchaseDate", item.purchaseDate || "");
      formData.append("supplier", item.supplier || "");
      formData.append("status", statusMap[item.id] || item.status);
      formData.append("grnNumber", item.grnNumber || "");

      await axios.put(
        `http://localhost:8080/api/equipment/update/${item.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setMessage("Equipment status updated successfully");
      setError("");
      setEditingId(null);
      fetchEquipment();
    } catch (err) {
      console.error(err);
      setError("Failed to update equipment status");
      setMessage("");
    }
  };

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-6">Equipment Status Update</h1>

      {message && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4">
          <p className="text-green-700 font-medium">{message}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white shadow-2xl overflow-x-auto rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-yellow-500 text-white">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Laboratory</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Current Status</th>
              <th className="px-4 py-3">Update Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {equipmentList.map((item) => (
              <tr key={item.id} className="border-b text-center">
                <td className="px-4 py-3">{item.id}</td>
                <td className="px-4 py-3">{item.equipmentName}</td>
                <td className="px-4 py-3">{item.laboratory}</td>
                <td className="px-4 py-3">{item.model || "-"}</td>
                <td className="px-4 py-3">{item.status}</td>
                <td className="px-4 py-3">
                  <select
                    value={statusMap[item.id] || item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="WORKING">WORKING</option>
                    <option value="UNDER_REPAIR">UNDER_REPAIR</option>
                    <option value="BROKEN">BROKEN</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleUpdate(item)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}

            {equipmentList.length === 0 && (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-500">
                  No equipment found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}