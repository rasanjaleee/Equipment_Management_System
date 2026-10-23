package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.dto.ResetConfirmationRequest;
import com.equipment.Management.System.demo.model.*;
import com.equipment.Management.System.demo.repository.*;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class AdminDataManagementService {

    private static final Logger logger = LoggerFactory.getLogger(AdminDataManagementService.class);
    public static final String REQUIRED_CONFIRMATION_PHRASE = "RESET-EQUIPMENT-DATA";

    private final EquipmentRepository equipmentRepository;
    private final IssuanceRepository issuanceRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ActivityLogService activityLogService;

    public AdminDataManagementService(EquipmentRepository equipmentRepository,
                                      IssuanceRepository issuanceRepository,
                                      MaintenanceRepository maintenanceRepository,
                                      LaboratoryRepository laboratoryRepository,
                                      BorrowRequestRepository borrowRequestRepository,
                                      NotificationRepository notificationRepository,
                                      UserRepository userRepository,
                                      ActivityLogRepository activityLogRepository,
                                      ActivityLogService activityLogService) {
        this.equipmentRepository = equipmentRepository;
        this.issuanceRepository = issuanceRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.laboratoryRepository = laboratoryRepository;
        this.borrowRequestRepository = borrowRequestRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.activityLogService = activityLogService;
    }

    /**
     * Export all supported application entities into a ZIP containing individual CSV files.
     * Sensitive fields such as passwords and hashes are strictly excluded.
     */
    @Transactional(readOnly = true)
    public byte[] exportAllDataAsZip() throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (ZipOutputStream zos = new ZipOutputStream(baos, StandardCharsets.UTF_8)) {
            // 1. Equipment CSV
            addZipEntry(zos, "equipment.csv", generateEquipmentCsv());

            // 2. Issuances CSV
            addZipEntry(zos, "issuances.csv", generateIssuancesCsv());

            // 3. Maintenance CSV
            addZipEntry(zos, "maintenance.csv", generateMaintenanceCsv());

            // 4. Laboratories CSV
            addZipEntry(zos, "laboratories.csv", generateLaboratoriesCsv());

            // 5. Borrow Requests CSV
            addZipEntry(zos, "borrow_requests.csv", generateBorrowRequestsCsv());

            // 6. Users CSV (PASSWORDS EXCLUDED)
            addZipEntry(zos, "users_safe.csv", generateSafeUsersCsv());

            // 7. Activity Logs CSV
            addZipEntry(zos, "activity_logs.csv", generateActivityLogsCsv());
        }

        return baos.toByteArray();
    }

    private void addZipEntry(ZipOutputStream zos, String fileName, byte[] data) throws Exception {
        ZipEntry entry = new ZipEntry(fileName);
        zos.putNextEntry(entry);
        zos.write(data);
        zos.closeEntry();
    }

    public byte[] generateEquipmentCsv() throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVPrinter printer = new CSVPrinter(new OutputStreamWriter(out, StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.builder().setHeader(
                        "ID", "EquipmentCode", "EquipmentName", "Laboratory", "Model",
                        "SerialNumber", "Cost", "PurchaseDate", "Supplier", "Status", "GRNNumber"
                ).build())) {

            for (Equipment e : equipmentRepository.findAll()) {
                printer.printRecord(
                        e.getId(),
                        e.getEquipmentCode(),
                        e.getEquipmentName(),
                        e.getLaboratory(),
                        e.getModel(),
                        e.getSerialNumber(),
                        e.getCost(),
                        e.getPurchaseDate(),
                        e.getSupplier(),
                        e.getStatus() != null ? e.getStatus().name() : "",
                        e.getGrnNumber()
                );
            }
        }
        return out.toByteArray();
    }

    public byte[] generateIssuancesCsv() throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVPrinter printer = new CSVPrinter(new OutputStreamWriter(out, StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.builder().setHeader(
                        "ID", "IssuanceID", "EquipmentID", "EquipmentName", "Username",
                        "IssueDate", "ReturnDueDate", "ReturnDate", "Status", "QtyIssued", "ConditionAtIssue"
                ).build())) {

            for (Issuance i : issuanceRepository.findAll()) {
                printer.printRecord(
                        i.getId(),
                        i.getIssuanceId(),
                        i.getEquipment() != null ? i.getEquipment().getId() : "",
                        i.getEquipment() != null ? i.getEquipment().getEquipmentName() : "",
                        i.getUser() != null ? i.getUser().getUsername() : "",
                        i.getIssueDate(),
                        i.getReturnDueDate(),
                        i.getReturnDate(),
                        i.getStatus(),
                        i.getQtyIssued(),
                        i.getConditionAtIssue()
                );
            }
        }
        return out.toByteArray();
    }

    public byte[] generateMaintenanceCsv() throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVPrinter printer = new CSVPrinter(new OutputStreamWriter(out, StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.builder().setHeader(
                        "ID", "EquipmentID", "EquipmentName", "IssueDescription", "Status",
                        "Priority", "ReportedDate", "DueDate", "CompletedDate", "Cost", "RepairNote"
                ).build())) {

            for (Maintenance m : maintenanceRepository.findAll()) {
                printer.printRecord(
                        m.getId(),
                        m.getEquipment() != null ? m.getEquipment().getId() : "",
                        m.getEquipment() != null ? m.getEquipment().getEquipmentName() : "",
                        m.getIssueDescription(),
                        m.getStatus(),
                        m.getPriority(),
                        m.getReportedDate(),
                        m.getDueDate(),
                        m.getCompletedDate(),
                        m.getCost(),
                        m.getRepairNote()
                );
            }
        }
        return out.toByteArray();
    }

    public byte[] generateLaboratoriesCsv() throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVPrinter printer = new CSVPrinter(new OutputStreamWriter(out, StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.builder().setHeader(
                        "ID", "Name", "Department", "Location", "InCharge", "TotalEquipment", "WorkingEquipment"
                ).build())) {

            for (Laboratory l : laboratoryRepository.findAll()) {
                printer.printRecord(
                        l.getId(),
                        l.getName(),
                        l.getDepartment(),
                        l.getLocation(),
                        l.getInCharge(),
                        l.getTotalEquipment(),
                        l.getWorkingEquipment()
                );
            }
        }
        return out.toByteArray();
    }

    public byte[] generateBorrowRequestsCsv() throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVPrinter printer = new CSVPrinter(new OutputStreamWriter(out, StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.builder().setHeader(
                        "ID", "EquipmentID", "ApplicantName", "Email", "Department",
                        "BorrowStartDate", "BorrowEndDate", "Purpose", "Status"
                ).build())) {

            for (BorrowRequest b : borrowRequestRepository.findAll()) {
                printer.printRecord(
                        b.getId(),
                        b.getEquipment() != null ? b.getEquipment().getId() : "",
                        b.getApplicantName(),
                        b.getEmail(),
                        b.getDepartment(),
                        b.getBorrowStartDate(),
                        b.getBorrowEndDate(),
                        b.getPurpose(),
                        b.getStatus()
                );
            }
        }
        return out.toByteArray();
    }

    /**
     * Strictly excludes password and password hashes.
     */
    public byte[] generateSafeUsersCsv() throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVPrinter printer = new CSVPrinter(new OutputStreamWriter(out, StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.builder().setHeader(
                        "ID", "Username", "Email", "Role", "MustChangePassword", "LastLogin"
                ).build())) {

            for (User u : userRepository.findAll()) {
                printer.printRecord(
                        u.getId(),
                        u.getUsername(),
                        u.getEmail(),
                        u.getRole(),
                        u.isMustChangePassword(),
                        u.getLastLogin()
                );
            }
        }
        return out.toByteArray();
    }

    public byte[] generateActivityLogsCsv() throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVPrinter printer = new CSVPrinter(new OutputStreamWriter(out, StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.builder().setHeader(
                        "ID", "Username", "Role", "Action", "EquipmentID", "Details", "Timestamp"
                ).build())) {

            for (ActivityLog a : activityLogRepository.findAll()) {
                printer.printRecord(
                        a.getId(),
                        a.getUsername(),
                        a.getRole(),
                        a.getAction(),
                        a.getEquipmentId(),
                        a.getDetails(),
                        a.getTimestamp()
                );
            }
        }
        return out.toByteArray();
    }

    /**
     * High-risk system reset.
     * Strictly restricted to SUPER_ADMIN role with exact confirmation phrase match.
     * Preserves:
     * - Admin and Super Admin users
     * - System settings configuration
     * - Admin profile
     * Resets transactionally:
     * - Borrow requests, issuances & accessories, maintenances, equipment & accessories, notifications.
     */
    @Transactional
    public Map<String, Object> executeProtectedReset(String username, String role, ResetConfirmationRequest request) {
        if (!"ROLE_SUPER_ADMIN".equalsIgnoreCase(role) && !"SUPER_ADMIN".equalsIgnoreCase(role)) {
            throw new AccessDeniedException("Only SUPER_ADMIN users are authorized to execute system data reset.");
        }

        if (request == null || !REQUIRED_CONFIRMATION_PHRASE.equals(request.getConfirmationPhrase())) {
            throw new IllegalArgumentException("Invalid confirmation phrase. You must enter '" + REQUIRED_CONFIRMATION_PHRASE + "' exactly.");
        }

        logger.warn("HIGH-RISK ACTION: System reset initiated by user '{}' with role '{}'", username, role);

        long borrowRequestsCount = borrowRequestRepository.count();
        borrowRequestRepository.deleteAllInBatch();


        long issuancesCount = issuanceRepository.count();
        issuanceRepository.deleteAllInBatch();

        long maintenanceCount = maintenanceRepository.count();
        maintenanceRepository.deleteAllInBatch();


        long equipmentCount = equipmentRepository.count();
        equipmentRepository.deleteAllInBatch();

        long notificationsCount = notificationRepository.count();
        notificationRepository.deleteAllInBatch();

        // Audit log the reset event
        activityLogService.logActivity(
                username,
                role,
                "SYSTEM_DATA_RESET",
                null,
                String.format("Protected data reset executed. Deleted: %d equipment, %d issuances, %d maintenance, %d borrow requests, %d notifications. System settings and admin accounts preserved.",
                        equipmentCount, issuancesCount, maintenanceCount, borrowRequestsCount, notificationsCount)
        );

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("success", true);
        summary.put("message", "System operational data reset successfully. Administrators and system settings preserved.");
        summary.put("resetTimestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        summary.put("deletedRecords", Map.of(
                "equipment", equipmentCount,
                "issuances", issuancesCount,
                "maintenance", maintenanceCount,
                "borrowRequests", borrowRequestsCount,
                "notifications", notificationsCount
        ));

        return summary;
    }
}
