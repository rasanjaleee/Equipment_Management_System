package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.repository.EquipmentRepository;
import com.google.zxing.WriterException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final QrCodeService qrCodeService;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public EquipmentService(EquipmentRepository equipmentRepository,
                            QrCodeService qrCodeService) {
        this.equipmentRepository = equipmentRepository;
        this.qrCodeService = qrCodeService;
    }

    // ================= SAVE / UPDATE =================
    public Equipment saveEquipment(Equipment equipment) {
        return equipmentRepository.save(equipment);
    }

    // ================= CREATE WITH AUTO QR =================
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

    // ================= GET ALL =================
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    // ================= GET BY ID =================
    public Equipment getById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found with id: " + id)
                );
    }

    // ================= DELETE =================
    public void deleteEquipment(Long id) {
        equipmentRepository.deleteById(id);
    }
}