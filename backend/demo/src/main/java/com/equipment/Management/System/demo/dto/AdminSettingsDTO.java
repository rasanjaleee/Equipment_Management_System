package com.equipment.Management.System.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AdminSettingsDTO {

    // ── 1. System Information ──
    @NotBlank(message = "System name is required")
    @Size(max = 150, message = "System name must not exceed 150 characters")
    private String systemName = "Faculty of Engineering Equipment Management System";

    @NotBlank(message = "Institution name is required")
    @Size(max = 150, message = "Institution name must not exceed 150 characters")
    private String institutionName = "Faculty of Engineering";

    @NotBlank(message = "Contact email is required")
    @Email(message = "Please provide a valid contact email address")
    @Size(max = 150, message = "Contact email must not exceed 150 characters")
    private String contactEmail = "admin@eng.university.lk";

    @Size(max = 50, message = "Time zone must not exceed 50 characters")
    private String timeZone = "Asia/Colombo";

    // ── 2. Session & Maintenance ──
    @NotNull(message = "Session timeout is required")
    @Min(value = 5, message = "Session timeout must be at least 5 minutes")
    @Max(value = 1440, message = "Session timeout cannot exceed 1440 minutes (24 hours)")
    private Integer sessionTimeoutMinutes = 30;

    private Boolean maintenanceModeEnabled = false;

    private String maintenanceStartTime = "";

    private String maintenanceEndTime = "";

    @Size(max = 500, message = "Maintenance message must not exceed 500 characters")
    private String maintenanceMessage = "The system is currently undergoing scheduled maintenance. Please check back later.";

    // ── 3. Equipment & Issuance ──
    @NotBlank(message = "Default equipment status is required")
    @Pattern(regexp = "(?i)^(WORKING|UNDER_REPAIR|BROKEN)$", message = "Default equipment status must be WORKING, UNDER_REPAIR, or BROKEN")
    private String defaultEquipmentStatus = "WORKING";

    @NotNull(message = "Maximum issuance days is required")
    @Min(value = 1, message = "Maximum issuance days must be at least 1 day")
    @Max(value = 365, message = "Maximum issuance days cannot exceed 365 days")
    private Integer maxIssuanceDays = 14;

    @NotNull(message = "Allow manual serial entry setting is required")
    private Boolean allowManualSerialEntry = true;

    // ── 4. Notifications ──
    @NotNull(message = "Global notification toggle is required")
    private Boolean emailNotificationsEnabled = true;

    @NotNull(message = "Maintenance reminder days is required")
    @Min(value = 1, message = "Maintenance reminder must be at least 1 day before")
    @Max(value = 60, message = "Maintenance reminder cannot exceed 60 days")
    private Integer maintenanceReminderDays = 7;

    @NotNull(message = "Overdue issuance alerts toggle is required")
    private Boolean alertOverdueIssuances = true;

    @NotNull(message = "Broken equipment alerts toggle is required")
    private Boolean alertBrokenEquipment = true;

    // ── 5. Reports & Audit Logs ──
    @NotBlank(message = "Default report format is required")
    @Pattern(regexp = "(?i)^(PDF|CSV)$", message = "Default report format must be either PDF or CSV")
    private String defaultReportFormat = "PDF";

    @NotNull(message = "Audit log retention years is required")
    @Min(value = 0, message = "Retention years must be 0 (indefinite) or positive")
    @Max(value = 10, message = "Retention years cannot exceed 10 years")
    private Integer auditLogRetentionYears = 3;

    public AdminSettingsDTO() {
    }

    public String getSystemName() {
        return systemName;
    }

    public void setSystemName(String systemName) {
        this.systemName = systemName;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }

    public Integer getSessionTimeoutMinutes() {
        return sessionTimeoutMinutes;
    }

    public void setSessionTimeoutMinutes(Integer sessionTimeoutMinutes) {
        this.sessionTimeoutMinutes = sessionTimeoutMinutes;
    }

    public Boolean getMaintenanceModeEnabled() {
        return maintenanceModeEnabled;
    }

    public void setMaintenanceModeEnabled(Boolean maintenanceModeEnabled) {
        this.maintenanceModeEnabled = maintenanceModeEnabled;
    }

    public String getMaintenanceStartTime() {
        return maintenanceStartTime;
    }

    public void setMaintenanceStartTime(String maintenanceStartTime) {
        this.maintenanceStartTime = maintenanceStartTime;
    }

    public String getMaintenanceEndTime() {
        return maintenanceEndTime;
    }

    public void setMaintenanceEndTime(String maintenanceEndTime) {
        this.maintenanceEndTime = maintenanceEndTime;
    }

    public String getMaintenanceMessage() {
        return maintenanceMessage;
    }

    public void setMaintenanceMessage(String maintenanceMessage) {
        this.maintenanceMessage = maintenanceMessage;
    }

    public String getDefaultEquipmentStatus() {
        return defaultEquipmentStatus;
    }

    public void setDefaultEquipmentStatus(String defaultEquipmentStatus) {
        this.defaultEquipmentStatus = defaultEquipmentStatus;
    }

    public Integer getMaxIssuanceDays() {
        return maxIssuanceDays;
    }

    public void setMaxIssuanceDays(Integer maxIssuanceDays) {
        this.maxIssuanceDays = maxIssuanceDays;
    }

    public Boolean getAllowManualSerialEntry() {
        return allowManualSerialEntry;
    }

    public void setAllowManualSerialEntry(Boolean allowManualSerialEntry) {
        this.allowManualSerialEntry = allowManualSerialEntry;
    }

    public Boolean getEmailNotificationsEnabled() {
        return emailNotificationsEnabled;
    }

    public void setEmailNotificationsEnabled(Boolean emailNotificationsEnabled) {
        this.emailNotificationsEnabled = emailNotificationsEnabled;
    }

    public Integer getMaintenanceReminderDays() {
        return maintenanceReminderDays;
    }

    public void setMaintenanceReminderDays(Integer maintenanceReminderDays) {
        this.maintenanceReminderDays = maintenanceReminderDays;
    }

    public Boolean getAlertOverdueIssuances() {
        return alertOverdueIssuances;
    }

    public void setAlertOverdueIssuances(Boolean alertOverdueIssuances) {
        this.alertOverdueIssuances = alertOverdueIssuances;
    }

    public Boolean getAlertBrokenEquipment() {
        return alertBrokenEquipment;
    }

    public void setAlertBrokenEquipment(Boolean alertBrokenEquipment) {
        this.alertBrokenEquipment = alertBrokenEquipment;
    }

    public String getDefaultReportFormat() {
        return defaultReportFormat;
    }

    public void setDefaultReportFormat(String defaultReportFormat) {
        this.defaultReportFormat = defaultReportFormat;
    }

    public Integer getAuditLogRetentionYears() {
        return auditLogRetentionYears;
    }

    public void setAuditLogRetentionYears(Integer auditLogRetentionYears) {
        this.auditLogRetentionYears = auditLogRetentionYears;
    }
}
