package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activity-logs")
@CrossOrigin(origins = "http://localhost:5173")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    public ActivityLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @GetMapping
    public ResponseEntity<?> getAllLogs() {
        return ResponseEntity.ok(activityLogService.getAllLogs());
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<?> getLogsByUsername(@PathVariable String username) {
        return ResponseEntity.ok(activityLogService.getLogsByUsername(username));
    }
}