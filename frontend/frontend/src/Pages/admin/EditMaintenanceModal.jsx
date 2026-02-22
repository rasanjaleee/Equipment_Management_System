// src/pages/admin/EditMaintenanceModal.jsx
import { useState } from "react";

export default function EditMaintenanceModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    equipmentId: item?.equipmentId || "",
    issueDescription: item?.issueDescription || "",
    reportedDate: item?.reportedDate || "",
    dueDate: item?.dueDate || "",
    status: item?.status || "PENDING",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.equipmentId || !form.issueDescription || !form.dueDate) {
      alert("Please fill in all required fields.");
      return;
    }
    
    setLoading(true);
    try {
      await onSaved(form);
    } catch (err) {
      console.error("Failed to update maintenance record:", err);
      alert("Failed to update record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-gray-200 rounded-lg w-full max-w-3xl p-6">
        <h2 className="text-center font-semibold text-lg mb-4">
          Update Maintenance Record
        </h2>

        <form onSubmit={submit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Equipment ID">
              <input
                name="equipmentId"
                value={form.equipmentId}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border"
                placeholder="eg: 1"
              />
            </Field>

            <Field label="Issue Description">
              <input
                name="issueDescription"
                value={form.issueDescription}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border"
                placeholder="eg: Display malfunction"
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Reported Date">
              <input
                type="date"
                name="reportedDate"
                value={form.reportedDate}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border"
              />
            </Field>

            <Field label="Due Date">
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border"
              />
            </Field>

            <Field label="Status">
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border"
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </Field>
          </div>

          <div className="flex justify-center gap-4 mt-2">
            <button 
              className="bg-yellow-500 px-8 py-2 rounded font-semibold hover:bg-yellow-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-yellow-500/80 px-8 py-2 rounded font-semibold hover:bg-yellow-600/80 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-sm font-semibold mb-1">{label}</p>
      {children}
    </div>
  );
}