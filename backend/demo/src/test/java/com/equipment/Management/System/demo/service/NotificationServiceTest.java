
package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.model.Notification;
import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.repository.NotificationRepository;
import com.equipment.Management.System.demo.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AdminSettingService adminSettingService;

    @InjectMocks
    private NotificationService notificationService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        "testuser",
                        "password",
                        Collections.emptyList()
                );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // --------------------------------------------------
    // NOT-UT-01: CREATE NOTIFICATION SUCCESSFULLY
    // --------------------------------------------------

    @Test
    void createNotificationForUser_shouldCreateNotificationSuccessfully() {
        when(adminSettingService.isNotificationsGloballyEnabled())
                .thenReturn(true);
        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));
        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Notification result = notificationService.createNotificationForUser(
                1L,
                "Test title",
                "Test message",
                "INFO",
                100L,
                "EQUIPMENT",
                "NORMAL"
        );

        assertNotNull(result);
        assertEquals(1L, result.getUserId());
        assertEquals("Test title", result.getTitle());
        assertEquals("Test message", result.getMessage());
        assertEquals("INFO", result.getType());
        assertEquals(100L, result.getRelatedId());
        assertEquals("EQUIPMENT", result.getRelatedType());
        assertFalse(result.isRead());

        verify(notificationRepository).save(any(Notification.class));
        verify(messagingTemplate).convertAndSend(
                eq("/topic/notifications/1"),
                any(Object.class)
        );
    }

    // --------------------------------------------------
    // NOT-UT-02: NOTIFICATIONS DISABLED
    // --------------------------------------------------

    @Test
    void createNotificationForUser_shouldReturnNullWhenNotificationsDisabled() {
        when(adminSettingService.isNotificationsGloballyEnabled())
                .thenReturn(false);

        Notification result = notificationService.createNotificationForUser(
                1L,
                "Test title",
                "Test message",
                "INFO",
                100L,
                "EQUIPMENT",
                "NORMAL"
        );

        assertNull(result);

        verify(notificationRepository, never()).save(any(Notification.class));
        verify(messagingTemplate, never()).convertAndSend(
                anyString(),
                any(Object.class)
        );
    }

    // --------------------------------------------------
    // NOT-UT-03: NULL USER ID
    // --------------------------------------------------

    @Test
    void createNotificationForUser_shouldThrowExceptionWhenUserIdIsNull() {
        when(adminSettingService.isNotificationsGloballyEnabled())
                .thenReturn(true);

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> notificationService.createNotificationForUser(
                        null,
                        "Test title",
                        "Test message",
                        "INFO",
                        100L,
                        "EQUIPMENT",
                        "NORMAL"
                )
        );

        assertEquals("Target userId cannot be null", exception.getMessage());
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    // --------------------------------------------------
    // NOT-UT-04: USER DOES NOT EXIST
    // --------------------------------------------------

    @Test
    void createNotificationForUser_shouldThrowExceptionWhenUserDoesNotExist() {
        when(adminSettingService.isNotificationsGloballyEnabled())
                .thenReturn(true);
        when(userRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                RuntimeException.class,
                () -> notificationService.createNotificationForUser(
                        99L,
                        "Test title",
                        "Test message",
                        "INFO",
                        100L,
                        "EQUIPMENT",
                        "NORMAL"
                )
        );

        verify(notificationRepository, never()).save(any(Notification.class));
    }

    // --------------------------------------------------
    // NOT-UT-05: GET USER NOTIFICATIONS
    // --------------------------------------------------

    @Test
    void getUserNotifications_shouldReturnNotifications() {
        Notification notification1 = new Notification();
        notification1.setId(1L);
        notification1.setUserId(1L);
        notification1.setTitle("Equipment notification");

        Notification notification2 = new Notification();
        notification2.setId(2L);
        notification2.setUserId(1L);
        notification2.setTitle("Maintenance notification");

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(notification1, notification2));

        List<Notification> result =
                notificationService.getUserNotifications(1L);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Equipment notification", result.get(0).getTitle());
        assertEquals("Maintenance notification", result.get(1).getTitle());

        verify(notificationRepository)
                .findByUserIdOrderByCreatedAtDesc(1L);
    }

    // --------------------------------------------------
    // NOT-UT-06: NO NOTIFICATIONS
    // --------------------------------------------------

    @Test
    void getUserNotifications_shouldReturnEmptyListWhenNoNotificationsExist() {
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(Collections.emptyList());

        List<Notification> result =
                notificationService.getUserNotifications(1L);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    // --------------------------------------------------
    // NOT-UT-07: GET UNREAD COUNT
    // --------------------------------------------------

    @Test
    void getUnreadCount_shouldReturnUnreadNotificationCount() {
        when(notificationRepository.countByUserIdAndIsReadFalse(1L))
                .thenReturn(3L);

        long result = notificationService.getUnreadCount(1L);

        assertEquals(3L, result);
        verify(notificationRepository).countByUserIdAndIsReadFalse(1L);
    }

    // --------------------------------------------------
    // NOT-UT-08: ZERO UNREAD NOTIFICATIONS
    // --------------------------------------------------

    @Test
    void getUnreadCount_shouldReturnZeroWhenNoUnreadNotificationsExist() {
        when(notificationRepository.countByUserIdAndIsReadFalse(1L))
                .thenReturn(0L);

        long result = notificationService.getUnreadCount(1L);

        assertEquals(0L, result);
    }

    // --------------------------------------------------
    // NOT-UT-09: GET CURRENT USER'S NOTIFICATIONS
    // --------------------------------------------------

    @Test
    void getMyNotifications_shouldReturnCurrentUserNotifications() {
        when(userRepository.findByUsername("testuser"))
                .thenReturn(Optional.of(user));

        Notification notification = new Notification();
        notification.setId(1L);
        notification.setUserId(1L);
        notification.setTitle("My notification");

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(notification));

        List<Notification> result =
                notificationService.getMyNotifications();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("My notification", result.get(0).getTitle());

        verify(notificationRepository)
                .findByUserIdOrderByCreatedAtDesc(1L);
    }

    // --------------------------------------------------
    // NOT-UT-10: MARK NOTIFICATION AS READ
    // --------------------------------------------------

    @Test
    void markAsRead_shouldMarkNotificationAsRead() {
        Notification notification = new Notification();
        notification.setId(10L);
        notification.setUserId(1L);
        notification.setRead(false);

        when(userRepository.findByUsername("testuser"))
                .thenReturn(Optional.of(user));
        when(notificationRepository.findById(10L))
                .thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        notificationService.markAsRead(10L);

        assertTrue(notification.isRead());
        verify(notificationRepository).save(notification);
    }

    // --------------------------------------------------
    // NOT-UT-11: MARK NONEXISTENT NOTIFICATION AS READ
    // --------------------------------------------------

    @Test
    void markAsRead_shouldThrowExceptionWhenNotificationDoesNotExist() {
        when(notificationRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                RuntimeException.class,
                () -> notificationService.markAsRead(99L)
        );

        verify(notificationRepository, never()).save(any(Notification.class));
    }

    // --------------------------------------------------
    // NOT-UT-12: PREVENT ACCESS TO ANOTHER USER'S NOTIFICATION
    // --------------------------------------------------

    @Test
    void markAsRead_shouldRejectNotificationOwnedByAnotherUser() {
        Notification notification = new Notification();
        notification.setId(10L);
        notification.setUserId(2L);
        notification.setRead(false);

        when(userRepository.findByUsername("testuser"))
                .thenReturn(Optional.of(user));
        when(notificationRepository.findById(10L))
                .thenReturn(Optional.of(notification));

        assertThrows(
                RuntimeException.class,
                () -> notificationService.markAsRead(10L)
        );

        assertFalse(notification.isRead());
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    // --------------------------------------------------
    // NOT-UT-13: MARK ALL NOTIFICATIONS AS READ
    // --------------------------------------------------

    @Test
    void markAllAsRead_shouldMarkAllUserNotificationsAsRead() {
        when(userRepository.findByUsername("testuser"))
                .thenReturn(Optional.of(user));

        Notification notification1 = new Notification();
        notification1.setId(1L);
        notification1.setUserId(1L);
        notification1.setRead(false);

        Notification notification2 = new Notification();
        notification2.setId(2L);
        notification2.setUserId(1L);
        notification2.setRead(false);

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(notification1, notification2));

        notificationService.markAllAsRead(1L);

        assertTrue(notification1.isRead());
        assertTrue(notification2.isRead());

        verify(notificationRepository).saveAll(anyList());
    }

    // --------------------------------------------------
    // NOT-UT-14: PREVENT MARKING ANOTHER USER'S NOTIFICATIONS AS READ
    // --------------------------------------------------

    @Test
    void markAllAsRead_shouldRejectAnotherUsersNotifications() {
        when(userRepository.findByUsername("testuser"))
                .thenReturn(Optional.of(user));

        assertThrows(
                RuntimeException.class,
                () -> notificationService.markAllAsRead(2L)
        );

        verify(notificationRepository, never()).saveAll(anyList());
    }

    // --------------------------------------------------
    // NOT-UT-15: DELETE NOTIFICATION
    // --------------------------------------------------

    @Test
    void deleteNotification_shouldDeleteNotification() {
        Notification notification = new Notification();
        notification.setId(10L);
        notification.setUserId(1L);

        when(userRepository.findByUsername("testuser"))
                .thenReturn(Optional.of(user));
        when(notificationRepository.findById(10L))
                .thenReturn(Optional.of(notification));

        notificationService.deleteNotification(10L);

        verify(notificationRepository).delete(notification);
    }

    // --------------------------------------------------
    // NOT-UT-16: PREVENT DELETING ANOTHER USER'S NOTIFICATION
    // --------------------------------------------------

    @Test
    void deleteNotification_shouldRejectAnotherUsersNotification() {
        Notification notification = new Notification();
        notification.setId(10L);
        notification.setUserId(2L);

        when(userRepository.findByUsername("testuser"))
                .thenReturn(Optional.of(user));
        when(notificationRepository.findById(10L))
                .thenReturn(Optional.of(notification));

        assertThrows(
                RuntimeException.class,
                () -> notificationService.deleteNotification(10L)
        );

        verify(notificationRepository, never())
                .delete(any(Notification.class));
    }

    // --------------------------------------------------
    // NOT-UT-17: CLEAR ALL CURRENT USER NOTIFICATIONS
    // --------------------------------------------------

    @Test
    void clearAllNotifications_shouldDeleteAllCurrentUserNotifications() {
        when(userRepository.findByUsername("testuser"))
                .thenReturn(Optional.of(user));

        Notification notification1 = new Notification();
        notification1.setId(1L);
        notification1.setUserId(1L);

        Notification notification2 = new Notification();
        notification2.setId(2L);
        notification2.setUserId(1L);

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(notification1, notification2));

        notificationService.clearAllNotifications(1L);

        verify(notificationRepository).deleteAll(anyList());
    }

    // --------------------------------------------------
    // NOT-UT-18: PREVENT CLEARING ANOTHER USER'S NOTIFICATIONS
    // --------------------------------------------------

    @Test
    void clearAllNotifications_shouldRejectAnotherUsersNotifications() {
        when(userRepository.findByUsername("testuser"))
                .thenReturn(Optional.of(user));

        assertThrows(
                RuntimeException.class,
                () -> notificationService.clearAllNotifications(2L)
        );

        verify(notificationRepository, never()).deleteAll(anyList());
    }
}
