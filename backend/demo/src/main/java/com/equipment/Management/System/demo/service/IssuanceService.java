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
import com.equipment.Management.System.demo.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class IssuanceService {

    private static final List<String> ACTIVE_STATUSES = List.of("ISSUED", "OVERDUE");

    private final IssuanceRepository issuanceRepository;
    private final EquipmentRepository equipmentRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final UserRepository userRepository;

    @Autowired
    public IssuanceService(IssuanceRepository issuanceRepository,
                           EquipmentRepository equipmentRepository,
                           BorrowRequestRepository borrowRequestRepository,
                           UserRepository userRepository) {
        this.issuanceRepository = issuanceRepository;
        this.equipmentRepository = equipmentRepository;
        this.borrowRequestRepository = borrowRequestRepository;
        this.userRepository = userRepository;
    }

    public IssuanceService(IssuanceRepository issuanceRepository,
                           EquipmentRepository equipmentRepository,
                           BorrowRequestRepository borrowRequestRepository) {
        this(issuanceRepository, equipmentRepository, borrowRequestRepository, null);
    }

    public IssuanceDTO createIssuance(IssuanceRequest request, String ignoredUsername) {
        return createIssuance(request);
    }

    @Transactional
    public IssuanceDTO createIssuance(IssuanceRequest request) {
        validateCreateRequest(request);

        BorrowRequest requestedBorrow = borrowRequestRepository.findById(request.getBorrowRequestId())
                .orElseThrow(() -> notFound("Borrow request not found."));

        Equipment equipment = equipmentRepository.findByIdForUpdate(requestedBorrow.getEquipment().getId())
                .orElseThrow(() -> notFound("Equipment not found."));

        BorrowRequest borrowRequest = borrowRequestRepository.findByIdForUpdate(request.getBorrowRequestId())
                .orElseThrow(() -> notFound("Borrow request not found."));

        if (!"APPROVED".equalsIgnoreCase(borrowRequest.getStatus())) {
            throw conflict("Only an approved borrow request can be issued.");
        }
        if (borrowRequest.getRequester() == null) {
            throw conflict("The approved borrow request is not linked to a user account.");
        }
        if (issuanceRepository.findByBorrowRequest_Id(borrowRequest.getId()).isPresent()) {
            throw conflict("This borrow request already has an issuance.");
        }

        List<Issuance> conflicts = issuanceRepository.findOverlappingActiveIssuances(
                equipment.getId(), request.getIssueDate(), request.getReturnDueDate(), ACTIVE_STATUSES);
        if (!conflicts.isEmpty()) {
            throw conflict("Equipment is already issued for the selected date range.");
        }

        Issuance issuance = new Issuance();
        issuance.setBorrowRequest(borrowRequest);
        issuance.setIssuanceId(request.getIssuanceId().trim());
        issuance.setIssueDate(request.getIssueDate());
        issuance.setReturnDueDate(request.getReturnDueDate());
        issuance.setStatus("ISSUED");
        issuance.setEquipment(equipment);
        issuance.setQtyIssued(request.getQtyIssued());
        issuance.setConditionAtIssue(request.getConditionAtIssue().trim());
        issuance.setUser(borrowRequest.getRequester());
        issuance.setRoleDept(request.getRoleDept());
        issuance.setContact(request.getContact());
        issuance.setRemarks(request.getRemarks());

        if (issuanceRepository.findByIssuanceId(issuance.getIssuanceId()).isPresent()) {
            throw conflict("Issuance ID already exists: " + issuance.getIssuanceId());
        }

        return toDto(issuanceRepository.save(issuance));
    }

    @Transactional(readOnly = true)
    public List<IssuanceDTO> getAllIssuances() {
        return issuanceRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public IssuanceDTO getIssuanceById(Long id) {
        return toDto(findIssuance(id));
    }

    @Transactional(readOnly = true)
    public IssuanceDTO getIssuanceByIssuanceId(String issuanceId) {
        return toDto(issuanceRepository.findByIssuanceId(issuanceId)
                .orElseThrow(() -> notFound("Issuance not found with Issuance ID: " + issuanceId)));
    }

    @Transactional(readOnly = true)
    public List<IssuanceDTO> getIssuancesByStatus(String status) {
        String requestedStatus = normalizeStatus(status);
        return issuanceRepository.findAll().stream()
                .filter(issuance -> requestedStatus.equals(effectiveStatus(issuance)))
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<IssuanceDTO> getIssuancesByUserId(Long userId) {
        return issuanceRepository.findByUserId(userId).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<IssuanceDTO> getIssuancesByEquipmentId(Long equipmentId) {
        return issuanceRepository.findByEquipment_Id(equipmentId).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<IssuanceDTO> getMyIssuances(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> notFound("User not found."));
        return issuanceRepository.findByUser_Id(user.getId()).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public IssuanceDTO getCurrentIssuanceByEquipmentId(Long equipmentId) {
        return toDto(issuanceRepository.findFirstByEquipment_IdAndStatusIgnoreCase(equipmentId, "ISSUED")
                .orElseThrow(() -> notFound("No current issuance found for equipment ID: " + equipmentId)));
    }

    @Transactional
    public IssuanceDTO returnIssuance(Long id, ReturnRequest request) {
        if (request == null || request.getReturnDate() == null
                || request.getConditionOnReturn() == null
                || request.getConditionOnReturn().isBlank()) {
            throw badRequest("Return date and condition are required.");
        }

        Issuance issuance = issuanceRepository.findByIdForUpdate(id)
                .orElseThrow(() -> notFound("Issuance not found with ID: " + id));
        String status = effectiveStatus(issuance);
        if ("RETURNED".equals(status)) {
            throw conflict("This issuance has already been returned.");
        }
        if (!"ISSUED".equals(status) && !"OVERDUE".equals(status)) {
            throw conflict("This issuance cannot be returned from its current status.");
        }
        if (request.getReturnDate().isBefore(issuance.getIssueDate())
                || request.getReturnDate().isAfter(LocalDate.now())) {
            throw badRequest("Return date must be between the issue date and today.");
        }

        issuance.setReturnDate(request.getReturnDate());
        issuance.setConditionOnReturn(request.getConditionOnReturn().trim());
        issuance.setRemarks(request.getRemarks());
        issuance.setStatus("RETURNED");
        return toDto(issuanceRepository.save(issuance));
    }

    @Transactional
    public IssuanceDTO updateIssuance(Long id, IssuanceRequest request) {
        Issuance current = findIssuance(id);
        Equipment equipment = equipmentRepository.findByIdForUpdate(current.getEquipment().getId())
                .orElseThrow(() -> notFound("Equipment not found."));
        Issuance issuance = issuanceRepository.findByIdForUpdate(id)
                .orElseThrow(() -> notFound("Issuance not found with ID: " + id));
        if ("RETURNED".equals(effectiveStatus(issuance))) {
            throw conflict("A returned issuance cannot be edited.");
        }
        validateDates(request.getIssueDate(), request.getReturnDueDate());
        if (request.getQtyIssued() == null || request.getQtyIssued() <= 0) {
            throw badRequest("Quantity must be positive.");
        }
        if (request.getIssuanceId() == null || request.getIssuanceId().isBlank()) {
            throw badRequest("Issuance ID is required.");
        }
        if (!issuanceRepository.findOverlappingActiveIssuancesExcept(
                id, equipment.getId(), request.getIssueDate(), request.getReturnDueDate(),
                ACTIVE_STATUSES).isEmpty()) {
            throw conflict("Equipment is already issued for the selected date range.");
        }
        issuanceRepository.findByIssuanceId(request.getIssuanceId()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw conflict("Issuance ID already exists: " + request.getIssuanceId());
            }
        });

        issuance.setIssuanceId(request.getIssuanceId().trim());
        issuance.setIssueDate(request.getIssueDate());
        issuance.setReturnDueDate(request.getReturnDueDate());
        issuance.setQtyIssued(request.getQtyIssued());
        issuance.setConditionAtIssue(request.getConditionAtIssue());
        issuance.setRoleDept(request.getRoleDept());
        issuance.setContact(request.getContact());
        issuance.setRemarks(request.getRemarks());
        return toDto(issuanceRepository.save(issuance));
    }

    @Transactional
    public void deleteIssuance(Long id) {
        Issuance issuance = findIssuance(id);
        if ("ISSUED".equals(effectiveStatus(issuance)) || "OVERDUE".equals(effectiveStatus(issuance))) {
            throw conflict("An active issuance cannot be deleted; return it first.");
        }
        issuanceRepository.delete(issuance);
    }

    private Issuance findIssuance(Long id) {
        return issuanceRepository.findById(id)
                .orElseThrow(() -> notFound("Issuance not found with ID: " + id));
    }

    private void validateCreateRequest(IssuanceRequest request) {
        if (request == null || request.getBorrowRequestId() == null) {
            throw badRequest("Borrow request ID is required.");
        }
        if (request.getIssuanceId() == null || request.getIssuanceId().isBlank()) {
            throw badRequest("Issuance ID is required.");
        }
        if (request.getConditionAtIssue() == null || request.getConditionAtIssue().isBlank()) {
            throw badRequest("Condition at issue is required.");
        }
        if (request.getQtyIssued() == null || request.getQtyIssued() <= 0) {
            throw badRequest("Quantity must be positive.");
        }
        validateDates(request.getIssueDate(), request.getReturnDueDate());
    }

    private void validateDates(LocalDate issueDate, LocalDate dueDate) {
        if (issueDate == null || dueDate == null) {
            throw badRequest("Issue date and return due date are required.");
        }
        if (dueDate.isBefore(issueDate)) {
            throw badRequest("Return due date must not be before issue date.");
        }
    }

    private String effectiveStatus(Issuance issuance) {
        if ("RETURNED".equalsIgnoreCase(issuance.getStatus())) {
            return "RETURNED";
        }
        if (issuance.getReturnDate() == null
                && issuance.getReturnDueDate() != null
                && issuance.getReturnDueDate().isBefore(LocalDate.now())) {
            return "OVERDUE";
        }
        return normalizeStatus(issuance.getStatus());
    }

    private String normalizeStatus(String status) {
        return status == null ? "" : status.trim().toUpperCase();
    }

    private IssuanceDTO toDto(Issuance issuance) {
        IssuanceDTO dto = new IssuanceDTO();
        dto.setId(issuance.getId());
        dto.setBorrowRequestId(issuance.getBorrowRequest() == null ? null : issuance.getBorrowRequest().getId());
        dto.setIssuanceId(issuance.getIssuanceId());
        dto.setIssueDate(issuance.getIssueDate());
        dto.setReturnDueDate(issuance.getReturnDueDate());
        dto.setStatus(effectiveStatus(issuance));
        dto.setEquipmentId(issuance.getEquipment().getId());
        dto.setEquipmentName(issuance.getEquipment().getEquipmentName());
        dto.setQtyIssued(issuance.getQtyIssued());
        dto.setConditionAtIssue(issuance.getConditionAtIssue());
        dto.setUserId(issuance.getUser().getId());
        dto.setUserName(issuance.getUser().getUsername());
        dto.setUserEmail(issuance.getUser().getEmail());
        dto.setRoleDept(issuance.getRoleDept());
        dto.setContact(issuance.getContact());
        dto.setReturnDate(issuance.getReturnDate());
        dto.setConditionOnReturn(issuance.getConditionOnReturn());
        dto.setRemarks(issuance.getRemarks());
        return dto;
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }
}
