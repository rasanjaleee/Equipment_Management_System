package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.dto.BulkUploadResponse;
import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.model.EquipmentStatus;
import com.equipment.Management.System.demo.service.ActivityLogService;
import com.equipment.Management.System.demo.service.EquipmentCsvService;
import com.equipment.Management.System.demo.service.EquipmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final EquipmentCsvService equipmentCsvService;
    private final ActivityLogService activityLogService;

    private static final String UPLOAD_DIR = "uploads/";

    public EquipmentController(EquipmentService equipmentService,
                               EquipmentCsvService equipmentCsvService,
                               ActivityLogService activityLogService) {
        this.equipmentService = equipmentService;
        this.equipmentCsvService = equipmentCsvService;
        this.activityLogService = activityLogService;
    }

    // ================= SINGLE ADD =================
    @PostMapping("/add")
    public ResponseEntity<?> addEquipment(
            @RequestParam String equipmentName,
            @RequestParam String laboratory,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String serialNumber,
            @RequestParam(required = false) Double cost,
            @RequestParam(required = false) String purchaseDate,
            @RequestParam(required = false) String supplier,
            @RequestParam EquipmentStatus status,
            @RequestParam(required = false) String grnNumber,
            @RequestParam MultipartFile photo
    ) {
        try {
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
            equipment.setSupplier(supplier);
            equipment.setStatus(status);
            equipment.setGrnNumber(grnNumber);
            equipment.setPhotoPath(filePath.toString());

            if (purchaseDate != null && !purchaseDate.isBlank()) {
                equipment.setPurchaseDate(LocalDate.parse(purchaseDate));
            }

            Equipment savedEquipment = equipmentService.createEquipmentWithQr(equipment);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            String role = authentication.getAuthorities().stream()
                    .findFirst()
                    .map(auth -> auth.getAuthority())
                    .orElse("ROLE_UNKNOWN");

            activityLogService.logActivity(
                    username,
                    role,
                    "CREATED_EQUIPMENT",
                    savedEquipment.getId(),
                    "Created equipment: " + savedEquipment.getEquipmentName()
            );

            return ResponseEntity.ok("Equipment added successfully");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ================= BULK CSV UPLOAD =================
    @PostMapping("/bulk-upload")
    public ResponseEntity<BulkUploadResponse> bulkUpload(
            @RequestParam("file") MultipartFile file) {

        BulkUploadResponse response = equipmentCsvService.uploadCsv(file);
        return ResponseEntity.ok(response);
    }

    // ================= UPDATE =================
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateEquipment(
            @PathVariable Long id,
            @RequestParam String equipmentName,
            @RequestParam String laboratory,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String serialNumber,
            @RequestParam(required = false) Double cost,
            @RequestParam(required = false) String purchaseDate,
            @RequestParam(required = false) String supplier,
            @RequestParam EquipmentStatus status,
            @RequestParam(required = false) String grnNumber,
            @RequestParam(required = false) MultipartFile photo
    ) {
        try {
            Equipment equipment = equipmentService.getById(id);

            String oldStatus = equipment.getStatus() != null
                    ? equipment.getStatus().name()
                    : "UNKNOWN";

            equipment.setEquipmentName(equipmentName);
            equipment.setLaboratory(laboratory);
            equipment.setModel(model);
            equipment.setSerialNumber(serialNumber);
            equipment.setCost(cost);
            equipment.setSupplier(supplier);
            equipment.setStatus(status);
            equipment.setGrnNumber(grnNumber);

            if (purchaseDate != null && !purchaseDate.isBlank()) {
                equipment.setPurchaseDate(LocalDate.parse(purchaseDate));
            }

            if (photo != null && !photo.isEmpty()) {
                Files.createDirectories(Paths.get(UPLOAD_DIR));
                String fileName = System.currentTimeMillis() + "_" + photo.getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR + fileName);
                Files.write(filePath, photo.getBytes());
                equipment.setPhotoPath(filePath.toString());
            }

            equipmentService.saveEquipment(equipment);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            String role = authentication.getAuthorities().stream()
                    .findFirst()
                    .map(auth -> auth.getAuthority())
                    .orElse("ROLE_UNKNOWN");

            activityLogService.logActivity(
                    username,
                    role,
                    "UPDATED_EQUIPMENT_STATUS",
                    equipment.getId(),
                    "Status changed from " + oldStatus + " to " + equipment.getStatus().name()
            );

            return ResponseEntity.ok("Equipment updated successfully");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ================= DELETE =================
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteEquipment(@PathVariable Long id) {
        try {
            Equipment equipment = equipmentService.getById(id);

            equipmentService.deleteEquipment(id);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            String role = authentication.getAuthorities().stream()
                    .findFirst()
                    .map(auth -> auth.getAuthority())
                    .orElse("ROLE_UNKNOWN");

            activityLogService.logActivity(
                    username,
                    role,
                    "DELETED_EQUIPMENT",
                    id,
                    "Deleted equipment: " + equipment.getEquipmentName()
            );

            return ResponseEntity.ok("Equipment deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // ================= GET ALL =================
    @GetMapping
    public List<Equipment> getAllEquipment() {
        return equipmentService.getAllEquipment();
    }

    @GetMapping("/all")
    public List<Equipment> getAllEquipmentAlt() {
        return equipmentService.getAllEquipment();
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    public ResponseEntity<?> getEquipmentById(@PathVariable Long id) {
        try {
            Equipment equipment = equipmentService.getById(id);
            return ResponseEntity.ok(equipment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Equipment not found");
        }
    }

    // ================= BULK CSV TEMPLATE =================
    @GetMapping("/bulk-template")
    public ResponseEntity<String> downloadBulkTemplate() {
        String csvTemplate = "equipmentName,laboratory,model,serialNumber,cost,purchaseDate,supplier,status,grnNumber\n";
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=equipment_template.csv")
                .header("Content-Type", "text/csv")
                .body(csvTemplate);
    }
}