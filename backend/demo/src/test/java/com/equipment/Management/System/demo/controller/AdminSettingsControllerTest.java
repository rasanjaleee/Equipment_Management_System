package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.dto.AdminSettingsDTO;
import com.equipment.Management.System.demo.dto.MaintenanceStatusDTO;
import com.equipment.Management.System.demo.dto.ResetConfirmationRequest;
import com.equipment.Management.System.demo.service.ActivityLogService;
import com.equipment.Management.System.demo.service.AdminDataManagementService;
import com.equipment.Management.System.demo.service.AdminSettingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AdminSettingsControllerTest {

    @Mock
    private AdminSettingService adminSettingService;

    @Mock
    private AdminDataManagementService adminDataManagementService;

    @Mock
    private ActivityLogService activityLogService;

    @InjectMocks
    private AdminSettingsController controller;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        SecurityContextHolder.clearContext();
    }

    @Test
    void testGetSettings_ReturnsOk() throws Exception {
        AdminSettingsDTO dto = new AdminSettingsDTO();
        dto.setSystemName("Faculty System");
        when(adminSettingService.getSettingsDTO()).thenReturn(dto);

        mockMvc.perform(get("/api/admin/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.systemName").value("Faculty System"));
    }

    @Test
    void testSaveSettings_ValidInput_ReturnsOk() throws Exception {
        AdminSettingsDTO dto = new AdminSettingsDTO();
        dto.setSystemName("Updated System");
        when(adminSettingService.getSettingsDTO()).thenReturn(dto);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "adminUser", null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        mockMvc.perform(post("/api/admin/settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"systemName\":\"Updated System\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.systemName").value("Updated System"));

        verify(adminSettingService).saveSettings(any());
        verify(activityLogService).logActivity(eq("adminUser"), eq("ROLE_ADMIN"), eq("UPDATED_SETTINGS"), isNull(), anyString());
    }

    @Test
    void testGetMaintenanceStatus_Public_ReturnsOk() throws Exception {
        MaintenanceStatusDTO statusDto = new MaintenanceStatusDTO(true, "Under maintenance", "2026-10-15T02:00:00", "2026-10-15T06:00:00");
        when(adminSettingService.getMaintenanceStatus()).thenReturn(statusDto);

        mockMvc.perform(get("/api/admin/settings/maintenance-status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.maintenanceActive").value(true))
                .andExpect(jsonPath("$.message").value("Under maintenance"));
    }

    @Test
    void testExportData_Zip_ReturnsZipFile() throws Exception {
        byte[] fakeZip = new byte[]{1, 2, 3, 4};
        when(adminDataManagementService.exportAllDataAsZip()).thenReturn(fakeZip);

        mockMvc.perform(get("/api/admin/export?format=zip"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("system_backup_")))
                .andExpect(content().contentType("application/zip"));
    }

    @Test
    void testExportData_Csv_ReturnsCsvFile() throws Exception {
        byte[] fakeCsv = "ID,EquipmentName\n1,Oscilloscope".getBytes();
        when(adminDataManagementService.generateEquipmentCsv()).thenReturn(fakeCsv);

        mockMvc.perform(get("/api/admin/export?format=csv"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("equipment_backup_")))
                .andExpect(content().contentType("text/csv"));
    }

    @Test
    void testReset_Unauthorized_NonSuperAdmin_ReturnsForbidden() throws Exception {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "regularAdmin", null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        ResetConfirmationRequest req = new ResetConfirmationRequest("RESET-EQUIPMENT-DATA");

        mockMvc.perform(post("/api/admin/reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Only SUPER_ADMIN")));

        verify(adminDataManagementService, never()).executeProtectedReset(anyString(), anyString(), any());
    }

    @Test
    void testReset_InvalidConfirmationPhrase_ReturnsBadRequest() throws Exception {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "superAdmin", null, List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(adminDataManagementService.executeProtectedReset(eq("superAdmin"), eq("ROLE_SUPER_ADMIN"), any()))
                .thenThrow(new IllegalArgumentException("Invalid confirmation phrase"));

        ResetConfirmationRequest req = new ResetConfirmationRequest("WRONG_PHRASE");

        mockMvc.perform(post("/api/admin/reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Invalid confirmation phrase")));
    }

    @Test
    void testReset_ValidSuperAdminWithConfirmationPhrase_ReturnsOk() throws Exception {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "superAdmin", null, List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        Map<String, Object> summary = Map.of("success", true, "message", "System operational data reset successfully");
        when(adminDataManagementService.executeProtectedReset(eq("superAdmin"), eq("ROLE_SUPER_ADMIN"), any()))
                .thenReturn(summary);

        ResetConfirmationRequest req = new ResetConfirmationRequest("RESET-EQUIPMENT-DATA");

        mockMvc.perform(post("/api/admin/reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
