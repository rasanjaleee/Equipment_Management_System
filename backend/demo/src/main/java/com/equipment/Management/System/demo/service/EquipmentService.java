package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.model.EquipmentStatus;
import com.equipment.Management.System.demo.repository.EquipmentRepository;
import com.google.zxing.WriterException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final NotificationService notificationService;
    private final QrCodeService qrCodeService;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public EquipmentService(EquipmentRepository equipmentRepository,
                            NotificationService notificationService,
                            QrCodeService qrCodeService) {
        this.equipmentRepository = equipmentRepository;
        this.notificationService = notificationService;
        this.qrCodeService = qrCodeService;
    }

    public Equipment saveEquipment(Equipment equipment) {
        boolean isNew = (equipment.getId() == null);

        Equipment saved = equipmentRepository.save(equipment);

        if (isNew) {
            notificationService.createNotification(
                    null,
                    "New Equipment Added",
                    "Equipment added: " + saved.getEquipmentName(),
                    "EQUIPMENT",
                    saved.getId(),
                    "EQUIPMENT",
                    "LOW"
            );
        } else {
            notificationService.createNotification(
                    null,
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

            if (statusEnum == EquipmentStatus.BROKEN) {
                priority = "HIGH";
            }

            notificationService.createNotification(
                    null,
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

        return equipmentRepository.save(savedEquipment);
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

        notificationService.createNotification(
                null,
                "Equipment Deleted",
                "Equipment removed: " + equipment.getEquipmentName(),
                "EQUIPMENT",
                id,
                "EQUIPMENT",
                "HIGH"
        );
    }
}