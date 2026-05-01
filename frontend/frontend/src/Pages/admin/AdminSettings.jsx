import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSection, setActiveSection] = useState("system");

  const [form, setForm] = useState({
    // System Info
    systemName: "",
    institutionName: "",
    contactEmail: "",
    timeZone: "Asia/Colombo",

    // User Management
    allowRegistrations: true,
    requireEmailVerification: true,
    defaultRole: "student",
    sessionTimeoutMinutes: 30,

    // Equipment Settings
    defaultEquipmentStatus: "working",
    allowManualSerialEntry: true,
    maxIssuanceDays: 14,

    // Notifications
    emailNotificationsEnabled: true,
    maintenanceReminderDays: 7,
    alertOverdueIssuances: true,
    alertBrokenEquipment: true,
    smtpServer: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",

    // Reports
    defaultReportFormat: "pdf",
    auditLogRetentionYears: 3,
    grnTemplatePath: "",

    // Backups
    autoBackupEnabled: false,
    backupSchedule: "daily",
    backupDestination: "",

    // Legacy fields kept
    maintenanceWindow: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get("/api/admin/settings", { headers });
      if (res?.data) setForm((prev) => ({ ...prev, ...res.data }));
    } catch (err) {
      console.warn("Could not load admin settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post("/api/admin/settings", form, { headers });
      setSuccess("Settings saved successfully.");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get("/api/admin/export", { headers, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "equipment_backup.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Export failed. Please try again.");
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure? This will permanently delete ALL equipment and transaction records. This cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete("/api/admin/reset", { headers });
      setSuccess("System data has been reset.");
    } catch (err) {
      setError(err?.response?.data?.message || "Reset failed.");
    }
  };

  const navItems = [
    { id: "system",        label: "System Info" },
    { id: "users",         label: "User Management" },
    { id: "roles",         label: "Roles & Permissions" },
    { id: "equipment",     label: "Equipment & Labs" },
    { id: "notifications", label: "Notifications" },
    { id: "reports",       label: "Reports & Docs" },
    { id: "backup",        label: "Backup & Danger Zone" },
  ];

  const Section = ({ id, title, subtitle, children }) => (
    <div
      id={id}
      className="bg-white rounded-2xl shadow border border-gray-200 mb-6 overflow-hidden"
    >
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  );

  const Row = ({ label, description, children }) => (
    <div className="flex items-center justify-between px-6 py-4 gap-4">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">{children}</div>
    </div>
  );

  const Toggle = ({ name, checked }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={!!checked}
        onChange={handleChange}
        className="sr-only peer"
      />
      <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-yellow-500 transition-colors" />
      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
    </label>
  );

  const InputSm = ({ name, type = "text", value, placeholder, width = "w-48" }) => (
    <input
      name={name}
      type={type}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`${width} px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400`}
    />
  );

  const SelectSm = ({ name, value, options }) => (
    <select
      name={name}
      value={value}
      onChange={handleChange}
      className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
    >
      {options.map(({ label, value: v }) => (
        <option key={v} value={v}>{label}</option>
      ))}
    </select>
  );

  const Badge = ({ label, color }) => {
    const colors = {
      red:    "bg-red-50 text-red-700",
      yellow: "bg-yellow-50 text-yellow-700",
      blue:   "bg-blue-50 text-blue-700",
      green:  "bg-green-50 text-green-700",
    };
    return (
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors[color] || colors.blue}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto flex gap-0 lg:gap-8 p-6 lg:p-8">

        {/* Sidebar nav */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Settings</p>
            <nav className="flex flex-col gap-1">
              {navItems.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setActiveSection(id)}
                  className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                    activeSection === id
                      ? "bg-yellow-50 text-yellow-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Configure system-wide preferences, access, and integrations.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-4">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 text-gray-400 text-sm">Loading settings…</div>
          ) : (
            <form onSubmit={handleSave}>

              {/* ── System Info ── */}
              <Section id="system" title="System Information" subtitle="Institution and deployment details">
                <Row label="System name">
                  <InputSm name="systemName" value={form.systemName} placeholder="Equipment Management System" />
                </Row>
                <Row label="Institution name">
                  <InputSm name="institutionName" value={form.institutionName} placeholder="Faculty of Engineering" />
                </Row>
                <Row label="Contact email">
                  <InputSm name="contactEmail" type="email" value={form.contactEmail} placeholder="admin@university.lk" />
                </Row>
                <Row label="Time zone">
                  <SelectSm
                    name="timeZone"
                    value={form.timeZone}
                    options={[
                      { label: "Asia/Colombo (UTC+5:30)", value: "Asia/Colombo" },
                      { label: "UTC", value: "UTC" },
                    ]}
                  />
                </Row>
                <Row label="Maintenance window" description="Scheduled downtime window for system updates">
                  <InputSm name="maintenanceWindow" value={form.maintenanceWindow} placeholder="e.g. Sundays 02:00–04:00" />
                </Row>
              </Section>

              {/* ── User Management ── */}
              <Section id="users" title="User Management" subtitle="Accounts, roles, and access control">
                <Row label="Allow self-registration" description="Users can create accounts without admin approval">
                  <Toggle name="allowRegistrations" checked={form.allowRegistrations} />
                </Row>
                <Row label="Require email verification" description="New accounts must verify their university email">
                  <Toggle name="requireEmailVerification" checked={form.requireEmailVerification} />
                </Row>
                <Row label="Default role for new users">
                  <SelectSm
                    name="defaultRole"
                    value={form.defaultRole}
                    options={[
                      { label: "Student (view only)", value: "student" },
                      { label: "Faculty", value: "faculty" },
                      { label: "Technician", value: "technician" },
                    ]}
                  />
                </Row>
                <Row label="Session timeout" description="Auto-logout inactive users after">
                  <SelectSm
                    name="sessionTimeoutMinutes"
                    value={form.sessionTimeoutMinutes}
                    options={[
                      { label: "30 minutes", value: 30 },
                      { label: "1 hour", value: 60 },
                      { label: "4 hours", value: 240 },
                    ]}
                  />
                </Row>
              </Section>

              {/* ── Roles & Permissions ── */}
              <Section id="roles" title="Roles & Permissions" subtitle="Access level summary for each role">
                <Row label="Admin" description="Full access to all modules">
                  <Badge label="Full access" color="red" />
                </Row>
                <Row label="Technician" description="Manage equipment, labs, issuance, and maintenance">
                  <Badge label="Write access" color="yellow" />
                </Row>
                <Row label="Faculty" description="View equipment, request issuance, view manuals">
                  <Badge label="Read + Request" color="blue" />
                </Row>
                <Row label="Student" description="View equipment availability and manuals only">
                  <Badge label="Read only" color="green" />
                </Row>
                <Row label="Manage detailed permissions">
                  <a
                    href="/admin/roles"
                    className="text-sm text-yellow-600 hover:underline font-medium"
                  >
                    Edit roles →
                  </a>
                </Row>
              </Section>

              {/* ── Equipment & Labs ── */}
              <Section id="equipment" title="Equipment & Lab Settings" subtitle="Defaults for equipment tracking and issuance">
                <Row label="Default status when adding equipment">
                  <SelectSm
                    name="defaultEquipmentStatus"
                    value={form.defaultEquipmentStatus}
                    options={[
                      { label: "Working", value: "working" },
                      { label: "Under review", value: "under_review" },
                    ]}
                  />
                </Row>
                <Row label="Allow manual serial number entry" description="Disable to enforce QR/barcode scanning on check-in">
                  <Toggle name="allowManualSerialEntry" checked={form.allowManualSerialEntry} />
                </Row>
                <Row label="Maximum issuance duration (days)" description="Items overdue beyond this period will be flagged">
                  <InputSm name="maxIssuanceDays" type="number" value={form.maxIssuanceDays} width="w-24" />
                </Row>
                <Row label="Manage labs and departments">
                  <a href="/admin/labs" className="text-sm text-yellow-600 hover:underline font-medium">Manage →</a>
                </Row>
                <Row label="Manage equipment categories">
                  <a href="/admin/categories" className="text-sm text-yellow-600 hover:underline font-medium">Manage →</a>
                </Row>
              </Section>

              {/* ── Notifications ── */}
              <Section id="notifications" title="Notifications & Alerts" subtitle="Maintenance reminders and system alerts">
                <Row label="Email notifications" description="Send alerts via university email">
                  <Toggle name="emailNotificationsEnabled" checked={form.emailNotificationsEnabled} />
                </Row>
                <Row label="Maintenance due reminder (days before)">
                  <InputSm name="maintenanceReminderDays" type="number" value={form.maintenanceReminderDays} width="w-24" />
                </Row>
                <Row label="Alert on overdue issuances">
                  <Toggle name="alertOverdueIssuances" checked={form.alertOverdueIssuances} />
                </Row>
                <Row label="Alert when equipment is marked as Broken">
                  <Toggle name="alertBrokenEquipment" checked={form.alertBrokenEquipment} />
                </Row>
                <Row label="SMTP server">
                  <InputSm name="smtpServer" value={form.smtpServer} placeholder="smtp.university.lk" />
                </Row>
                <Row label="SMTP port">
                  <InputSm name="smtpPort" type="number" value={form.smtpPort} width="w-24" />
                </Row>
                <Row label="SMTP username">
                  <InputSm name="smtpUser" value={form.smtpUser} placeholder="noreply@university.lk" />
                </Row>
                <Row label="SMTP password">
                  <InputSm name="smtpPassword" type="password" value={form.smtpPassword} placeholder="••••••••" />
                </Row>
              </Section>

              {/* ── Reports ── */}
              <Section id="reports" title="Reports & Documentation" subtitle="GRN templates and report generation defaults">
                <Row label="Default report format">
                  <SelectSm
                    name="defaultReportFormat"
                    value={form.defaultReportFormat}
                    options={[
                      { label: "PDF", value: "pdf" },
                      { label: "Excel", value: "excel" },
                      { label: "CSV", value: "csv" },
                    ]}
                  />
                </Row>
                <Row label="Audit log retention period">
                  <SelectSm
                    name="auditLogRetentionYears"
                    value={form.auditLogRetentionYears}
                    options={[
                      { label: "1 year", value: 1 },
                      { label: "3 years", value: 3 },
                      { label: "5 years", value: 5 },
                      { label: "Forever", value: 0 },
                    ]}
                  />
                </Row>
                <Row label="GRN template" description="Upload your institution letterhead for Goods Received Notes">
                  <label className="cursor-pointer text-sm text-yellow-600 hover:underline font-medium">
                    Upload template
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // handle upload separately if needed
                          console.log("GRN template selected:", file.name);
                        }
                      }}
                    />
                  </label>
                </Row>
              </Section>

              {/* ── Save button ── */}
              <div className="flex justify-end mb-8">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm disabled:opacity-60 transition-colors"
                >
                  {saving ? "Saving…" : "Save Settings"}
                </button>
              </div>

            </form>
          )}

          {/* ── Backup & Danger Zone (outside form — separate actions) ── */}
          <Section id="backup" title="Backup & Danger Zone" subtitle="Data export, restore, and destructive actions">
            <Row label="Export all data" description="Download a full CSV backup of all equipment and records">
              <button
                type="button"
                onClick={handleExport}
                className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
              >
                Export CSV
              </button>
            </Row>
            <Row label="Automatic backups" description="Schedule daily backups to a remote destination">
              <Toggle name="autoBackupEnabled" checked={form.autoBackupEnabled} />
            </Row>
            {form.autoBackupEnabled && (
              <Row label="Backup destination" description="Remote path or S3 URL">
                <InputSm name="backupDestination" value={form.backupDestination} placeholder="s3://bucket/backups" />
              </Row>
            )}
            <Row
              label={<span className="text-red-600 font-medium text-sm">Reset system data</span>}
              description="Permanently delete all equipment and transaction records. Cannot be undone."
            >
              <button
                type="button"
                onClick={handleReset}
                className="text-sm px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              >
                Reset →
              </button>
            </Row>
          </Section>

        </main>
      </div>
    </div>
  );
}