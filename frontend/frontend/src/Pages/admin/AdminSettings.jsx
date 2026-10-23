import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../services/api";
import { useData } from "../../context/DataContext";
import {
  Building2,
  Clock,
  Wrench,
  Bell,
  FileBarChart,
  ShieldAlert,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
} from "lucide-react";

const defaultSettings = {
  // 1. System Info
  systemName: "Faculty of Engineering Equipment Management System",
  institutionName: "Faculty of Engineering",
  contactEmail: "admin@eng.university.lk",
  timeZone: "Asia/Colombo",

  // 2. Session & Maintenance
  sessionTimeoutMinutes: 30,
  maintenanceModeEnabled: false,
  maintenanceStartTime: "",
  maintenanceEndTime: "",
  maintenanceMessage: "The system is currently undergoing scheduled maintenance. Please check back later.",

  // 3. Equipment & Issuance
  defaultEquipmentStatus: "WORKING",
  maxIssuanceDays: 14,
  allowManualSerialEntry: true,

  // 4. Notifications
  emailNotificationsEnabled: true,
  maintenanceReminderDays: 7,
  alertOverdueIssuances: true,
  alertBrokenEquipment: true,

  // 5. Reports & Audit Logs
  defaultReportFormat: "PDF",
  auditLogRetentionYears: 3,
};

export default function AdminSettings() {
  const {
    settings: cachedSettings,
    setSettings: setCachedSettings,
    refreshSettings,
  } = useData();

  const loggedInUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();

  const isSuperAdmin =
    loggedInUser?.role === "SUPER_ADMIN" ||
    loggedInUser?.role === "ROLE_SUPER_ADMIN";

  const [form, setForm] = useState(
    cachedSettings ? { ...defaultSettings, ...cachedSettings } : defaultSettings
  );
  const [loading, setLoading] = useState(!cachedSettings);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [cleaningLogs, setCleaningLogs] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSection, setActiveSection] = useState("system");

  // Protected Reset Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetPhraseInput, setResetPhraseInput] = useState("");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchSettings = async () => {
    if (!cachedSettings) setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/settings`, {
        headers: getHeaders(),
      });
      if (res?.data) {
        setForm((prev) => ({ ...prev, ...res.data }));
        setCachedSettings(res.data);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        console.warn("Could not load admin settings:", err);
        setError("Unable to load settings from server. Showing cached or default configuration.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  const validateForm = () => {
    if (!form.systemName?.trim()) return "System name is required.";
    if (!form.institutionName?.trim()) return "Institution name is required.";
    if (!form.contactEmail?.trim()) return "Contact email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.contactEmail.trim())) {
      return "Please enter a valid email address.";
    }
    if (form.sessionTimeoutMinutes < 5 || form.sessionTimeoutMinutes > 1440) {
      return "Session timeout must be between 5 and 1440 minutes.";
    }
    if (form.maxIssuanceDays < 1 || form.maxIssuanceDays > 365) {
      return "Maximum issuance duration must be between 1 and 365 days.";
    }
    if (form.maintenanceReminderDays < 1 || form.maintenanceReminderDays > 60) {
      return "Maintenance reminder threshold must be between 1 and 60 days.";
    }
    if (
      form.maintenanceModeEnabled &&
      form.maintenanceStartTime &&
      form.maintenanceEndTime
    ) {
      if (new Date(form.maintenanceEndTime) <= new Date(form.maintenanceStartTime)) {
        return "Maintenance end time must be after the start time.";
      }
    }
    return null;
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/settings`, form, {
        headers: getHeaders(),
      });
      const updated = res.data || form;
      setForm((prev) => ({ ...prev, ...updated }));
      setCachedSettings(updated);
      setSuccess("All settings saved and persisted successfully.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save settings.";
      setError(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (format = "zip") => {
    setExporting(true);
    setError("");
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/admin/export?format=${format}`,
        {
          headers: getHeaders(),
          responseType: "blob",
        }
      );

      const mimeType = format === "csv" ? "text/csv" : "application/zip";
      const fileName =
        format === "csv"
          ? `equipment_export_${new Date().toISOString().slice(0, 10)}.csv`
          : `system_backup_${new Date().toISOString().slice(0, 10)}.zip`;

      const blob = new Blob([res.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(`Export downloaded successfully (${fileName}).`);
    } catch (err) {
      console.error("Export error:", err);
      setError("Failed to export data. Please check administrator permissions.");
    } finally {
      setExporting(false);
    }
  };

  const handleCleanupLogs = async () => {
    if (!isSuperAdmin) {
      setError("Only Super Admin can execute audit log cleanup.");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to clean up audit logs older than ${form.auditLogRetentionYears} year(s)?`
      )
    ) {
      return;
    }

    setCleaningLogs(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/admin/activity-logs/cleanup?years=${form.auditLogRetentionYears}`,
        {},
        { headers: getHeaders() }
      );
      setSuccess(res.data?.message || "Audit log cleanup completed successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Audit log cleanup failed.");
    } finally {
      setCleaningLogs(false);
    }
  };

  const handleProtectedReset = async () => {
    if (resetPhraseInput !== "RESET-EQUIPMENT-DATA") {
      setError("The confirmation phrase does not match 'RESET-EQUIPMENT-DATA'.");
      return;
    }

    setResetting(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/admin/reset`,
        { confirmationPhrase: resetPhraseInput },
        { headers: getHeaders() }
      );
      setResetModalOpen(false);
      setResetPhraseInput("");
      setSuccess(
        res.data?.message ||
          "System operational data has been successfully reset. Administrator accounts and settings are preserved."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. Ensure you are logged in as SUPER_ADMIN.");
    } finally {
      setResetting(false);
    }
  };

  const navItems = [
    { id: "system", label: "1. System Information", icon: Building2 },
    { id: "session", label: "2. Session & Maintenance", icon: Clock },
    { id: "equipment", label: "3. Equipment & Issuance", icon: Wrench },
    { id: "notifications", label: "4. Notifications & Alerts", icon: Bell },
    { id: "reports", label: "5. Reports & Audit Logs", icon: FileBarChart },
    { id: "datamanagement", label: "6. Data Management", icon: ShieldAlert },
  ];

  const Section = ({ id, title, subtitle, children }) => (
    <div
      id={id}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden transition-all hover:border-gray-300"
    >
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  );

  const Row = ({ label, description, children }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 gap-4 hover:bg-gray-50/50 transition-colors">
      <div className="max-w-xl">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">{children}</div>
    </div>
  );

  const Toggle = ({ name, checked, disabled = false }) => (
    <label className={`relative inline-flex items-center ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
      <input
        type="checkbox"
        name={name}
        checked={!!checked}
        disabled={disabled}
        onChange={handleChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-yellow-500 transition-colors" />
      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
    </label>
  );

  const InputSm = ({
    name,
    type = "text",
    value,
    placeholder,
    width = "w-64",
    disabled = false,
  }) => (
    <input
      name={name}
      type={type}
      value={value ?? ""}
      disabled={disabled}
      onChange={handleChange}
      placeholder={placeholder}
      className={`${width} px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all disabled:bg-gray-100 disabled:text-gray-400`}
    />
  );

  const SelectSm = ({ name, value, options, width = "w-64" }) => (
    <select
      name={name}
      value={value}
      onChange={handleChange}
      className={`${width} px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all`}
    >
      {options.map(({ label, value: v }) => (
        <option key={v} value={v}>
          {label}
        </option>
      ))}
    </select>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Sticky Sidebar Navigation */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="pb-3 mb-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Admin Settings
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Faculty Equipment System</p>
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map(({ id, label, icon: Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center gap-2.5 text-xs font-medium px-3 py-2.5 rounded-xl transition-all ${
                    activeSection === id
                      ? "bg-yellow-50 text-yellow-800 font-semibold shadow-xs border border-yellow-200/50"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 text-yellow-600" />
                  <span className="truncate">{label}</span>
                </a>
              ))}
            </nav>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-xl font-medium text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Save All Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Form */}
        <main className="flex-1 min-w-0">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                System & Admin Settings
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Configure faculty system parameters, session timeouts, maintenance mode, and business rules.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Settings
                </>
              )}
            </button>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6 flex items-start gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800 flex-1">{error}</div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl mb-6 flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800 flex-1">{success}</div>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-200">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-yellow-500 mb-2" />
              Loading system settings from database...
            </div>
          ) : (
            <form onSubmit={handleSave}>
              {/* ── SECTION 1: System Information ── */}
              <Section
                id="system"
                title="1. System Information"
                subtitle="University faculty identification and global contact details"
              >
                <Row
                  label="System Name"
                  description="Display name of the application across navigation bars, page titles, and reports"
                >
                  <InputSm
                    name="systemName"
                    value={form.systemName}
                    placeholder="Equipment Management System"
                  />
                </Row>
                <Row
                  label="Institution / Faculty Name"
                  description="Faculty or department governing equipment ownership and laboratories"
                >
                  <InputSm
                    name="institutionName"
                    value={form.institutionName}
                    placeholder="Faculty of Engineering"
                  />
                </Row>
                <Row
                  label="Contact Email"
                  description="Primary administrative contact for automated notices and user inquiries"
                >
                  <InputSm
                    name="contactEmail"
                    type="email"
                    value={form.contactEmail}
                    placeholder="admin@eng.university.lk"
                  />
                </Row>
                <Row
                  label="Application Time Zone"
                  description="Server reference zone used for maintenance windows, due dates, and audit logs"
                >
                  <SelectSm
                    name="timeZone"
                    value={form.timeZone}
                    options={[
                      { label: "Asia/Colombo (UTC+5:30)", value: "Asia/Colombo" },
                      { label: "UTC (Coordinated Universal Time)", value: "UTC" },
                    ]}
                  />
                </Row>
              </Section>

              {/* ── SECTION 2: Session & Maintenance ── */}
              <Section
                id="session"
                title="2. Session & Maintenance"
                subtitle="JWT authentication session timeouts and system-wide maintenance downtime mode"
              >
                <Row
                  label="Session Timeout (Minutes)"
                  description="Server-side JWT token lifespan before automatic session expiration and logout"
                >
                  <SelectSm
                    name="sessionTimeoutMinutes"
                    value={form.sessionTimeoutMinutes}
                    options={[
                      { label: "15 minutes (High Security)", value: 15 },
                      { label: "30 minutes (Standard)", value: 30 },
                      { label: "60 minutes (1 Hour)", value: 60 },
                      { label: "120 minutes (2 Hours)", value: 120 },
                      { label: "240 minutes (4 Hours)", value: 240 },
                      { label: "1440 minutes (24 Hours)", value: 1440 },
                    ]}
                  />
                </Row>
                <Row
                  label="Maintenance Mode"
                  description="Enforces downtime on non-admin users (HTTP 503). Super Admins and Admins retain full access."
                >
                  <Toggle
                    name="maintenanceModeEnabled"
                    checked={form.maintenanceModeEnabled}
                  />
                </Row>
                {form.maintenanceModeEnabled && (
                  <>
                    <Row
                      label="Maintenance Start Time"
                      description="Scheduled downtime start (optional; leave blank to activate immediately)"
                    >
                      <InputSm
                        name="maintenanceStartTime"
                        type="datetime-local"
                        value={form.maintenanceStartTime}
                      />
                    </Row>
                    <Row
                      label="Maintenance End Time"
                      description="Scheduled downtime end (optional; leave blank for indefinite maintenance)"
                    >
                      <InputSm
                        name="maintenanceEndTime"
                        type="datetime-local"
                        value={form.maintenanceEndTime}
                      />
                    </Row>
                    <Row
                      label="Maintenance Message"
                      description="Banner message presented to ordinary users when maintenance mode is active"
                    >
                      <textarea
                        name="maintenanceMessage"
                        value={form.maintenanceMessage || ""}
                        onChange={handleChange}
                        rows={2}
                        className="w-full sm:w-80 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                        placeholder="Maintenance notification message..."
                      />
                    </Row>
                  </>
                )}
              </Section>

              {/* ── SECTION 3: Equipment & Issuance ── */}
              <Section
                id="equipment"
                title="3. Equipment & Issuance"
                subtitle="Equipment registration status defaults, barcode constraints, and issuance loan limits"
              >
                <Row
                  label="Default Equipment Status"
                  description="Initial operational status assigned when adding new equipment without explicit status"
                >
                  <SelectSm
                    name="defaultEquipmentStatus"
                    value={form.defaultEquipmentStatus}
                    options={[
                      { label: "Working (Ready for issuance)", value: "WORKING" },
                      { label: "Under Repair (Maintenance queue)", value: "UNDER_REPAIR" },
                      { label: "Broken (Damaged / Out of order)", value: "BROKEN" },
                    ]}
                  />
                </Row>
                <Row
                  label="Maximum Issuance Duration (Days)"
                  description="Strict loan limit enforced on student/faculty equipment issuance requests"
                >
                  <InputSm
                    name="maxIssuanceDays"
                    type="number"
                    value={form.maxIssuanceDays}
                    width="w-32"
                  />
                </Row>
                <Row
                  label="Allow Manual Serial Number Entry"
                  description="When disabled, manual serial entry is rejected by the server to enforce QR/barcode scans"
                >
                  <Toggle
                    name="allowManualSerialEntry"
                    checked={form.allowManualSerialEntry}
                  />
                </Row>
              </Section>

              {/* ── SECTION 4: Notifications ── */}
              <Section
                id="notifications"
                title="4. Notifications & Alerts"
                subtitle="Real-time WebSocket and notification delivery policies for university managers"
              >
                <Row
                  label="Global Notifications"
                  description="Master switch. When disabled, suppresses all automated notification dispatches."
                >
                  <Toggle
                    name="emailNotificationsEnabled"
                    checked={form.emailNotificationsEnabled}
                  />
                </Row>
                <Row
                  label="Maintenance Reminder Lead Time (Days)"
                  description="Sends scheduled maintenance due notifications to managers X days in advance"
                >
                  <InputSm
                    name="maintenanceReminderDays"
                    type="number"
                    value={form.maintenanceReminderDays}
                    width="w-32"
                  />
                </Row>
                <Row
                  label="Alert on Overdue Issuances"
                  description="Automated daily notification to administrators for equipment not returned by due date"
                >
                  <Toggle
                    name="alertOverdueIssuances"
                    checked={form.alertOverdueIssuances}
                  />
                </Row>
                <Row
                  label="Alert on Broken Equipment"
                  description="Dispatches high-priority alert when an item is marked as Broken in inventory"
                >
                  <Toggle
                    name="alertBrokenEquipment"
                    checked={form.alertBrokenEquipment}
                  />
                </Row>
              </Section>

              {/* ── SECTION 5: Reports & Audit Logs ── */}
              <Section
                id="reports"
                title="5. Reports & Audit Logs"
                subtitle="Export format preferences and automated retention cleanup for administrative logs"
              >
                <Row
                  label="Default Report Format"
                  description="Format supported by server report generators (iText PDF and Commons CSV)"
                >
                  <SelectSm
                    name="defaultReportFormat"
                    value={form.defaultReportFormat}
                    options={[
                      { label: "PDF (Printable Document Format)", value: "PDF" },
                      { label: "CSV (Comma-Separated Values)", value: "CSV" },
                    ]}
                  />
                </Row>
                <Row
                  label="Audit Log Retention Period"
                  description="Automated monthly cleanup removes audit activity records older than the selected threshold"
                >
                  <SelectSm
                    name="auditLogRetentionYears"
                    value={form.auditLogRetentionYears}
                    options={[
                      { label: "1 Year", value: 1 },
                      { label: "2 Years", value: 2 },
                      { label: "3 Years (Recommended)", value: 3 },
                      { label: "5 Years", value: 5 },
                      { label: "Keep Indefinitely (0)", value: 0 },
                    ]}
                  />
                </Row>
                {form.auditLogRetentionYears > 0 && isSuperAdmin && (
                  <Row
                    label="Execute Audit Retention Cleanup"
                    description={`Safely delete audit log entries older than ${form.auditLogRetentionYears} years right now`}
                  >
                    <button
                      type="button"
                      onClick={handleCleanupLogs}
                      disabled={cleaningLogs}
                      className="px-4 py-2 text-xs font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-2"
                    >
                      {cleaningLogs ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Cleaning...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5 text-gray-500" /> Run Retention Cleanup
                        </>
                      )}
                    </button>
                  </Row>
                )}
              </Section>

              {/* Bottom Save Button */}
              <div className="flex justify-end mb-8">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving Settings...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ── SECTION 6: Data Management (Standalone Actions) ── */}
          <Section
            id="datamanagement"
            title="6. Data Management"
            subtitle="Full system data export backups and protected administrative database reset"
          >
            <Row
              label="Export System Data"
              description="Download complete archive containing CSV files for equipment, issuances, maintenance, labs, and audit logs. Sensitive passwords strictly excluded."
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExport("zip")}
                  disabled={exporting}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors flex items-center gap-1.5"
                >
                  {exporting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-gray-600" />
                  )}
                  Export ZIP Backup
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("csv")}
                  disabled={exporting}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                >
                  CSV Only
                </button>
              </div>
            </Row>

            <Row
              label={
                <span className="text-red-600 font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Protected System Reset
                </span>
              }
              description="High-risk action. Clears all equipment, issuances, borrow requests, maintenance, and notification records. System settings and administrator accounts are strictly preserved."
            >
              <button
                type="button"
                onClick={() => {
                  if (!isSuperAdmin) {
                    setError("Only Super Admin is authorized to perform system reset.");
                    return;
                  }
                  setResetPhraseInput("");
                  setResetModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-red-300 text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                Reset System Data...
              </button>
            </Row>
          </Section>
        </main>
      </div>

      {/* ── Protected Reset Confirmation Modal ── */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-red-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-red-600 px-6 py-4 text-white flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-base">Protected System Reset</h3>
                <p className="text-xs text-red-100 mt-0.5">High-Risk Administrative Operation</p>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                This operation will <strong>permanently delete</strong> all equipment units, issuance transactions, borrow requests, maintenance records, and notifications.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 mb-5">
                <strong>What is preserved:</strong> System configuration settings, Super Admin, and Admin accounts will remain intact.
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Type <span className="font-mono text-red-600 select-all font-bold">RESET-EQUIPMENT-DATA</span> to confirm:
                </label>
                <input
                  type="text"
                  value={resetPhraseInput}
                  onChange={(e) => setResetPhraseInput(e.target.value)}
                  placeholder="RESET-EQUIPMENT-DATA"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  disabled={resetting}
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={resetPhraseInput !== "RESET-EQUIPMENT-DATA" || resetting}
                  onClick={handleProtectedReset}
                  className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {resetting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Resetting Database...
                    </>
                  ) : (
                    "Confirm & Execute Reset"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}