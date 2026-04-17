package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.model.Notification;
import com.equipment.Management.System.demo.model.NotificationMessage;
import com.equipment.Management.System.demo.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // 🔔 CREATE NOTIFICATION (DB + REAL-TIME)
    public Notification createNotification(Long userId, String title, String message,
                                           String type, Long relatedId, String relatedType,
                                           String priority) {

        // ✅ 1. SAVE TO DATABASE
        Notification notification = new Notification();

        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRelatedId(relatedId);
        notification.setRelatedType(relatedType);
        notification.setPriority(priority);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);

        // ✅ 2. SEND REAL-TIME MESSAGE
        NotificationMessage msg = new NotificationMessage();
        msg.setTitle(title);
        msg.setMessage(message);
        msg.setType(type);

        messagingTemplate.convertAndSend("/topic/notifications", msg);

        return saved;
    }

    // 📥 GET USER NOTIFICATIONS
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // 👁️ MARK AS READ
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    // 🔢 UNREAD COUNT
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}