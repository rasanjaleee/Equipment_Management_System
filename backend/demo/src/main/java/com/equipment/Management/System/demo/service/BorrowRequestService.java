package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.dto.BorrowRequestCreateRequest;
import com.equipment.Management.System.demo.dto.BorrowRequestResponse;
import com.equipment.Management.System.demo.model.BorrowRequest;
import com.equipment.Management.System.demo.model.BorrowRequestNotification;
import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.repository.BorrowRequestRepository;
import com.equipment.Management.System.demo.repository.BorrowRequestNotificationRepository;
import com.equipment.Management.System.demo.repository.EquipmentRepository;
import com.equipment.Management.System.demo.repository.IssuanceRepository;
import com.equipment.Management.System.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BorrowRequestService {

    private static final List<String> BLOCKING_STATUSES = List.of("PENDING", "APPROVED");

    private final BorrowRequestRepository borrowRequestRepository;
    private final EquipmentRepository equipmentRepository;
    private final BorrowRequestNotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final IssuanceRepository issuanceRepository;
    private final NotificationService notificationService;

    public BorrowRequestService(BorrowRequestRepository borrowRequestRepository,
                                EquipmentRepository equipmentRepository,
                                BorrowRequestNotificationRepository notificationRepository,
                                UserRepository userRepository,
                                IssuanceRepository issuanceRepository) {
        this(borrowRequestRepository, equipmentRepository, notificationRepository, userRepository, issuanceRepository, null);
    }

    @Autowired
    public BorrowRequestService(BorrowRequestRepository borrowRequestRepository,
                                EquipmentRepository equipmentRepository,
                                BorrowRequestNotificationRepository notificationRepository,
                                UserRepository userRepository,
                                IssuanceRepository issuanceRepository,
                                @Autowired(required = false) NotificationService notificationService) {
        this.borrowRequestRepository = borrowRequestRepository;
        this.equipmentRepository = equipmentRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.issuanceRepository = issuanceRepository;
        this.notificationService = notificationService;
    }

    public List<BorrowRequestResponse> getAllBorrowRequests() {
        return borrowRequestRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<BorrowRequestResponse> getMyBorrowRequests(String username) {
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user is required.");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User email is not available.");
        }
        return borrowRequestRepository.findByEmailIgnoreCaseOrderByCreatedAtDesc(user.getEmail())
                .stream().map(this::toResponse).toList();
    }

    public List<Map<String, Object>> getEquipmentCalendar(
            Long equipmentId, LocalDate startDate, LocalDate endDate) {
        if (equipmentId == null || startDate == null || endDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Equipment ID, start date and end date are required.");
        }
        if (endDate.isBefore(startDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Calendar end date must not be before start date.");
        }
        if (!equipmentRepository.existsById(equipmentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found.");
        }
        return borrowRequestRepository.findBlockingRequestsForCalendar(
                        equipmentId, startDate, endDate, BLOCKING_STATUSES)
                .stream()
                .map(request -> {
                    Map<String, Object> period = new HashMap<>();
                    period.put("startDate", request.getBorrowStartDate());
                    period.put("endDate", request.getBorrowEndDate());
                    return period;
                })
                .toList();
    }

    public List<BorrowRequestResponse> getCalendarBorrowRequests(
            LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null || endDate.isBefore(startDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Valid calendar start and end dates are required.");
        }
        return borrowRequestRepository.findCalendarRequests(startDate, endDate)
                .stream().map(this::toResponse).toList();
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

        User requester = resolveRequester(request, username);

        BorrowRequest entity = new BorrowRequest();
        entity.setEquipment(equipment);
        entity.setRequester(requester);
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

        if (notificationService != null) {
            notifyAdminsOfNewRequest(saved);
        }

        return toResponse(saved);
    }

    public BorrowRequestResponse createBorrowRequest(BorrowRequestCreateRequest request) {
        return createBorrowRequest(request, null);
    }

    private User resolveRequester(BorrowRequestCreateRequest request, String username) {
        if (username != null && !username.isBlank()) {
            return userRepository.findByUsername(username).orElse(null);
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            return userRepository.findByEmailIgnoreCase(request.getEmail().trim()).orElse(null);
        }
        return null;
    }


    @Transactional
    public BorrowRequestResponse updateStatus(Long id, String status) {

        // Lock the request while processing the decision.
        BorrowRequest entity = borrowRequestRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Borrow request not found."
                ));

        String normalizedStatus = normalizeStatus(status);
        String currentStatus = normalizeStatus(entity.getStatus());

        // Handle repeated approval/rejection requests.
        if (currentStatus.equals(normalizedStatus)) {
            if (isDecision(normalizedStatus)) {
                ensureDecisionNotification(entity, normalizedStatus);
                notifyApplicantOfDecision(entity, normalizedStatus);
            }
            return toResponse(entity);
        }

        // Only PENDING requests can be approved or rejected.
        if (!"PENDING".equals(currentStatus)
                || "PENDING".equals(normalizedStatus)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A decided borrow request cannot be changed."
            );
        }

        // Check availability before approving.
        if ("APPROVED".equals(normalizedStatus)) {

            boolean available = isAvailableForApproval(
                    entity.getEquipment().getId(),
                    entity.getBorrowStartDate(),
                    entity.getBorrowEndDate(),
                    entity.getId()
            );

            if (!available) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Equipment is no longer available for the selected dates."
                );
            }
        }

        // Update request status.
        entity.setStatus(normalizedStatus);

        BorrowRequest saved = borrowRequestRepository.save(entity);

        // Generate decision notification.
        ensureDecisionNotification(saved, normalizedStatus);

        // Notify the applicant.
        notifyApplicantOfDecision(saved, normalizedStatus);

        return toResponse(saved);
    }


    public BorrowRequestResponse updateStatus(Long id, Map<String, String> statusUpdate, String currentUsername) {
        String status = (statusUpdate != null) ? statusUpdate.get("status") : null;
        return updateStatus(id, status);
    }

    @Transactional(readOnly = true)
    public boolean isEquipmentAvailable(Long equipmentId, LocalDate startDate, LocalDate endDate) {
        validateAvailabilityInputs(equipmentId, startDate, endDate);
        return isAvailable(equipmentId, startDate, endDate);
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
                    .orElse(null));
            if (request.getRequester() != null) {
                borrowRequestRepository.save(request);
            }
        }

        if (request.getRequester() != null) {
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
    }

    private void notifyApplicantOfDecision(BorrowRequest request, String decision) {
        if (notificationService == null) return;
        Long recipientId = request.getRequester() != null ? request.getRequester().getId() : null;
        if (recipientId == null && request.getEmail() != null) {
            recipientId = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                    .map(User::getId).orElse(null);
        }
        if (recipientId == null) return;

        boolean approved = "APPROVED".equals(decision);
        String title = approved ? "Borrow Request Approved" : "Borrow Request Rejected";
        String message = "Your request to borrow "
                + request.getEquipment().getEquipmentName()
                + " (Request #" + request.getId() + ") has been "
                + (approved ? "approved." : "rejected.");

        notificationService.createNotificationForUser(
                recipientId,
                title,
                message,
                "BORROW_REQUEST",
                request.getId(),
                "BorrowRequest",
                approved ? "HIGH" : "NORMAL"
        );
    }

    private void notifyAdminsOfNewRequest(BorrowRequest request) {
        if (notificationService == null) return;
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null &&
                        (u.getRole().equalsIgnoreCase("ADMIN")
                                || u.getRole().equalsIgnoreCase("SUPER_ADMIN")
                                || u.getRole().equalsIgnoreCase("TECHNICIAN")))
                .toList();

        for (User admin : admins) {
            notificationService.createNotificationForUser(
                    admin.getId(),
                    "New Borrow Request",
                    "New borrow request #" + request.getId() + " for " + request.getEquipment().getEquipmentName() + " from " + request.getApplicantName(),
                    "BORROW_REQUEST",
                    request.getId(),
                    "BorrowRequest",
                    "NORMAL"
            );
        }
    }


    private boolean isAvailableForApproval(
            Long equipmentId,
            LocalDate startDate,
            LocalDate endDate,
            Long currentRequestId) {

        // Exclude the current request from the overlap check.
        List<BorrowRequest> conflicts =
                borrowRequestRepository.findOverlappingBlockingRequestsExcept(
                        currentRequestId,
                        equipmentId,
                        startDate,
                        endDate,
                        BLOCKING_STATUSES
                );

        // Another pending or approved request overlaps.
        if (!conflicts.isEmpty()) {
            return false;
        }

        // Check whether equipment is already issued.
        return issuanceRepository.findOverlappingActiveIssuances(
                equipmentId,
                startDate,
                endDate,
                List.of("ISSUED", "OVERDUE")
        ).isEmpty();
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
        response.setUserId(entity.getRequester() != null ? entity.getRequester().getId() : null);
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
