package com.equipment.Management.System.demo;

import com.equipment.Management.System.demo.dto.AdminSettingsDTO;
import com.equipment.Management.System.demo.dto.IssuanceRequest;
import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.model.EquipmentStatus;
import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.repository.EquipmentRepository;
import com.equipment.Management.System.demo.repository.UserRepository;
import com.equipment.Management.System.demo.service.AdminSettingService;
import com.equipment.Management.System.demo.service.IssuanceService;
import com.equipment.Management.System.demo.service.NotificationService;
import com.equipment.Management.System.demo.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SettingsWorkflowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AdminSettingService adminSettingService;

    @Autowired
    private IssuanceService issuanceService;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private JwtUtil jwtUtil;

    @BeforeEach
    void setup() {
        // Reset default settings
        AdminSettingsDTO dto = new AdminSettingsDTO();
        dto.setMaintenanceModeEnabled(false);
        dto.setAllowManualSerialEntry(true);
        dto.setMaxIssuanceDays(14);
        dto.setEmailNotificationsEnabled(true);
        dto.setSessionTimeoutMinutes(30);
        adminSettingService.saveSettingsDTO(dto);
    }

    @Test
    void testSessionTimeout_JwtIssuedWithConfiguredTimeout() {
        AdminSettingsDTO dto = adminSettingService.getSettingsDTO();
        dto.setSessionTimeoutMinutes(60);
        adminSettingService.saveSettingsDTO(dto);

        int timeout = adminSettingService.getSessionTimeoutMinutes();
        assertEquals(60, timeout);

        String token = jwtUtil.generateToken("testUser", "ADMIN", timeout);
        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token, "testUser"));
    }

    @Test
    void testMaintenanceMode_EnforcementOnNonAdmin() throws Exception {
        // Enable maintenance mode
        AdminSettingsDTO dto = adminSettingService.getSettingsDTO();
        dto.setMaintenanceModeEnabled(true);
        dto.setMaintenanceStartTime("");
        dto.setMaintenanceEndTime("");
        dto.setMaintenanceMessage("Scheduled downtime in progress");
        adminSettingService.saveSettingsDTO(dto);

        assertTrue(adminSettingService.isMaintenanceActive());

        // 1. Unauthenticated or non-admin request to operational endpoint returns 503
        mockMvc.perform(get("/api/equipment"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.maintenance").value(true))
                .andExpect(jsonPath("$.message").value("Scheduled downtime in progress"));

        // 2. Public maintenance status endpoint remains accessible
        mockMvc.perform(get("/api/admin/settings/maintenance-status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.maintenanceActive").value(true));

        // Disable maintenance mode
        dto.setMaintenanceModeEnabled(false);
        adminSettingService.saveSettingsDTO(dto);

        assertFalse(adminSettingService.isMaintenanceActive());
    }

    @Test
    @WithMockUser(username = "adminUser", roles = {"ADMIN"})
    void testMaintenanceMode_BypassForAdminUser() throws Exception {
        AdminSettingsDTO dto = adminSettingService.getSettingsDTO();
        dto.setMaintenanceModeEnabled(true);
        adminSettingService.saveSettingsDTO(dto);

        // Admin can access admin endpoints even during maintenance
        mockMvc.perform(get("/api/admin/settings"))
                .andExpect(status().isOk());

        dto.setMaintenanceModeEnabled(false);
        adminSettingService.saveSettingsDTO(dto);
    }

    @Test
    @WithMockUser(username = "adminUser", roles = {"ADMIN"})
    void testManualSerialEntry_RejectionWhenDisabled() throws Exception {
        AdminSettingsDTO dto = adminSettingService.getSettingsDTO();
        dto.setAllowManualSerialEntry(false);
        adminSettingService.saveSettingsDTO(dto);

        assertFalse(adminSettingService.isAllowManualSerialEntry());

        mockMvc.perform(post("/api/equipment/add")
                        .param("equipmentName", "Oscilloscope")
                        .param("laboratory", "Electronics Lab")
                        .param("serialNumber", "SN-999888") // Provided while disabled
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED))
                .andExpect(status().isBadRequest())
                .andExpect(status().reason((String) null));
    }

    @Test
    void testIssuanceRequiresApprovedBorrowRequest() {
        AdminSettingsDTO dto = adminSettingService.getSettingsDTO();
        dto.setMaxIssuanceDays(7);
        adminSettingService.saveSettingsDTO(dto);

        assertEquals(7, adminSettingService.getMaxIssuanceDays());

        // Prepare test equipment & user
        Equipment eq = new Equipment();
        eq.setEquipmentName("Test Multimeter");
        eq.setLaboratory("Physics Lab");
        eq.setStatus(EquipmentStatus.WORKING);
        eq = equipmentRepository.save(eq);

        User u = new User();
        u.setUsername("borrowerStudent" + System.currentTimeMillis());
        u.setEmail("borrower" + System.currentTimeMillis() + "@univ.lk");
        u.setPassword("encoded");
        u.setRole("STUDENT");
        u = userRepository.save(u);

        User issuer = new User();
        issuer.setUsername("issuerAdmin" + System.currentTimeMillis());
        issuer.setEmail("issuer" + System.currentTimeMillis() + "@univ.lk");
        issuer.setPassword("encoded");
        issuer.setRole("ADMIN");
        issuer = userRepository.save(issuer);

        // Issuance creation must be linked to an approved borrow request.
        IssuanceRequest req = new IssuanceRequest();
        req.setBorrowRequestId(null);
        req.setEquipmentId(eq.getId());
        req.setUserId(u.getId());
        req.setIssueDate(LocalDate.now());
        req.setReturnDueDate(LocalDate.now().plusDays(10));
        req.setStatus("Issued");
        req.setQtyIssued(1);
        req.setConditionAtIssue("WORKING");

        final IssuanceRequest finalReq = req;
        final String issuerUsername = issuer.getUsername();

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            issuanceService.createIssuance(finalReq, issuerUsername);
        });

        assertTrue(ex.getMessage().contains("Borrow request ID is required"));
    }

    @Test
    void testGlobalNotifications_SuppressionWhenDisabled() {
        AdminSettingsDTO dto = adminSettingService.getSettingsDTO();
        dto.setEmailNotificationsEnabled(false);
        adminSettingService.saveSettingsDTO(dto);

        assertFalse(adminSettingService.isNotificationsGloballyEnabled());

        User testUser = new User();
        testUser.setUsername("notifUser" + System.currentTimeMillis());
        testUser.setEmail("notif" + System.currentTimeMillis() + "@univ.lk");
        testUser.setPassword("pass");
        testUser.setRole("ADMIN");
        testUser = userRepository.save(testUser);

        // When notifications disabled, createNotificationForUser returns null and suppresses send
        var result = notificationService.createNotificationForUser(
                testUser.getId(),
                "Test Title",
                "Test Message",
                "SYSTEM",
                1L,
                "EQUIPMENT",
                "NORMAL"
        );

        assertNull(result);
    }
}
