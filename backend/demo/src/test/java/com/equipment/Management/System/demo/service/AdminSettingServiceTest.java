package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.dto.AdminSettingsDTO;
import com.equipment.Management.System.demo.model.SystemSetting;
import com.equipment.Management.System.demo.repository.SystemSettingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminSettingServiceTest {

    @Mock
    private SystemSettingRepository repository;

    private AdminSettingService service;

    private final Map<String, SystemSetting> memoryStore = new HashMap<>();

    @BeforeEach
    void setUp() {
        memoryStore.clear();
        service = new AdminSettingService(repository);

        lenient().when(repository.findBySettingKey(anyString())).thenAnswer(invocation -> {
            String key = invocation.getArgument(0);
            return Optional.ofNullable(memoryStore.get(key));
        });

        lenient().when(repository.save(any(SystemSetting.class))).thenAnswer(invocation -> {
            SystemSetting s = invocation.getArgument(0);
            memoryStore.put(s.getSettingKey(), s);
            return s;
        });
    }

    @Test
    void testGetDefaultSettings_WhenRepositoryEmpty() {
        AdminSettingsDTO defaults = service.getSettingsDTO();

        assertNotNull(defaults);
        assertEquals("Faculty of Engineering Equipment Management System", defaults.getSystemName());
        assertEquals("Faculty of Engineering", defaults.getInstitutionName());
        assertEquals("admin@eng.university.lk", defaults.getContactEmail());
        assertEquals(30, defaults.getSessionTimeoutMinutes());
        assertFalse(defaults.getMaintenanceModeEnabled());
        assertEquals("WORKING", defaults.getDefaultEquipmentStatus());
        assertEquals(14, defaults.getMaxIssuanceDays());
        assertTrue(defaults.getAllowManualSerialEntry());
        assertTrue(defaults.getEmailNotificationsEnabled());
        assertEquals(7, defaults.getMaintenanceReminderDays());
        assertEquals("PDF", defaults.getDefaultReportFormat());
        assertEquals(3, defaults.getAuditLogRetentionYears());
    }

    @Test
    void testSaveAndGetSettings() {
        AdminSettingsDTO input = new AdminSettingsDTO();
        input.setSystemName("Custom System Name");
        input.setInstitutionName("Custom Faculty");
        input.setContactEmail("support@eng.university.lk");
        input.setSessionTimeoutMinutes(60);
        input.setMaintenanceModeEnabled(false);
        input.setDefaultEquipmentStatus("UNDER_REPAIR");
        input.setMaxIssuanceDays(21);
        input.setAllowManualSerialEntry(false);
        input.setEmailNotificationsEnabled(false);
        input.setMaintenanceReminderDays(5);
        input.setDefaultReportFormat("CSV");
        input.setAuditLogRetentionYears(5);

        AdminSettingsDTO saved = service.saveSettingsDTO(input);

        assertNotNull(saved);
        assertEquals("Custom System Name", saved.getSystemName());
        assertEquals("Custom Faculty", saved.getInstitutionName());
        assertEquals("support@eng.university.lk", saved.getContactEmail());
        assertEquals(60, saved.getSessionTimeoutMinutes());
        assertEquals("UNDER_REPAIR", saved.getDefaultEquipmentStatus());
        assertEquals(21, saved.getMaxIssuanceDays());
        assertFalse(saved.getAllowManualSerialEntry());
        assertFalse(saved.getEmailNotificationsEnabled());
        assertEquals(5, saved.getMaintenanceReminderDays());
        assertEquals("CSV", saved.getDefaultReportFormat());
        assertEquals(5, saved.getAuditLogRetentionYears());
    }

    @Test
    void testValidation_InvalidEmailThrowsException() {
        AdminSettingsDTO input = new AdminSettingsDTO();
        input.setContactEmail("invalid-email");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            service.saveSettingsDTO(input);
        });
        assertTrue(ex.getMessage().contains("valid contact email"));
    }

    @Test
    void testValidation_BlankSystemNameThrowsException() {
        AdminSettingsDTO input = new AdminSettingsDTO();
        input.setSystemName("   ");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            service.saveSettingsDTO(input);
        });
        assertTrue(ex.getMessage().contains("System name"));
    }

    @Test
    void testValidation_InvalidSessionTimeoutThrowsException() {
        AdminSettingsDTO input = new AdminSettingsDTO();
        input.setSessionTimeoutMinutes(2); // Less than 5 min

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            service.saveSettingsDTO(input);
        });
        assertTrue(ex.getMessage().contains("Session timeout"));
    }

    @Test
    void testValidation_InvalidEquipmentStatusThrowsException() {
        AdminSettingsDTO input = new AdminSettingsDTO();
        input.setDefaultEquipmentStatus("UNKNOWN_STATUS");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            service.saveSettingsDTO(input);
        });
        assertTrue(ex.getMessage().contains("Default equipment status"));
    }

    @Test
    void testValidation_InvalidReportFormatThrowsException() {
        AdminSettingsDTO input = new AdminSettingsDTO();
        input.setDefaultReportFormat("EXCEL"); // Unsupported

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            service.saveSettingsDTO(input);
        });
        assertTrue(ex.getMessage().contains("Report format must be PDF or CSV"));
    }

    @Test
    void testMaintenanceWindow_ActiveEvaluation() {
        AdminSettingsDTO dto = new AdminSettingsDTO();
        dto.setMaintenanceModeEnabled(true);

        // Without dates, manual enable is active
        assertTrue(service.isMaintenanceActive(dto));

        // Window in future
        LocalDateTime futureStart = LocalDateTime.now().plusHours(2);
        LocalDateTime futureEnd = LocalDateTime.now().plusHours(4);
        dto.setMaintenanceStartTime(futureStart.format(DateTimeFormatter.ISO_DATE_TIME));
        dto.setMaintenanceEndTime(futureEnd.format(DateTimeFormatter.ISO_DATE_TIME));
        assertFalse(service.isMaintenanceActive(dto));

        // Window active now
        LocalDateTime pastStart = LocalDateTime.now().minusHours(1);
        LocalDateTime activeEnd = LocalDateTime.now().plusHours(1);
        dto.setMaintenanceStartTime(pastStart.format(DateTimeFormatter.ISO_DATE_TIME));
        dto.setMaintenanceEndTime(activeEnd.format(DateTimeFormatter.ISO_DATE_TIME));
        assertTrue(service.isMaintenanceActive(dto));

        // Disabled toggle
        dto.setMaintenanceModeEnabled(false);
        assertFalse(service.isMaintenanceActive(dto));
    }
}
