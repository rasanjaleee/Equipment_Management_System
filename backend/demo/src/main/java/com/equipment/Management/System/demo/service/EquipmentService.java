package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.model.EquipmentStatus;
import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.repository.EquipmentRepository;
import com.equipment.Management.System.demo.repository.UserRepository;
import com.google.zxing.WriterException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final NotificationService notificationService;
    private final QrCodeService qrCodeService;
    private final UserRepository userRepository;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public EquipmentService(EquipmentRepository equipmentRepository,
                            NotificationService notificationService,
                            QrCodeService qrCodeService,
                            UserRepository userRepository) {
        this.equipmentRepository = equipmentRepository;
        this.notificationService = notificationService;
        this.qrCodeService = qrCodeService;
        this.userRepository = userRepository;
    }

    private List<Long> getEquipmentManagers() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() != null &&
                        (user.getRole().equalsIgnoreCase("ADMIN")
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

        Equipment saved = equipmentRepository.save(equipment);

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

        if (!oldStatus.equals(statusEnum)) {
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

    public Equipment createEquipmentWithQr(Equipment equipment) throws IOException, WriterException {
        Equipment savedEquipment = equipmentRepository.save(equipment);

        if (savedEquipment.getEquipmentCode() == null || savedEquipment.getEquipmentCode().isBlank()) {
            savedEquipment.setEquipmentCode("EQ-" + savedEquipment.getId());
        }

        String qrTargetUrl = frontendBaseUrl + "/equipment/item/" + savedEquipment.getId();
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