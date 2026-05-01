package com.equipment.Management.System.demo.service;
import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.repository.UserRepository;

import com.equipment.Management.System.demo.dto.BorrowRequestCreateRequest;
import com.equipment.Management.System.demo.dto.BorrowRequestResponse;
import com.equipment.Management.System.demo.model.BorrowRequest;
import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.repository.BorrowRequestRepository;
import com.equipment.Management.System.demo.repository.EquipmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class BorrowRequestService {

    private static final List<String> BLOCKING_STATUSES = List.of("PENDING", "APPROVED");

    private final BorrowRequestRepository borrowRequestRepository;
    private final EquipmentRepository equipmentRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public BorrowRequestService(BorrowRequestRepository borrowRequestRepository,
                                EquipmentRepository equipmentRepository,NotificationService notificationService,UserRepository userRepository) {
        this.borrowRequestRepository = borrowRequestRepository;
        this.equipmentRepository = equipmentRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    public List<BorrowRequestResponse> getAllBorrowRequests() {
        return borrowRequestRepository.findAll().stream().map(this::toResponse).toList();
    }

    public BorrowRequestResponse createBorrowRequest(BorrowRequestCreateRequest request) {
        validateRequest(request);

        if (!isEquipmentAvailable(request.getEquipmentId(), request.getBorrowStartDate(), request.getBorrowEndDate())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Equipment is not available for the selected date range.");
        }

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found."));

        BorrowRequest entity = new BorrowRequest();
        entity.setEquipment(equipment);
        entity.setApplicantName(request.getApplicantName().trim());
        entity.setRegistrationOrStaffId(request.getRegistrationOrStaffId().trim());
        entity.setDepartment(request.getDepartment().trim());
        entity.setEmail(request.getEmail().trim());
        entity.setContactNumber(request.getContactNumber().trim());
        entity.setBorrowStartDate(request.getBorrowStartDate());
        entity.setBorrowEndDate(request.getBorrowEndDate());
        entity.setPurpose(request.getPurpose().trim());
        entity.setStatus(normalizeStatus(request.getStatus()));

        BorrowRequest saved = borrowRequestRepository.save(entity);

        List<User> admins = userRepository.findByRole("ADMIN");

        for (User admin : admins) {
            notificationService.createNotificationForUser(
                    admin.getId(),
                    "New Equipment Request",
                    saved.getApplicantName() + " requested " + saved.getEquipment().getEquipmentName(),
                    "BORROW_REQUEST",
                    saved.getId(),
                    "BorrowRequest",
                    "HIGH"
            );
        }

        return toResponse(saved);
    }

    public BorrowRequestResponse updateStatus(Long id, String status) {
        BorrowRequest entity = borrowRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Borrow request not found."));

        String normalizedStatus = normalizeStatus(status);
        entity.setStatus(normalizedStatus);
        return toResponse(borrowRequestRepository.save(entity));
    }

    public boolean isEquipmentAvailable(Long equipmentId, LocalDate startDate, LocalDate endDate) {
        validateAvailabilityInputs(equipmentId, startDate, endDate);

        List<BorrowRequest> conflicts = borrowRequestRepository.findOverlappingBlockingRequests(
                equipmentId,
                startDate,
                endDate,
                BLOCKING_STATUSES
        );

        return conflicts.isEmpty();
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
