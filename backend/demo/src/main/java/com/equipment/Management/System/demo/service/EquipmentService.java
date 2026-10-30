package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.model.EquipmentStatus;
import com.equipment.Management.System.demo.model.Maintenance;
import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.repository.EquipmentRepository;
import com.equipment.Management.System.demo.repository.MaintenanceRepository;
import com.equipment.Management.System.demo.repository.UserRepository;
import com.google.zxing.WriterException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final NotificationService notificationService;
    private final QrCodeService qrCodeService;
    private final UserRepository userRepository;
    private final AdminSettingService adminSettingService;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public EquipmentService(EquipmentRepository equipmentRepository,
                            MaintenanceRepository maintenanceRepository,
                            NotificationService notificationService,
                            QrCodeService qrCodeService,
                            UserRepository userRepository,
                            AdminSettingService adminSettingService) {
        this.equipmentRepository = equipmentRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.notificationService = notificationService;
        this.qrCodeService = qrCodeService;
        this.userRepository = userRepository;
        this.adminSettingService = adminSettingService;
    }

    private List<Long> getEquipmentManagers() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() != null &&
                        (user.getRole().equalsIgnoreCase("SUPER_ADMIN")
                                || user.getRole().equalsIgnoreCase("ADMIN")
                                || user.getRole().equalsIgnoreCase("TECHNICIAN")))
                .map(User::getId)
                .collect(Collectors.toList());
    }

    private void notifyEquipmentManagers(String title, String message,
                                         String type, Long relatedId,
                                         String relatedType, String priority) {
        List<Long> managerIds = getEquipmentManagers();

        for (Long userId : managerIds) {
            notificationService.createNotificationForUser(
                    userId,
                    title,
                    message,
                    type,
                    relatedId,
                    relatedType,
                    priority
            );
        }
    }

    public Equipment saveEquipment(Equipment equipment) {
        boolean isNew = (equipment.getId() == null);
        EquipmentStatus oldStatus = isNew ? null : equipmentRepository.findById(equipment.getId())
                .map(Equipment::getStatus)
                .orElse(null);

        Equipment saved = equipmentRepository.save(equipment);
        syncMaintenanceForStatusChange(saved, oldStatus, saved.getStatus());

        if (isNew) {
            notifyEquipmentManagers(
                    "New Equipment Added",
                    "Equipment added: " + saved.getEquipmentName(),
                    "EQUIPMENT",
                    saved.getId(),
                    "EQUIPMENT",
                    "LOW"
            );
        } else {
            notifyEquipmentManagers(
                    "Equipment Updated",
                    "Equipment updated: " + saved.getEquipmentName(),
                    "EQUIPMENT",
                    saved.getId(),
                    "EQUIPMENT",
                    "LOW"
            );
        }

        return saved;
    }

    public Equipment updateStatus(Long id, String newStatus) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found with id: " + id));

        EquipmentStatus oldStatus = equipment.getStatus();
        EquipmentStatus statusEnum;

        try {
            statusEnum = EquipmentStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + newStatus);
        }

        equipment.setStatus(statusEnum);

        Equipment updated = equipmentRepository.save(equipment);
        syncMaintenanceForStatusChange(updated, oldStatus, statusEnum);

        if (!Objects.equals(oldStatus, statusEnum)) {
            if (statusEnum == EquipmentStatus.BROKEN && !adminSettingService.isAlertBrokenEquipment()) {
                // Broken alerts disabled in settings
                return updated;
            }

            String priority = "LOW";

            if (statusEnum == EquipmentStatus.BROKEN
                    || statusEnum == EquipmentStatus.UNDER_REPAIR) {
                priority = "HIGH";
            }

            notifyEquipmentManagers(
                    "Equipment Status Changed",
                    "Status changed from " + oldStatus + " to " + statusEnum +
                            " for " + updated.getEquipmentName(),
                    "STATUS_CHANGE",
                    updated.getId(),
                    "EQUIPMENT",
                    priority
            );
        }

        return updated;
    }

    private void syncMaintenanceForStatusChange(
            Equipment equipment,
            EquipmentStatus oldStatus,
            EquipmentStatus newStatus
    ) {
        if (equipment == null || newStatus == null || newStatus == oldStatus) {
            return;
        }

        List<String> activeStatuses = Arrays.asList(
                "PENDING", "IN_PROGRESS", "BROKEN", "UNDER_REPAIR"
        );
        Maintenance activeMaintenance = maintenanceRepository
                .findLatestActiveByEquipmentId(equipment.getId(), activeStatuses)
                .orElse(null);

        if (newStatus == EquipmentStatus.WORKING) {
            if (activeMaintenance != null) {
                activeMaintenance.setStatus("COMPLETED");
                activeMaintenance.setCompletedDate(LocalDate.now());
                maintenanceRepository.save(activeMaintenance);
            }
            return;
        }

        if (newStatus != EquipmentStatus.BROKEN && newStatus != EquipmentStatus.UNDER_REPAIR) {
            return;
        }

        if (activeMaintenance != null) {
            String expectedStatus = newStatus == EquipmentStatus.BROKEN ? "PENDING" : "IN_PROGRESS";
            if (!expectedStatus.equals(activeMaintenance.getStatus())) {
                activeMaintenance.setStatus(expectedStatus);
                maintenanceRepository.save(activeMaintenance);
            }
        }
    }

    public Equipment createEquipmentWithQr(Equipment equipment) throws IOException, WriterException {
        Equipment savedEquipment = equipmentRepository.save(equipment);

        if (savedEquipment.getEquipmentCode() == null || savedEquipment.getEquipmentCode().isBlank()) {
            savedEquipment.setEquipmentCode("EQ-" + savedEquipment.getId());
        }

        String baseUrl = (frontendBaseUrl != null) ? frontendBaseUrl.trim() : "";
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }

        String qrTargetUrl = baseUrl + "/equipment/item/" + savedEquipment.getId();
        String qrImagePath = qrCodeService.generateQrCodeImage(qrTargetUrl, savedEquipment.getId());

        savedEquipment.setQrCode(qrImagePath);

        Equipment finalSaved = equipmentRepository.save(savedEquipment);

        notifyEquipmentManagers(
                "New Equipment Added",
                "Equipment added: " + finalSaved.getEquipmentName(),
                "EQUIPMENT",
                finalSaved.getId(),
                "EQUIPMENT",
                "LOW"
        );

        return finalSaved;
    }

    public Map<String, Object> regenerateAllQrCodes() {
        List<Equipment> all = equipmentRepository.findAll();
        int updatedCount = 0;
        int errorCount = 0;

        String baseUrl = (frontendBaseUrl != null) ? frontendBaseUrl.trim() : "";
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }

        for (Equipment eq : all) {
            try {
                if (eq.getEquipmentCode() == null || eq.getEquipmentCode().isBlank()) {
                    eq.setEquipmentCode("EQ-" + eq.getId());
                }

                String qrTargetUrl = baseUrl + "/equipment/item/" + eq.getId();
                String qrImagePath = qrCodeService.generateQrCodeImage(qrTargetUrl, eq.getId());

                eq.setQrCode(qrImagePath);
                equipmentRepository.save(eq);
                updatedCount++;
            } catch (Exception e) {
                errorCount++;
            }
        }

        return Map.of(
                "total", all.size(),
                "updated", updatedCount,
                "failed", errorCount
        );
    }

    public Equipment regenerateQrCode(Long id) throws IOException, WriterException {
        Equipment eq = getById(id);
        if (eq.getEquipmentCode() == null || eq.getEquipmentCode().isBlank()) {
            eq.setEquipmentCode("EQ-" + eq.getId());
        }

        String baseUrl = (frontendBaseUrl != null) ? frontendBaseUrl.trim() : "";
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }

        String qrTargetUrl = baseUrl + "/equipment/item/" + eq.getId();
        String qrImagePath = qrCodeService.generateQrCodeImage(qrTargetUrl, eq.getId());
        eq.setQrCode(qrImagePath);
        return equipmentRepository.save(eq);
    }

    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    public Equipment getById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found with id: " + id)
                );
    }

    public void deleteEquipment(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        equipmentRepository.deleteById(id);

        notifyEquipmentManagers(
                "Equipment Deleted",
                "Equipment removed: " + equipment.getEquipmentName(),
                "EQUIPMENT",
                id,
                "EQUIPMENT",
                "HIGH"
        );
    }
}
