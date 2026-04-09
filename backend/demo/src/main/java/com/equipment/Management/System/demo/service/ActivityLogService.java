package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.model.ActivityLog;
import com.equipment.Management.System.demo.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    public void logActivity(String username, String role, String action, Long equipmentId, String details) {
        ActivityLog log = new ActivityLog();
        log.setUsername(username);
        log.setRole(role);
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
}