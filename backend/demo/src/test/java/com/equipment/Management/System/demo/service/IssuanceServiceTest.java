package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.dto.IssuanceDTO;
import com.equipment.Management.System.demo.dto.IssuanceRequest;
import com.equipment.Management.System.demo.dto.ReturnRequest;
import com.equipment.Management.System.demo.model.BorrowRequest;
import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.model.Issuance;
import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.repository.BorrowRequestRepository;
import com.equipment.Management.System.demo.repository.EquipmentRepository;
import com.equipment.Management.System.demo.repository.IssuanceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IssuanceServiceTest {

    @Mock
    private IssuanceRepository issuanceRepository;
    @Mock
    private EquipmentRepository equipmentRepository;
    @Mock
    private BorrowRequestRepository borrowRequestRepository;

    private IssuanceService service;
    private BorrowRequest approvedRequest;

    @BeforeEach
    void setUp() {
        service = new IssuanceService(issuanceRepository, equipmentRepository, borrowRequestRepository);
        approvedRequest = borrowRequest("APPROVED");
    }

    @Test
    void createsIssuanceFromApprovedRequestAndDerivesEquipmentAndUser() {
        when(borrowRequestRepository.findById(11L)).thenReturn(Optional.of(approvedRequest));
        when(equipmentRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(approvedRequest.getEquipment()));
        when(borrowRequestRepository.findByIdForUpdate(11L)).thenReturn(Optional.of(approvedRequest));
        when(issuanceRepository.findByBorrowRequest_Id(11L)).thenReturn(Optional.empty());
        when(equipmentRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(approvedRequest.getEquipment()));
        when(issuanceRepository.findOverlappingActiveIssuances(eq(7L), any(), any(), anyList()))
                .thenReturn(List.of());
        when(issuanceRepository.findByIssuanceId("ISS-11")).thenReturn(Optional.empty());
        when(issuanceRepository.save(any(Issuance.class))).thenAnswer(invocation -> {
            Issuance issuance = invocation.getArgument(0);
            issuance.setId(99L);
            return issuance;
        });

        IssuanceDTO created = service.createIssuance(request(11L));

        assertEquals(11L, created.getBorrowRequestId());
        assertEquals(7L, created.getEquipmentId());
        assertEquals(42L, created.getUserId());
        assertEquals("ISSUED", created.getStatus());
    }

    @Test
    void rejectsPendingRequest() {
        approvedRequest.setStatus("PENDING");
        when(borrowRequestRepository.findById(11L)).thenReturn(Optional.of(approvedRequest));
        when(equipmentRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(approvedRequest.getEquipment()));
        when(borrowRequestRepository.findByIdForUpdate(11L)).thenReturn(Optional.of(approvedRequest));

        assertThrows(ResponseStatusException.class, () -> service.createIssuance(request(11L)));
        verify(issuanceRepository, never()).save(any());
    }

    @Test
    void rejectsMissingBorrowRequest() {
        when(borrowRequestRepository.findById(11L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> service.createIssuance(request(11L)));
    }

    @Test
    void rejectsDuplicateIssuanceForRequest() {
        when(borrowRequestRepository.findById(11L)).thenReturn(Optional.of(approvedRequest));
        when(equipmentRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(approvedRequest.getEquipment()));
        when(borrowRequestRepository.findByIdForUpdate(11L)).thenReturn(Optional.of(approvedRequest));
        when(issuanceRepository.findByBorrowRequest_Id(11L)).thenReturn(Optional.of(new Issuance()));

        assertThrows(ResponseStatusException.class, () -> service.createIssuance(request(11L)));
        verify(equipmentRepository, never()).findById(any());
    }

    @Test
    void rejectsOverlappingActiveIssuanceAfterEquipmentLock() {
        when(borrowRequestRepository.findById(11L)).thenReturn(Optional.of(approvedRequest));
        when(equipmentRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(approvedRequest.getEquipment()));
        when(borrowRequestRepository.findByIdForUpdate(11L)).thenReturn(Optional.of(approvedRequest));
        when(issuanceRepository.findByBorrowRequest_Id(11L)).thenReturn(Optional.empty());
        when(issuanceRepository.findOverlappingActiveIssuances(eq(7L), any(), any(), anyList()))
                .thenReturn(List.of(new Issuance()));

        assertThrows(ResponseStatusException.class, () -> service.createIssuance(request(11L)));
        verify(issuanceRepository, never()).save(any(Issuance.class));
    }

    @Test
    void rejectsInvalidQuantityAndDates() {
        IssuanceRequest invalidQuantity = request(11L);
        invalidQuantity.setQtyIssued(0);
        assertThrows(ResponseStatusException.class, () -> service.createIssuance(invalidQuantity));

        IssuanceRequest invalidDates = request(11L);
        invalidDates.setReturnDueDate(invalidDates.getIssueDate().minusDays(1));
        assertThrows(ResponseStatusException.class, () -> service.createIssuance(invalidDates));
        verify(borrowRequestRepository, never()).findById(any());
    }

    @Test
    void returnsIssuanceAndRejectsDuplicateReturn() {
        Issuance issuance = issuance("ISSUED", LocalDate.now().minusDays(2));
        when(issuanceRepository.findByIdForUpdate(99L)).thenReturn(Optional.of(issuance));
        when(issuanceRepository.save(any(Issuance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setReturnDate(LocalDate.now());
        returnRequest.setConditionOnReturn("Working");

        IssuanceDTO returned = service.returnIssuance(99L, returnRequest);
        assertEquals("RETURNED", returned.getStatus());

        assertThrows(ResponseStatusException.class, () -> service.returnIssuance(99L, returnRequest));
    }

    @Test
    void calculatesOverdueButNeverOverdueForReturnedIssuance() {
        Issuance overdue = issuance("ISSUED", LocalDate.now().minusDays(5));
        overdue.setReturnDueDate(LocalDate.now().minusDays(1));
        when(issuanceRepository.findById(99L)).thenReturn(Optional.of(overdue));
        assertEquals("OVERDUE", service.getIssuanceById(99L).getStatus());

        overdue.setStatus("RETURNED");
        overdue.setReturnDate(LocalDate.now());
        assertEquals("RETURNED", service.getIssuanceById(99L).getStatus());
    }

    private IssuanceRequest request(Long borrowRequestId) {
        IssuanceRequest request = new IssuanceRequest();
        request.setBorrowRequestId(borrowRequestId);
        request.setIssuanceId("ISS-11");
        request.setIssueDate(LocalDate.now());
        request.setReturnDueDate(LocalDate.now().plusDays(3));
        request.setQtyIssued(1);
        request.setConditionAtIssue("Working");
        return request;
    }

    private BorrowRequest borrowRequest(String status) {
        BorrowRequest request = new BorrowRequest();
        request.setId(11L);
        request.setStatus(status);
        request.setEquipment(equipment());
        request.setRequester(user());
        request.setBorrowStartDate(LocalDate.now());
        request.setBorrowEndDate(LocalDate.now().plusDays(3));
        return request;
    }

    private Issuance issuance(String status, LocalDate issueDate) {
        Issuance issuance = new Issuance();
        issuance.setId(99L);
        issuance.setIssuanceId("ISS-99");
        issuance.setStatus(status);
        issuance.setIssueDate(issueDate);
        issuance.setReturnDueDate(issueDate.plusDays(2));
        issuance.setEquipment(equipment());
        issuance.setUser(user());
        issuance.setQtyIssued(1);
        issuance.setConditionAtIssue("Working");
        return issuance;
    }

    private Equipment equipment() {
        Equipment equipment = new Equipment();
        equipment.setId(7L);
        equipment.setEquipmentName("Oscilloscope");
        return equipment;
    }

    private User user() {
        User user = new User();
        user.setId(42L);
        user.setUsername("requester");
        user.setEmail("requester@example.com");
        return user;
    }
}
