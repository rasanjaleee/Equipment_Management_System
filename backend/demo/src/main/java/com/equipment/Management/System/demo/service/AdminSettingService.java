package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.dto.AdminSettingsDTO;
import com.equipment.Management.System.demo.dto.MaintenanceStatusDTO;
import com.equipment.Management.System.demo.model.SystemSetting;
import com.equipment.Management.System.demo.repository.SystemSettingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminSettingService {

    private static final Logger logger = LoggerFactory.getLogger(AdminSettingService.class);

    private final SystemSettingRepository repository;

    public AdminSettingService(SystemSettingRepository repository) {
        this.repository = repository;
    }

    @Cacheable(value = "adminSettings")
    @Transactional(readOnly = true)
    public AdminSettingsDTO getSettingsDTO() {
        // Fetch ALL settings in ONE single query to prevent N+1 performance hits
        List<SystemSetting> allSettings = repository.findAll();
        Map<String, String> map = allSettings.stream()
                .collect(Collectors.toMap(SystemSetting::getSettingKey, SystemSetting::getSettingValue, (v1, v2) -> v1));

        AdminSettingsDTO dto = new AdminSettingsDTO();

        dto.setSystemName(map.getOrDefault("systemName", "Faculty of Engineering Equipment Management System"));
        dto.setInstitutionName(map.getOrDefault("institutionName", "Faculty of Engineering"));
        dto.setContactEmail(map.getOrDefault("contactEmail", "admin@eng.university.lk"));
        dto.setTimeZone(map.getOrDefault("timeZone", "Asia/Colombo"));

        dto.setSessionTimeoutMinutes(parseOrDefaultInt(map.get("sessionTimeoutMinutes"), 30));
        dto.setMaintenanceModeEnabled(Boolean.parseBoolean(map.getOrDefault("maintenanceModeEnabled", "false")));
        dto.setMaintenanceStartTime(map.get("maintenanceStartTime"));
        dto.setMaintenanceEndTime(map.get("maintenanceEndTime"));
        dto.setMaintenanceMessage(map.get("maintenanceMessage"));

        dto.setDefaultEquipmentStatus(map.getOrDefault("defaultEquipmentStatus", "WORKING"));
        dto.setMaxIssuanceDays(parseOrDefaultInt(map.get("maxIssuanceDays"), 14));
        dto.setAllowManualSerialEntry(Boolean.parseBoolean(map.getOrDefault("allowManualSerialEntry", "true")));

        dto.setEmailNotificationsEnabled(Boolean.parseBoolean(map.getOrDefault("emailNotificationsEnabled", "true")));
        dto.setMaintenanceReminderDays(parseOrDefaultInt(map.get("maintenanceReminderDays"), 7));
        dto.setAlertOverdueIssuances(Boolean.parseBoolean(map.getOrDefault("alertOverdueIssuances", "true")));
        dto.setAlertBrokenEquipment(Boolean.parseBoolean(map.getOrDefault("alertBrokenEquipment", "true")));

        dto.setDefaultReportFormat(map.getOrDefault("defaultReportFormat", "PDF"));
        dto.setAuditLogRetentionYears(parseOrDefaultInt(map.get("auditLogRetentionYears"), 3));

        return dto;
    }

    @CacheEvict(value = "adminSettings", allEntries = true)
    @Transactional
    public AdminSettingsDTO saveSettingsDTO(AdminSettingsDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Settings data is required");
        }

        validateDTO(dto);

        saveSetting("systemName", dto.getSystemName());
        saveSetting("institutionName", dto.getInstitutionName());
        saveSetting("contactEmail", dto.getContactEmail());
        saveSetting("timeZone", dto.getTimeZone());

        saveSetting("sessionTimeoutMinutes", String.valueOf(dto.getSessionTimeoutMinutes()));
        saveSetting("maintenanceModeEnabled", String.valueOf(dto.getMaintenanceModeEnabled()));
        saveSetting("maintenanceStartTime", dto.getMaintenanceStartTime() != null ? dto.getMaintenanceStartTime().trim() : "");
        saveSetting("maintenanceEndTime", dto.getMaintenanceEndTime() != null ? dto.getMaintenanceEndTime().trim() : "");
        saveSetting("maintenanceMessage", dto.getMaintenanceMessage());

        saveSetting("defaultEquipmentStatus", dto.getDefaultEquipmentStatus().toUpperCase(Locale.ROOT));
        saveSetting("maxIssuanceDays", String.valueOf(dto.getMaxIssuanceDays()));
        saveSetting("allowManualSerialEntry", String.valueOf(dto.getAllowManualSerialEntry()));

        saveSetting("emailNotificationsEnabled", String.valueOf(dto.getEmailNotificationsEnabled()));
        saveSetting("maintenanceReminderDays", String.valueOf(dto.getMaintenanceReminderDays()));
        saveSetting("alertOverdueIssuances", String.valueOf(dto.getAlertOverdueIssuances()));
        saveSetting("alertBrokenEquipment", String.valueOf(dto.getAlertBrokenEquipment()));

        saveSetting("defaultReportFormat", dto.getDefaultReportFormat().toUpperCase(Locale.ROOT));
        saveSetting("auditLogRetentionYears", String.valueOf(dto.getAuditLogRetentionYears()));

        return getSettingsDTO();
    }

    private void validateDTO(AdminSettingsDTO dto) {
        if (dto.getSystemName() == null || dto.getSystemName().isBlank() || dto.getSystemName().length() > 150) {
            throw new IllegalArgumentException("System name must contain 1 to 150 characters.");
        }
        if (dto.getInstitutionName() == null || dto.getInstitutionName().isBlank() || dto.getInstitutionName().length() > 150) {
            throw new IllegalArgumentException("Institution name must contain 1 to 150 characters.");
        }
        if (dto.getContactEmail() == null || !dto.getContactEmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new IllegalArgumentException("A valid contact email address is required.");
        }
        if (dto.getTimeZone() != null && !dto.getTimeZone().isBlank()) {
            try {
                ZoneId.of(dto.getTimeZone());
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid time zone: " + dto.getTimeZone());
            }
        }
        if (dto.getSessionTimeoutMinutes() == null || dto.getSessionTimeoutMinutes() < 5 || dto.getSessionTimeoutMinutes() > 1440) {
            throw new IllegalArgumentException("Session timeout must be between 5 and 1440 minutes.");
        }
        if (dto.getMaxIssuanceDays() == null || dto.getMaxIssuanceDays() < 1 || dto.getMaxIssuanceDays() > 365) {
            throw new IllegalArgumentException("Maximum issuance days must be between 1 and 365.");
        }
        if (dto.getMaintenanceReminderDays() == null || dto.getMaintenanceReminderDays() < 1 || dto.getMaintenanceReminderDays() > 60) {
            throw new IllegalArgumentException("Maintenance reminder days must be between 1 and 60.");
        }
        if (dto.getDefaultEquipmentStatus() == null || !Set.of("WORKING", "UNDER_REPAIR", "BROKEN").contains(dto.getDefaultEquipmentStatus().toUpperCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Default equipment status must be WORKING, UNDER_REPAIR, or BROKEN.");
        }
        if (dto.getDefaultReportFormat() == null || !Set.of("PDF", "CSV").contains(dto.getDefaultReportFormat().toUpperCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Report format must be PDF or CSV.");
        }
        if (dto.getAuditLogRetentionYears() == null || dto.getAuditLogRetentionYears() < 0 || dto.getAuditLogRetentionYears() > 10) {
            throw new IllegalArgumentException("Audit log retention years must be between 0 and 10.");
        }

        // Validate maintenance window dates if enabled
        if (Boolean.TRUE.equals(dto.getMaintenanceModeEnabled())) {
            String start = dto.getMaintenanceStartTime();
            String end = dto.getMaintenanceEndTime();
            if (start != null && !start.isBlank() && end != null && !end.isBlank()) {
                try {
                    LocalDateTime startDt = LocalDateTime.parse(start.trim(), DateTimeFormatter.ISO_DATE_TIME);
                    LocalDateTime endDt = LocalDateTime.parse(end.trim(), DateTimeFormatter.ISO_DATE_TIME);
                    if (endDt.isBefore(startDt)) {
                        throw new IllegalArgumentException("Maintenance end time cannot be before start time.");
                    }
                } catch (IllegalArgumentException ex) {
                    throw ex;
                } catch (Exception e) {
                    logger.warn("Could not parse maintenance date-time: {}", e.getMessage());
                }
            }
        }
    }

    public MaintenanceStatusDTO getMaintenanceStatus() {
        AdminSettingsDTO dto = getSettingsDTO();
        boolean isActive = isMaintenanceActive(dto);
        return new MaintenanceStatusDTO(
                isActive,
                dto.getMaintenanceMessage(),
                dto.getMaintenanceStartTime(),
                dto.getMaintenanceEndTime()
        );
    }

    public boolean isMaintenanceActive() {
        return isMaintenanceActive(getSettingsDTO());
    }

    public boolean isMaintenanceActive(AdminSettingsDTO dto) {
        if (!Boolean.TRUE.equals(dto.getMaintenanceModeEnabled())) {
            return false;
        }

        String startStr = dto.getMaintenanceStartTime();
        String endStr = dto.getMaintenanceEndTime();

        if ((startStr == null || startStr.isBlank()) && (endStr == null || endStr.isBlank())) {
            return true;
        }

        ZoneId zoneId;
        try {
            zoneId = ZoneId.of(dto.getTimeZone() != null && !dto.getTimeZone().isBlank() ? dto.getTimeZone() : "Asia/Colombo");
        } catch (Exception e) {
            zoneId = ZoneId.systemDefault();
        }

        LocalDateTime now = ZonedDateTime.now(zoneId).toLocalDateTime();

        LocalDateTime startDt = null;
        LocalDateTime endDt = null;

        if (startStr != null && !startStr.isBlank()) {
            try {
                startDt = LocalDateTime.parse(startStr.trim());
            } catch (Exception ignored) {
            }
        }

        if (endStr != null && !endStr.isBlank()) {
            try {
                endDt = LocalDateTime.parse(endStr.trim());
            } catch (Exception ignored) {
            }
        }

        if (startDt != null && endDt != null) {
            return !now.isBefore(startDt) && !now.isAfter(endDt);
        } else if (startDt != null) {
            return !now.isBefore(startDt);
        } else if (endDt != null) {
            return !now.isAfter(endDt);
        }

        return true;
    }

    public int getSessionTimeoutMinutes() {
        return getSettingsDTO().getSessionTimeoutMinutes();
    }

    public String getDefaultEquipmentStatus() {
        return getSettingsDTO().getDefaultEquipmentStatus();
    }

    public int getMaxIssuanceDays() {
        return getSettingsDTO().getMaxIssuanceDays();
    }

    public boolean isAllowManualSerialEntry() {
        return Boolean.TRUE.equals(getSettingsDTO().getAllowManualSerialEntry());
    }

    public boolean isNotificationsGloballyEnabled() {
        return Boolean.TRUE.equals(getSettingsDTO().getEmailNotificationsEnabled());
    }

    public int getMaintenanceReminderDays() {
        return getSettingsDTO().getMaintenanceReminderDays();
    }

    public boolean isAlertOverdueIssuances() {
        return Boolean.TRUE.equals(getSettingsDTO().getAlertOverdueIssuances());
    }

    public boolean isAlertBrokenEquipment() {
        return Boolean.TRUE.equals(getSettingsDTO().getAlertBrokenEquipment());
    }

    public String getDefaultReportFormat() {
        return getSettingsDTO().getDefaultReportFormat();
    }

    public int getAuditLogRetentionYears() {
        return getSettingsDTO().getAuditLogRetentionYears();
    }

    private int parseOrDefaultInt(String val, int defaultValue) {
        if (val == null || val.isBlank()) return defaultValue;
        try {
            return Integer.parseInt(val.trim());
        } catch (Exception e) {
            return defaultValue;
        }
    }

    private void saveSetting(String key, String value) {
        SystemSetting setting = repository.findBySettingKey(key)
                .orElseGet(() -> new SystemSetting(key, value));
        setting.setSettingValue(value != null ? value : "");
        repository.save(setting);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSettings() {
        AdminSettingsDTO dto = getSettingsDTO();
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("systemName", dto.getSystemName());
        map.put("institutionName", dto.getInstitutionName());
        map.put("contactEmail", dto.getContactEmail());
        map.put("timeZone", dto.getTimeZone());
        map.put("sessionTimeoutMinutes", dto.getSessionTimeoutMinutes());
        map.put("maintenanceModeEnabled", dto.getMaintenanceModeEnabled());
        map.put("maintenanceStartTime", dto.getMaintenanceStartTime());
        map.put("maintenanceEndTime", dto.getMaintenanceEndTime());
        map.put("maintenanceMessage", dto.getMaintenanceMessage());
        map.put("defaultEquipmentStatus", dto.getDefaultEquipmentStatus());
        map.put("maxIssuanceDays", dto.getMaxIssuanceDays());
        map.put("allowManualSerialEntry", dto.getAllowManualSerialEntry());
        map.put("emailNotificationsEnabled", dto.getEmailNotificationsEnabled());
        map.put("maintenanceReminderDays", dto.getMaintenanceReminderDays());
        map.put("alertOverdueIssuances", dto.getAlertOverdueIssuances());
        map.put("alertBrokenEquipment", dto.getAlertBrokenEquipment());
        map.put("defaultReportFormat", dto.getDefaultReportFormat());
        map.put("auditLogRetentionYears", dto.getAuditLogRetentionYears());
        return map;
    }

    @Transactional
    public Map<String, Object> saveSettings(Map<String, Object> incoming) {
        AdminSettingsDTO dto = getSettingsDTO();
        if (incoming.containsKey("systemName")) dto.setSystemName(String.valueOf(incoming.get("systemName")));
        if (incoming.containsKey("institutionName")) dto.setInstitutionName(String.valueOf(incoming.get("institutionName")));
        if (incoming.containsKey("contactEmail")) dto.setContactEmail(String.valueOf(incoming.get("contactEmail")));
        if (incoming.containsKey("timeZone")) dto.setTimeZone(String.valueOf(incoming.get("timeZone")));
        if (incoming.containsKey("sessionTimeoutMinutes")) dto.setSessionTimeoutMinutes(Integer.parseInt(String.valueOf(incoming.get("sessionTimeoutMinutes"))));
        if (incoming.containsKey("maintenanceModeEnabled")) dto.setMaintenanceModeEnabled(Boolean.parseBoolean(String.valueOf(incoming.get("maintenanceModeEnabled"))));
        if (incoming.containsKey("maintenanceStartTime")) dto.setMaintenanceStartTime(String.valueOf(incoming.get("maintenanceStartTime")));
        if (incoming.containsKey("maintenanceEndTime")) dto.setMaintenanceEndTime(String.valueOf(incoming.get("maintenanceEndTime")));
        if (incoming.containsKey("maintenanceMessage")) dto.setMaintenanceMessage(String.valueOf(incoming.get("maintenanceMessage")));
        if (incoming.containsKey("defaultEquipmentStatus")) dto.setDefaultEquipmentStatus(String.valueOf(incoming.get("defaultEquipmentStatus")));
        if (incoming.containsKey("maxIssuanceDays")) dto.setMaxIssuanceDays(Integer.parseInt(String.valueOf(incoming.get("maxIssuanceDays"))));
        if (incoming.containsKey("allowManualSerialEntry")) dto.setAllowManualSerialEntry(Boolean.parseBoolean(String.valueOf(incoming.get("allowManualSerialEntry"))));
        if (incoming.containsKey("emailNotificationsEnabled")) dto.setEmailNotificationsEnabled(Boolean.parseBoolean(String.valueOf(incoming.get("emailNotificationsEnabled"))));
        if (incoming.containsKey("maintenanceReminderDays")) dto.setMaintenanceReminderDays(Integer.parseInt(String.valueOf(incoming.get("maintenanceReminderDays"))));
        if (incoming.containsKey("alertOverdueIssuances")) dto.setAlertOverdueIssuances(Boolean.parseBoolean(String.valueOf(incoming.get("alertOverdueIssuances"))));
        if (incoming.containsKey("alertBrokenEquipment")) dto.setAlertBrokenEquipment(Boolean.parseBoolean(String.valueOf(incoming.get("alertBrokenEquipment"))));
        if (incoming.containsKey("defaultReportFormat")) dto.setDefaultReportFormat(String.valueOf(incoming.get("defaultReportFormat")));
        if (incoming.containsKey("auditLogRetentionYears")) dto.setAuditLogRetentionYears(Integer.parseInt(String.valueOf(incoming.get("auditLogRetentionYears"))));

        saveSettingsDTO(dto);
        return getSettings();
    }
}