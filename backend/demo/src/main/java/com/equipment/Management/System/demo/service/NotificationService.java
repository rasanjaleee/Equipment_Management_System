package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.model.Notification;
import com.equipment.Management.System.demo.model.NotificationMessage;
import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.repository.NotificationRepository;
import com.equipment.Management.System.demo.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               SimpMessagingTemplate messagingTemplate,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
    }

    // Send notification to a specific target user
    public Notification createNotificationForUser(Long targetUserId, String title, String message,
                                                  String type, Long relatedId, String relatedType,
                                                  String priority) {
        if (targetUserId == null) {
            throw new RuntimeException("Target userId cannot be null");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found with id: " + targetUserId));

        Notification notification = new Notification();
        notification.setUserId(targetUser.getId());
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRelatedId(relatedId);
        notification.setRelatedType(relatedType);
        notification.setPriority(priority);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);

        NotificationMessage msg = new NotificationMessage();
        msg.setTitle(title);
        msg.setMessage(message);
        msg.setType(type);

        messagingTemplate.convertAndSend("/topic/notifications/" + targetUserId, msg);

        return saved;
    }

    // Optional: send notification to currently logged-in user
    public Notification createNotificationForCurrentUser(String title, String message,
                                                         String type, Long relatedId, String relatedType,
                                                         String priority) {
        Long currentUserId = getCurrentUserId();
        return createNotificationForUser(currentUserId, title, message, type, relatedId, relatedType, priority);
    }

    public List<Notification> getMyNotifications() {
        Long currentUserId = getCurrentUserId();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUserId);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        Long currentUserId = getCurrentUserId();

        if (!notification.getUserId().equals(currentUserId)) {
            throw new RuntimeException("You are not allowed to modify this notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public long getMyUnreadCount() {
        Long currentUserId = getCurrentUserId();
        return notificationRepository.countByUserIdAndIsReadFalse(currentUserId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication instanceof AnonymousAuthenticationToken) {
            throw new RuntimeException("No authenticated user found");
        }

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + username));

        return user.getId();
    }
}