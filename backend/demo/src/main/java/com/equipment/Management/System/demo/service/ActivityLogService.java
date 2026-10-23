package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.model.ActivityLog;
import com.equipment.Management.System.demo.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final AdminSettingService adminSettingService;

    public ActivityLogService(ActivityLogRepository activityLogRepository,
                              AdminSettingService adminSettingService) {
        this.activityLogRepository = activityLogRepository;
        this.adminSettingService = adminSettingService;
    }

    public void logActivity(String username, String role, String action, Long equipmentId, String details) {
        ActivityLog log = new ActivityLog();
        log.setUsername(username != null ? username : "SYSTEM");
        log.setRole(role != null ? role : "ROLE_SYSTEM");
        log.setAction(action);
        log.setEquipmentId(equipmentId);
        log.setDetails(details);
        log.setTimestamp(LocalDateTime.now());

        activityLogRepository.save(log);
    }

    public List<ActivityLog> getAllLogs() {
        return activityLogRepository.findAllByOrderByTimestampDesc();
    }

    public List<ActivityLog> getLogsByUsername(String username) {
        return activityLogRepository.findByUsernameOrderByTimestampDesc(username);
    }

    @org.springframework.transaction.annotation.Transactional
    public long cleanupExpiredLogs(int retentionYears) {
        if (retentionYears <= 0) {
            return 0; // 0 means keep indefinitely
        }

        LocalDateTime cutoff = LocalDateTime.now().minusYears(retentionYears);
        long deletedCount = activityLogRepository.deleteByTimestampBefore(cutoff);

        if (deletedCount > 0) {
            logActivity("SYSTEM", "ROLE_SUPER_ADMIN", "CLEANUP_AUDIT_LOGS", null,
                    "Automated retention cleanup removed " + deletedCount + " logs older than " + retentionYears + " years.");
        }

        return deletedCount;
    }

    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 2 1 * *")
    public void scheduledRetentionCleanup() {
        int years = adminSettingService.getAuditLogRetentionYears();
        if (years > 0) {
            cleanupExpiredLogs(years);
        }
    }
}