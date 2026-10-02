package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.model.Notification;
import com.equipment.Management.System.demo.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
public class NotificationController {

    @Autowired
    private NotificationService notificationService;


    // =========================================================
    // GET ALL NOTIFICATIONS
    // =========================================================
    @GetMapping("/{userId}")
    public List<Notification> getNotifications(@PathVariable Long userId) {
        return notificationService.getUserNotifications(userId);
    }


    // =========================================================
    // GET UNREAD COUNT
    // =========================================================
    @GetMapping("/unread-count/{userId}")
    public long getUnreadCount(@PathVariable Long userId) {
        return notificationService.getUnreadCount(userId);
    }


    // =========================================================
    // MARK ONE AS READ
    // =========================================================
    @PutMapping("/mark-as-read/{id}")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }


    // =========================================================
    // MARK ONE AS UNREAD
    // =========================================================
    @PutMapping("/mark-as-unread/{id}")
    public void markAsUnread(@PathVariable Long id) {
        notificationService.markAsUnread(id);
    }


    // =========================================================
    // MARK ALL AS READ
    // =========================================================
    @PutMapping("/mark-as-read/all/{userId}")
    public void markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
    }


    // =========================================================
    // MARK ALL AS UNREAD
    // =========================================================
    @PutMapping("/mark-as-unread/all/{userId}")
    public void markAllAsUnread(@PathVariable Long userId) {
        notificationService.markAllAsUnread(userId);
    }


    // =========================================================
    // DELETE ONE
    // =========================================================
    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
    }


    // =========================================================
    // DELETE ALL
    // =========================================================
    @DeleteMapping("/clear-all/{userId}")
    public void clearAllNotifications(@PathVariable Long userId) {
        notificationService.clearAllNotifications(userId);
    }
}