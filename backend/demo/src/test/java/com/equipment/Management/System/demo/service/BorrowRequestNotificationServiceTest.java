package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.dto.BorrowRequestNotificationResponse;
import com.equipment.Management.System.demo.model.BorrowRequest;
import com.equipment.Management.System.demo.model.BorrowRequestNotification;
import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.repository.BorrowRequestNotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BorrowRequestNotificationServiceTest {

    @Mock
    private BorrowRequestNotificationRepository notificationRepository;

    private BorrowRequestNotificationService service;

    @BeforeEach
    void setUp() {
        service = new BorrowRequestNotificationService(notificationRepository);
    }

    @Test
    void listsOnlyNotificationsForRequestedUser() {
        BorrowRequestNotification notification = notification();
        when(notificationRepository.findAllByRecipientUsernameOrderByCreatedAtDesc("owner"))
                .thenReturn(List.of(notification));

        List<BorrowRequestNotificationResponse> result = service.getNotifications("owner");

        assertEquals(1, result.size());
        assertEquals(11L, result.get(0).getRequestId());
        assertEquals("APPROVED", result.get(0).getDecision());
        verify(notificationRepository).findAllByRecipientUsernameOrderByCreatedAtDesc("owner");
    }

    @Test
    void marksOwnedNotificationAsRead() {
        BorrowRequestNotification notification = notification();
        when(notificationRepository.findByIdAndRecipientUsername(5L, "owner"))
                .thenReturn(Optional.of(notification));
        when(notificationRepository.save(notification)).thenReturn(notification);

        BorrowRequestNotificationResponse result = service.markAsRead(5L, "owner");

        assertTrue(result.isRead());
        verify(notificationRepository).save(notification);
    }

    @Test
    void anotherUsersNotificationIsNotAccessible() {
        when(notificationRepository.findByIdAndRecipientUsername(5L, "other"))
                .thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> service.markAsRead(5L, "other"));

        verify(notificationRepository, never()).save(any());
    }

    private BorrowRequestNotification notification() {
        Equipment equipment = new Equipment();
        equipment.setEquipmentName("Oscilloscope");
        BorrowRequest request = new BorrowRequest();
        request.setId(11L);
        request.setEquipment(equipment);
        User recipient = new User();
        recipient.setUsername("owner");
        BorrowRequestNotification notification = new BorrowRequestNotification();
        notification.setId(5L);
        notification.setRecipient(recipient);
        notification.setBorrowRequest(request);
        notification.setDecision("APPROVED");
        notification.setMessage("Your request #11 for Oscilloscope has been approved.");
        return notification;
    }
}
