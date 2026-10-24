package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.dto.BorrowRequestNotificationResponse;
import com.equipment.Management.System.demo.model.BorrowRequestNotification;
import com.equipment.Management.System.demo.repository.BorrowRequestNotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BorrowRequestNotificationService {

    private final BorrowRequestNotificationRepository notificationRepository;

    public BorrowRequestNotificationService(BorrowRequestNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(readOnly = true)
    public List<BorrowRequestNotificationResponse> getNotifications(String username) {
        return notificationRepository.findAllByRecipientUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BorrowRequestNotificationResponse markAsRead(Long notificationId, String username) {
        BorrowRequestNotification notification = notificationRepository
                .findByIdAndRecipientUsername(notificationId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found."));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification = notificationRepository.save(notification);
        }
        return toResponse(notification);
    }

    private BorrowRequestNotificationResponse toResponse(BorrowRequestNotification notification) {
        BorrowRequestNotificationResponse response = new BorrowRequestNotificationResponse();
        response.setId(notification.getId());
        response.setRequestId(notification.getBorrowRequest().getId());
        response.setEquipmentName(notification.getBorrowRequest().getEquipment().getEquipmentName());
        response.setDecision(notification.getDecision());
        response.setMessage(notification.getMessage());
        response.setRead(notification.isRead());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }
}
