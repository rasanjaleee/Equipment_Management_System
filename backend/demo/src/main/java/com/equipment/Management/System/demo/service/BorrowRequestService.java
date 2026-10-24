package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.dto.BorrowRequestCreateRequest;
import com.equipment.Management.System.demo.dto.BorrowRequestResponse;
import com.equipment.Management.System.demo.model.BorrowRequest;
import com.equipment.Management.System.demo.model.BorrowRequestNotification;
import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.repository.BorrowRequestRepository;
import com.equipment.Management.System.demo.repository.BorrowRequestNotificationRepository;
import com.equipment.Management.System.demo.repository.EquipmentRepository;
import com.equipment.Management.System.demo.repository.IssuanceRepository;
import com.equipment.Management.System.demo.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class BorrowRequestService {

    private static final List<String> BLOCKING_STATUSES = List.of("PENDING", "APPROVED");

    private final BorrowRequestRepository borrowRequestRepository;
    private final EquipmentRepository equipmentRepository;
    private final BorrowRequestNotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final IssuanceRepository issuanceRepository;

    public BorrowRequestService(BorrowRequestRepository borrowRequestRepository,
                                EquipmentRepository equipmentRepository,
                                BorrowRequestNotificationRepository notificationRepository,
                                UserRepository userRepository,
                                IssuanceRepository issuanceRepository) {
        this.borrowRequestRepository = borrowRequestRepository;
        this.equipmentRepository = equipmentRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.issuanceRepository = issuanceRepository;
    }

    public List<BorrowRequestResponse> getAllBorrowRequests() {
        return borrowRequestRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public BorrowRequestResponse createBorrowRequest(BorrowRequestCreateRequest request, String username) {
        validateRequest(request);

        if (!isEquipmentAvailable(request.getEquipmentId(), request.getBorrowStartDate(), request.getBorrowEndDate())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Equipment is not available for the selected date range.");
        }

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found."));

        BorrowRequest entity = new BorrowRequest();
        entity.setEquipment(equipment);
        entity.setRequester(userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found.")));
        entity.setApplicantName(request.getApplicantName().trim());
        entity.setRegistrationOrStaffId(request.getRegistrationOrStaffId().trim());
        entity.setDepartment(request.getDepartment().trim());
        entity.setEmail(request.getEmail().trim());
        entity.setContactNumber(request.getContactNumber().trim());
        entity.setBorrowStartDate(request.getBorrowStartDate());
        entity.setBorrowEndDate(request.getBorrowEndDate());
        entity.setPurpose(request.getPurpose().trim());
        entity.setStatus("PENDING");

        BorrowRequest saved = borrowRequestRepository.save(entity);
        return toResponse(saved);
    }

    @Transactional
    public BorrowRequestResponse updateStatus(Long id, String status) {
        String normalizedStatus = normalizeStatus(status);
        BorrowRequest current = borrowRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Borrow request not found."));

        if ("APPROVED".equals(normalizedStatus) && "PENDING".equals(normalizeStatus(current.getStatus()))) {
            equipmentRepository.findByIdForUpdate(current.getEquipment().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found."));
        }

        BorrowRequest entity = borrowRequestRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Borrow request not found."));
        String currentStatus = normalizeStatus(entity.getStatus());
        if (currentStatus.equals(normalizedStatus)) {
            if (isDecision(normalizedStatus)) {
                ensureDecisionNotification(entity, normalizedStatus);
            }
            return toResponse(entity);
        }
        if (!"PENDING".equals(currentStatus) || "PENDING".equals(normalizedStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A decided borrow request cannot be changed.");
        }

        if ("APPROVED".equals(normalizedStatus) && !isAvailableForApproval(entity)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Equipment is not available for the selected date range.");
        }

        entity.setStatus(normalizedStatus);
        BorrowRequest saved = borrowRequestRepository.save(entity);
        ensureDecisionNotification(saved, normalizedStatus);
        return toResponse(saved);
    }

    @Transactional
    public boolean isEquipmentAvailable(Long equipmentId, LocalDate startDate, LocalDate endDate) {
        validateAvailabilityInputs(equipmentId, startDate, endDate);

        equipmentRepository.findByIdForUpdate(equipmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found."));

        return isAvailable(equipmentId, startDate, endDate);
    }

    private boolean isAvailableForApproval(BorrowRequest request) {
        List<BorrowRequest> conflicts = borrowRequestRepository.findOverlappingBlockingRequestsExcept(
                request.getId(),
                request.getEquipment().getId(),
                request.getBorrowStartDate(),
                request.getBorrowEndDate(),
                BLOCKING_STATUSES
        );
        if (!conflicts.isEmpty()) {
            return false;
        }

        return issuanceRepository.findOverlappingActiveIssuances(
                request.getEquipment().getId(),
                request.getBorrowStartDate(),
                request.getBorrowEndDate(),
                List.of("ISSUED", "OVERDUE")
        ).isEmpty();
    }

    private boolean isAvailable(Long equipmentId, LocalDate startDate, LocalDate endDate) {
        List<BorrowRequest> conflicts = borrowRequestRepository.findOverlappingBlockingRequests(
                equipmentId,
                startDate,
                endDate,
                BLOCKING_STATUSES
        );

        if (!conflicts.isEmpty()) {
            return false;
        }

        return issuanceRepository.findOverlappingActiveIssuances(
                equipmentId,
                startDate,
                endDate,
                List.of("ISSUED", "OVERDUE")
        ).isEmpty();
    }

    private void validateRequest(BorrowRequestCreateRequest request) {
        if (request.getEquipmentId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Equipment is required.");
        }
        if (isBlank(request.getApplicantName()) ||
                isBlank(request.getRegistrationOrStaffId()) ||
                isBlank(request.getDepartment()) ||
                isBlank(request.getEmail()) ||
                isBlank(request.getContactNumber()) ||
                isBlank(request.getPurpose())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Required fields must not be empty.");
        }

        validateAvailabilityInputs(request.getEquipmentId(), request.getBorrowStartDate(), request.getBorrowEndDate());
    }

    private void validateAvailabilityInputs(Long equipmentId, LocalDate startDate, LocalDate endDate) {
        if (equipmentId == null || startDate == null || endDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Equipment ID, start date and end date are required.");
        }
        if (!endDate.isAfter(startDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Borrow end date must be after borrow start date.");
        }
    }

    private String normalizeStatus(String status) {
        String normalized = (status == null || status.isBlank()) ? "PENDING" : status.trim().toUpperCase();
        if (!List.of("PENDING", "APPROVED", "REJECTED").contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid borrow request status.");
        }
        return normalized;
    }

    private boolean isDecision(String status) {
        return "APPROVED".equals(status) || "REJECTED".equals(status);
    }

    private void ensureDecisionNotification(BorrowRequest request, String decision) {
        if (notificationRepository.existsByBorrowRequestIdAndDecision(request.getId(), decision)) {
            return;
        }

        if (request.getRequester() == null) {
            request.setRequester(userRepository.findByEmailIgnoreCase(request.getEmail())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Cannot notify the requester because this request is not linked to a user account."
                    )));
            borrowRequestRepository.save(request);
        }

        String message = "Your request #" + request.getId() + " for "
                + request.getEquipment().getEquipmentName() + " has been "
                + decision.toLowerCase() + ".";
        BorrowRequestNotification notification = new BorrowRequestNotification();
        notification.setRecipient(request.getRequester());
        notification.setBorrowRequest(request);
        notification.setDecision(decision);
        notification.setMessage(message);
        notification.setRead(false);
        notificationRepository.save(notification);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private BorrowRequestResponse toResponse(BorrowRequest entity) {
        BorrowRequestResponse response = new BorrowRequestResponse();
        response.setId(entity.getId());
        response.setEquipmentId(entity.getEquipment().getId());
        response.setEquipmentName(entity.getEquipment().getEquipmentName());
        response.setLaboratoryName(entity.getEquipment().getLaboratory());
        response.setModel(entity.getEquipment().getModel());
        response.setSerialNumber(entity.getEquipment().getSerialNumber());
        response.setApplicantName(entity.getApplicantName());
        response.setRegistrationOrStaffId(entity.getRegistrationOrStaffId());
        response.setDepartment(entity.getDepartment());
        response.setEmail(entity.getEmail());
        response.setContactNumber(entity.getContactNumber());
        response.setBorrowStartDate(entity.getBorrowStartDate());
        response.setBorrowEndDate(entity.getBorrowEndDate());
        response.setPurpose(entity.getPurpose());
        response.setStatus(entity.getStatus());
        response.setCreatedAt(entity.getCreatedAt());
        return response;
    }
}
