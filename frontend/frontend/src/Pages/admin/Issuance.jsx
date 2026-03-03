import { useState } from "react";
import axios from "axios";

const SectionTitle = ({ icon, title }) => (
  <div className="flex items-center gap-2 text-gray-700 font-semibold mt-6 mb-3">
    <span className="text-lg">{icon}</span>
    <span className="text-sm md:text-base">{title}</span>
  </div>
);

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs text-gray-600">{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm
               focus:outline-none focus:ring-2 focus:ring-amber-400"
  />
);

const Select = (props) => (
  <select
    {...props}
    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm
               focus:outline-none focus:ring-2 focus:ring-amber-400"
  />
);

export default function Issuance() {
  const [form, setForm] = useState({
    issuanceId: "",
    issueDate: "",
    returnDueDate: "",
    status: "Issued",

    equipmentId: "",
    equipmentName: "",
    qtyIssued: "",
    conditionAtIssue: "Working",

    userId: "",
    name: "",
    roleDept: "Student",
    contact: "",

    returnDate: "",
    conditionOnReturn: "Working",
    remarks: "",
  });

  const update = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first.");
      return;
    }

    const payload = {
      issuanceId: form.issuanceId,
      issueDate: form.issueDate || null,
      returnDueDate: form.returnDueDate || null,
      status: form.status,
      equipmentId: form.equipmentId ? Number(form.equipmentId) : null,
      qtyIssued: form.qtyIssued ? Number(form.qtyIssued) : null,
      conditionAtIssue: form.conditionAtIssue,
      userId: form.userId ? Number(form.userId) : null,
      roleDept: form.roleDept || null,
      contact: form.contact || null,
      returnDate: form.returnDate || null,
      conditionOnReturn: form.conditionOnReturn || null,
      remarks: form.remarks || null,
    };

    try {
      setSaving(true);
      const res = await axios.post(
        "http://localhost:8080/api/issuances",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Issuance saved:", res.data);
      alert("Saved ✅");
      handleClear();
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to save issuance.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setForm({
      issuanceId: "",
      issueDate: "",
      returnDueDate: "",
      status: "Issued",

      equipmentId: "",
      equipmentName: "",
      qtyIssued: "",
      conditionAtIssue: "Working",

      userId: "",
      name: "",
      roleDept: "Student",
      contact: "",

      returnDate: "",
      conditionOnReturn: "Working",
      remarks: "",
    });
    setError("");
  };

  return (
    <div className="p-6">
      {/* Page container */}
      <div className="max-w-5xl mx-auto">
        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
        >
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {/* Issuance Details */}
          <SectionTitle icon="🧾" title="Issuance Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Issuance ID">
              <Input
                placeholder="ISS-001"
                value={form.issuanceId}
                onChange={update("issuanceId")}
              />
            </Field>

            <Field label="Issue Date">
              <Input
                type="date"
                value={form.issueDate}
                onChange={update("issueDate")}
              />
            </Field>

            <Field label="Return Due Date">
              <Input
                type="date"
                value={form.returnDueDate}
                onChange={update("returnDueDate")}
              />
            </Field>

            <Field label="Status">
              <Select value={form.status} onChange={update("status")}>
                <option value="Issued">Issued</option>
                <option value="Pending">Pending</option>
                <option value="Returned">Returned</option>
                <option value="Overdue">Overdue</option>
              </Select>
            </Field>
          </div>

          {/* Equipment Information */}
          <SectionTitle icon="🔧" title="Equipment Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Equipment ID">
              <Input
                placeholder="OSC-001"
                value={form.equipmentId}
                onChange={update("equipmentId")}
              />
            </Field>

            <Field label="Equipment Name">
              <Input
                placeholder="Digital Oscilloscope"
                value={form.equipmentName}
                onChange={update("equipmentName")}
              />
            </Field>

            <Field label="Quantity Issued">
              <Input
                type="number"
                min="1"
                placeholder="1"
                value={form.qtyIssued}
                onChange={update("qtyIssued")}
              />
            </Field>

            <Field label="Condition at Issue">
              <Select
                value={form.conditionAtIssue}
                onChange={update("conditionAtIssue")}
              >
                <option value="Working">Working</option>
                <option value="Broken">Broken</option>
                <option value="Under Repair">Under Repair</option>
              </Select>
            </Field>
          </div>

          {/* User Information */}
          <SectionTitle icon="👤" title="User Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="User ID">
              <Input
                placeholder="U-1001"
                value={form.userId}
                onChange={update("userId")}
              />
            </Field>

            <Field label="Name">
              <Input
                placeholder="Student Name"
                value={form.name}
                onChange={update("name")}
              />
            </Field>

            <Field label="Role / Department">
              <Select value={form.roleDept} onChange={update("roleDept")}>
                <option value="Student">Student</option>
                <option value="Lab Assistant">Lab Assistant</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Technician">Technician</option>
              </Select>
            </Field>

            <Field label="Contact">
              <Input
                placeholder="+94 7X XXX XXXX"
                value={form.contact}
                onChange={update("contact")}
              />
            </Field>
          </div>

          {/* Return Details */}
          <SectionTitle icon="↩️" title="Return Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Return Date">
              <Input
                type="date"
                value={form.returnDate}
                onChange={update("returnDate")}
              />
            </Field>

            <Field label="Condition on Return">
              <Select
                value={form.conditionOnReturn}
                onChange={update("conditionOnReturn")}
              >
                <option value="Working">Working</option>
                <option value="Broken">Broken</option>
                <option value="Under Repair">Under Repair</option>
                <option value="Missing Parts">Missing Parts</option>
              </Select>
            </Field>
          </div>

          {/* Remarks */}
          <div className="mt-4">
            <label className="text-xs text-gray-600">Remarks</label>
            <textarea
              rows={3}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Optional notes..."
              value={form.remarks}
              onChange={update("remarks")}
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="h-10 px-5 rounded-md bg-amber-500 text-white font-semibold
                         hover:bg-amber-600 active:scale-[0.99] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="h-10 px-5 rounded-md border border-gray-300 text-gray-700
                         hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
