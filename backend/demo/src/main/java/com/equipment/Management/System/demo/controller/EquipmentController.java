package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.model.EquipmentStatus;
import com.equipment.Management.System.demo.service.EquipmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin
public class EquipmentController {

    private final EquipmentService equipmentService;
    private static final String UPLOAD_DIR = "uploads/";

    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addEquipment(
            @RequestParam String equipmentName,
            @RequestParam String laboratory,
            @RequestParam String model,
            @RequestParam String serialNumber,
            @RequestParam Double cost,
            @RequestParam String purchaseDate,
            @RequestParam String supplier,
            @RequestParam EquipmentStatus status,
            @RequestParam String qrCode,
            @RequestParam String grnNumber,
            @RequestParam MultipartFile photo
    ) {
        try {
            // Create upload directory if not exists
            Files.createDirectories(Paths.get(UPLOAD_DIR));

            String fileName = System.currentTimeMillis() + "_" + photo.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            Files.write(filePath, photo.getBytes());

            Equipment equipment = new Equipment();
            equipment.setEquipmentName(equipmentName);
            equipment.setLaboratory(laboratory);
            equipment.setModel(model);
            equipment.setSerialNumber(serialNumber);
            equipment.setCost(cost);
            equipment.setPurchaseDate(LocalDate.parse(purchaseDate));
            equipment.setSupplier(supplier);
            equipment.setStatus(status);
            equipment.setQrCode(qrCode);
            equipment.setGrnNumber(grnNumber);
            equipment.setPhotoPath(filePath.toString());

            equipmentService.saveEquipment(equipment);
            return ResponseEntity.ok("Equipment added successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Get all equipment
    @GetMapping
    public List<Equipment> getAllEquipment() {
        return equipmentService.getAllEquipment();
    }

    // Keep the old endpoint for backwards compatibility
    @GetMapping("/all")
    public List<Equipment> getAllEquipmentAlt() {
        return equipmentService.getAllEquipment();
    }
}