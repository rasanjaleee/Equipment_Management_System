// src/pages/admin/EditMaintenanceModal.jsx
import { useState } from "react";

export default function EditMaintenanceModal({ item, onClose, onSaved, equipment }) {
  // Works for both DTO and entity response
  const initialEquipmentId = item?.equipmentId ?? item?.equipment?.id ?? "";

  const [form, setForm] = useState({
    equipmentId: initialEquipmentId,
    issueDescription: item?.issueDescription || "",
    dueDate: item?.dueDate || "",
    status: item?.status || "PENDING",
    priority: item?.priority || "LOW",
    repairNote: item?.repairNote || "",
    cost: item?.cost ?? "",
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

    const payload = {
      equipment: { id: Number(form.equipmentId) }, // ✅ ManyToOne format
      issueDescription: form.issueDescription,
      dueDate: form.dueDate,
      status: form.status,
      priority: form.priority,
      repairNote: form.repairNote,
      cost: form.cost === "" ? null : Number(form.cost),
    };

    setLoading(true);
    try {
      await onSaved(payload);
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
            <Field label="Equipment">
              <select
                name="equipmentId"
                value={form.equipmentId}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border"
              >
                <option value="">Select equipment</option>
                {equipment?.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.equipmentName} - {e.laboratory} (ID: {e.id})
                  </option>
                ))}
              </select>
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
            <Field label="Due Date">
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border"
              />
            </Field>

            <Field label="Priority">
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
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

          <div className="grid grid-cols-2 gap-4">
            <Field label="Repair Note (optional)">
              <input
                name="repairNote"
                value={form.repairNote}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border"
                placeholder="eg: Replaced cable"
              />
            </Field>

            <Field label="Cost (optional)">
              <input
                type="number"
                step="0.01"
                name="cost"
                value={form.cost}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border"
                placeholder="eg: 2500"
              />
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