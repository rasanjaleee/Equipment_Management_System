package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.dto.BorrowRequestCreateRequest;
import com.equipment.Management.System.demo.dto.BorrowRequestResponse;
import com.equipment.Management.System.demo.model.BorrowRequest;
import com.equipment.Management.System.demo.model.BorrowRequestNotification;
import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.repository.BorrowRequestNotificationRepository;
import com.equipment.Management.System.demo.repository.BorrowRequestRepository;
import com.equipment.Management.System.demo.repository.EquipmentRepository;
import com.equipment.Management.System.demo.repository.IssuanceRepository;
import com.equipment.Management.System.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BorrowRequestServiceTest {

    @Mock
    private BorrowRequestRepository borrowRequestRepository;
    @Mock
    private EquipmentRepository equipmentRepository;
    @Mock
    private BorrowRequestNotificationRepository notificationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private IssuanceRepository issuanceRepository;

    private BorrowRequestService service;

    @BeforeEach
    void setUp() {
        service = new BorrowRequestService(
                borrowRequestRepository,
                equipmentRepository,
                notificationRepository,
                userRepository,
                issuanceRepository
        );
    }

    @Test
    void createsRequestForAuthenticatedAccountAndAlwaysStartsPending() {
        Equipment equipment = equipment();
        User requester = user(42L, "requester");
        BorrowRequestCreateRequest request = request();
        request.setStatus("APPROVED");
        when(borrowRequestRepository.findOverlappingBlockingRequests(
                eq(7L), any(), any(), anyList())).thenReturn(List.of());
        when(equipmentRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(equipment));
        when(issuanceRepository.findOverlappingActiveIssuances(
                eq(7L), any(), any(), anyList())).thenReturn(List.of());
        when(equipmentRepository.findById(7L)).thenReturn(Optional.of(equipment));
        when(userRepository.findByUsername("requester")).thenReturn(Optional.of(requester));
        when(borrowRequestRepository.save(any(BorrowRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        BorrowRequestResponse response = service.createBorrowRequest(request, "requester");

        ArgumentCaptor<BorrowRequest> saved = ArgumentCaptor.forClass(BorrowRequest.class);
        verify(borrowRequestRepository).save(saved.capture());
        assertSame(requester, saved.getValue().getRequester());
        assertEquals("PENDING", saved.getValue().getStatus());
        assertEquals("PENDING", response.getStatus());
    }

    @Test
    void rejectsRequestOverlappingActiveIssuance() {
        Equipment equipment = equipment();
        BorrowRequestCreateRequest request = request();
        when(equipmentRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(equipment));
        when(borrowRequestRepository.findOverlappingBlockingRequests(
                eq(7L), any(), any(), anyList())).thenReturn(List.of());
        when(issuanceRepository.findOverlappingActiveIssuances(
                eq(7L), any(), any(), anyList())).thenReturn(List.of(new com.equipment.Management.System.demo.model.Issuance()));

        assertThrows(ResponseStatusException.class,
                () -> service.createBorrowRequest(request, "requester"));
        verify(borrowRequestRepository, never()).save(any(BorrowRequest.class));
    }

    @Test
    void allowsRequestWhenNoBorrowOrActiveIssuanceOverlapExists() {
        Equipment equipment = equipment();
        User requester = user(42L, "requester");
        BorrowRequestCreateRequest request = request();
        when(equipmentRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(equipment));
        when(borrowRequestRepository.findOverlappingBlockingRequests(
                eq(7L), any(), any(), anyList())).thenReturn(List.of());
        when(issuanceRepository.findOverlappingActiveIssuances(
                eq(7L), any(), any(), anyList())).thenReturn(List.of());
        when(equipmentRepository.findById(7L)).thenReturn(Optional.of(equipment));
        when(userRepository.findByUsername("requester")).thenReturn(Optional.of(requester));
        when(borrowRequestRepository.save(any(BorrowRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        assertEquals("PENDING", service.createBorrowRequest(request, "requester").getStatus());
    }

    @Test
    void approvalCreatesUnreadNotificationForRequester() {
        BorrowRequest request = borrowRequest("PENDING");
        when(borrowRequestRepository.findById(11L)).thenReturn(Optional.of(request));
        when(equipmentRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(request.getEquipment()));
        when(borrowRequestRepository.findByIdForUpdate(11L)).thenReturn(Optional.of(request));
        when(borrowRequestRepository.findOverlappingBlockingRequestsExcept(
                eq(11L), eq(7L), any(), any(), anyList())).thenReturn(List.of());
        when(issuanceRepository.findOverlappingActiveIssuances(
                eq(7L), any(), any(), anyList())).thenReturn(List.of());
        when(borrowRequestRepository.save(any(BorrowRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(notificationRepository.existsByBorrowRequestIdAndDecision(11L, "APPROVED")).thenReturn(false);

        BorrowRequestResponse response = service.updateStatus(11L, "approved");

        ArgumentCaptor<BorrowRequestNotification> saved =
                ArgumentCaptor.forClass(BorrowRequestNotification.class);
        verify(notificationRepository).save(saved.capture());
        BorrowRequestNotification notification = saved.getValue();
        assertSame(request.getRequester(), notification.getRecipient());
        assertSame(request, notification.getBorrowRequest());
        assertEquals("APPROVED", notification.getDecision());
        assertEquals("Your request #11 for Oscilloscope has been approved.", notification.getMessage());
        assertFalse(notification.isRead());
        assertEquals("APPROVED", response.getStatus());
    }

    @Test
    void rejectionCreatesNotificationForRequester() {
        BorrowRequest request = borrowRequest("PENDING");
        when(borrowRequestRepository.findById(11L)).thenReturn(Optional.of(request));
        when(borrowRequestRepository.findByIdForUpdate(11L)).thenReturn(Optional.of(request));
        when(borrowRequestRepository.save(any(BorrowRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(notificationRepository.existsByBorrowRequestIdAndDecision(11L, "REJECTED")).thenReturn(false);

        service.updateStatus(11L, "REJECTED");

        ArgumentCaptor<BorrowRequestNotification> saved =
                ArgumentCaptor.forClass(BorrowRequestNotification.class);
        verify(notificationRepository).save(saved.capture());
        assertEquals("REJECTED", saved.getValue().getDecision());
        assertTrue(saved.getValue().getMessage().contains("has been rejected."));
    }

    @Test
    void repeatedApprovalDoesNotCreateDuplicateNotification() {
        BorrowRequest request = borrowRequest("APPROVED");
        when(borrowRequestRepository.findById(11L)).thenReturn(Optional.of(request));
        when(borrowRequestRepository.findByIdForUpdate(11L)).thenReturn(Optional.of(request));
        when(notificationRepository.existsByBorrowRequestIdAndDecision(11L, "APPROVED")).thenReturn(true);

        service.updateStatus(11L, "APPROVED");

        verify(notificationRepository, never()).save(any(BorrowRequestNotification.class));
    }

    @Test
    void decidedRequestCannotBeChangedToOppositeDecision() {
        BorrowRequest request = borrowRequest("APPROVED");
        when(borrowRequestRepository.findById(11L)).thenReturn(Optional.of(request));
        when(borrowRequestRepository.findByIdForUpdate(11L)).thenReturn(Optional.of(request));

        assertThrows(ResponseStatusException.class, () -> service.updateStatus(11L, "REJECTED"));

        verify(notificationRepository, never()).save(any(BorrowRequestNotification.class));
    }

    @Test
    void approvalRejectsActiveIssuanceConflict() {
        BorrowRequest request = borrowRequest("PENDING");
        when(borrowRequestRepository.findById(11L)).thenReturn(Optional.of(request));
        when(equipmentRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(request.getEquipment()));
        when(borrowRequestRepository.findByIdForUpdate(11L)).thenReturn(Optional.of(request));
        when(borrowRequestRepository.findOverlappingBlockingRequestsExcept(
                eq(11L), eq(7L), any(), any(), anyList())).thenReturn(List.of());
        when(issuanceRepository.findOverlappingActiveIssuances(
                eq(7L), any(), any(), anyList())).thenReturn(List.of(new com.equipment.Management.System.demo.model.Issuance()));

        assertThrows(ResponseStatusException.class, () -> service.updateStatus(11L, "APPROVED"));
        verify(borrowRequestRepository, never()).save(any(BorrowRequest.class));
    }

    @Test
    void approvalSucceedsWhenNoConflictsExist() {
        BorrowRequest request = borrowRequest("PENDING");
        when(borrowRequestRepository.findById(11L)).thenReturn(Optional.of(request));
        when(equipmentRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(request.getEquipment()));
        when(borrowRequestRepository.findByIdForUpdate(11L)).thenReturn(Optional.of(request));
        when(borrowRequestRepository.findOverlappingBlockingRequestsExcept(
                eq(11L), eq(7L), any(), any(), anyList())).thenReturn(List.of());
        when(issuanceRepository.findOverlappingActiveIssuances(
                eq(7L), any(), any(), anyList())).thenReturn(List.of());
        when(borrowRequestRepository.save(any(BorrowRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(notificationRepository.existsByBorrowRequestIdAndDecision(11L, "APPROVED")).thenReturn(true);

        assertEquals("APPROVED", service.updateStatus(11L, "APPROVED").getStatus());
    }

    private BorrowRequestCreateRequest request() {
        BorrowRequestCreateRequest request = new BorrowRequestCreateRequest();
        request.setEquipmentId(7L);
        request.setApplicantName("Requester");
        request.setRegistrationOrStaffId("REG-7");
        request.setDepartment("Engineering");
        request.setEmail("requester@example.com");
        request.setContactNumber("123456");
        request.setBorrowStartDate(LocalDate.of(2026, 10, 25));
        request.setBorrowEndDate(LocalDate.of(2026, 10, 26));
        request.setPurpose("Testing");
        return request;
    }

    private BorrowRequest borrowRequest(String status) {
        BorrowRequest request = new BorrowRequest();
        request.setId(11L);
        request.setEquipment(equipment());
        request.setRequester(user(42L, "requester"));
        request.setEmail("requester@example.com");
        request.setStatus(status);
        request.setApplicantName("Requester");
        request.setRegistrationOrStaffId("REG-7");
        request.setDepartment("Engineering");
        request.setContactNumber("123456");
        request.setBorrowStartDate(LocalDate.of(2026, 10, 25));
        request.setBorrowEndDate(LocalDate.of(2026, 10, 26));
        request.setPurpose("Testing");
        return request;
    }

    private Equipment equipment() {
        Equipment equipment = new Equipment();
        equipment.setId(7L);
        equipment.setEquipmentName("Oscilloscope");
        return equipment;
    }

    private User user(Long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        return user;
    }
}
