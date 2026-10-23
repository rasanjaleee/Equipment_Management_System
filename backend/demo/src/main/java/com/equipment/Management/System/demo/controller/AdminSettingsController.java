package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.dto.AdminSettingsDTO;
import com.equipment.Management.System.demo.dto.MaintenanceStatusDTO;
import com.equipment.Management.System.demo.dto.ResetConfirmationRequest;
import com.equipment.Management.System.demo.service.ActivityLogService;
import com.equipment.Management.System.demo.service.AdminDataManagementService;
import com.equipment.Management.System.demo.service.AdminSettingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(originPatterns = {"http://localhost:*", "https://*.choreoapps.dev", "https://*.choreo.org", "https://*.vercel.app"})
public class AdminSettingsController {

    private final AdminSettingService adminSettingService;
    private final AdminDataManagementService adminDataManagementService;
    private final ActivityLogService activityLogService;

    public AdminSettingsController(AdminSettingService adminSettingService,
                                   AdminDataManagementService adminDataManagementService,
                                   ActivityLogService activityLogService) {
        this.adminSettingService = adminSettingService;
        this.adminDataManagementService = adminDataManagementService;
        this.activityLogService = activityLogService;
    }

    /**
     * Section 1 - 5: Read all system settings.
     */
    @GetMapping("/settings")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<AdminSettingsDTO> getSettings() {
        return ResponseEntity.ok(adminSettingService.getSettingsDTO());
    }

    /**
     * Section 1 - 5: Update system settings.
     */
    @PostMapping("/settings")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<?> saveSettingsPost(@RequestBody Map<String, Object> body) {
        return handleSettingsUpdate(body);
    }

    @PutMapping("/settings")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<?> saveSettingsPut(@RequestBody Map<String, Object> body) {
        return handleSettingsUpdate(body);
    }

    private ResponseEntity<?> handleSettingsUpdate(Map<String, Object> body) {
        try {
            // First update via Map to accept flexible partial inputs or full DTO
            adminSettingService.saveSettings(body);
            AdminSettingsDTO saved = adminSettingService.getSettingsDTO();

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth != null ? auth.getName() : "ADMIN";
            String role = (auth != null && !auth.getAuthorities().isEmpty())
                    ? auth.getAuthorities().iterator().next().getAuthority()
                    : "ROLE_ADMIN";

            activityLogService.logActivity(username, role, "UPDATED_SETTINGS", null,
                    "Updated admin system settings across active configuration sections.");

            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to save settings: " + e.getMessage()));
        }
    }

    /**
     * Section 2: Public endpoint for checking current maintenance status.
     */
    @GetMapping("/settings/maintenance-status")
    public ResponseEntity<MaintenanceStatusDTO> getMaintenanceStatus() {
        return ResponseEntity.ok(adminSettingService.getMaintenanceStatus());
    }

    /**
     * Section 6: Export application data.
     * Supports ?format=csv (single equipment CSV) or ?format=zip (ZIP containing all entity CSVs).
     */
    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<?> exportData(@RequestParam(defaultValue = "zip") String format) {
        try {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));

            if ("csv".equalsIgnoreCase(format)) {
                byte[] csvData = adminDataManagementService.generateEquipmentCsv();
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=equipment_backup_" + timestamp + ".csv")
                        .contentType(MediaType.parseMediaType("text/csv"))
                        .body(csvData);
            }

            byte[] zipData = adminDataManagementService.exportAllDataAsZip();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=system_backup_" + timestamp + ".zip")
                    .contentType(MediaType.parseMediaType("application/zip"))
                    .body(zipData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Export failed: " + e.getMessage()));
        }
    }

    /**
     * Section 6: High-risk protected system reset.
     * Restricted strictly to SUPER_ADMIN role with exact confirmation phrase match.
     */
    @PostMapping("/reset")
    public ResponseEntity<?> executeResetPost(@Valid @RequestBody ResetConfirmationRequest request) {
        return handleResetExecution(request);
    }

    @DeleteMapping("/reset")
    public ResponseEntity<?> executeResetDelete(@Valid @RequestBody(required = false) ResetConfirmationRequest request) {
        return handleResetExecution(request);
    }

    private ResponseEntity<?> handleResetExecution(ResetConfirmationRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required."));
        }

        String username = auth.getName();
        String role = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("");

        boolean isSuperAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(r -> r.equalsIgnoreCase("ROLE_SUPER_ADMIN") || r.equalsIgnoreCase("SUPER_ADMIN"));

        if (!isSuperAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Permission denied: Only SUPER_ADMIN users can execute a system reset."));
        }

        try {
            Map<String, Object> summary = adminDataManagementService.executeProtectedReset(username, role, request);
            return ResponseEntity.ok(summary);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Reset operation failed: " + e.getMessage()));
        }
    }

    /**
     * Section 5: Manual trigger for audit log retention cleanup.
     * Restricted to SUPER_ADMIN.
     */
    @PostMapping("/activity-logs/cleanup")
    public ResponseEntity<?> cleanupAuditLogs(@RequestParam(required = false) Integer years) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isSuperAdmin = auth != null && auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(r -> r.equalsIgnoreCase("ROLE_SUPER_ADMIN") || r.equalsIgnoreCase("SUPER_ADMIN"));

        if (!isSuperAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Permission denied: Only SUPER_ADMIN users can cleanup audit logs."));
        }

        int retentionYears = (years != null) ? years : adminSettingService.getAuditLogRetentionYears();
        long count = activityLogService.cleanupExpiredLogs(retentionYears);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "deletedLogsCount", count,
                "retentionYears", retentionYears,
                "message", count > 0
                        ? "Successfully cleaned up " + count + " audit log entries older than " + retentionYears + " years."
                        : "No expired audit log entries found to delete."
        ));
    }
}
