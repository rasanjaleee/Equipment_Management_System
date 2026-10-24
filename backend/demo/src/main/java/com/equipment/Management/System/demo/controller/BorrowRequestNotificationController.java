package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.dto.BorrowRequestNotificationResponse;
import com.equipment.Management.System.demo.service.BorrowRequestNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class BorrowRequestNotificationController {

    private final BorrowRequestNotificationService notificationService;

    public BorrowRequestNotificationController(BorrowRequestNotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<BorrowRequestNotificationResponse>> getNotifications(Principal principal) {
        return ResponseEntity.ok(notificationService.getNotifications(principal.getName()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<BorrowRequestNotificationResponse> markAsRead(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(notificationService.markAsRead(id, principal.getName()));
    }
}
