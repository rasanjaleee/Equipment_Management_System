package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.dto.BulkUploadResponse;
import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.model.EquipmentStatus;
import com.equipment.Management.System.demo.repository.EquipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.util.*;

@Service
public class EquipmentCsvService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentService equipmentService;

    public EquipmentCsvService(EquipmentRepository equipmentRepository,
                               EquipmentService equipmentService) {
        this.equipmentRepository = equipmentRepository;
        this.equipmentService = equipmentService;
    }

    public BulkUploadResponse uploadCsv(MultipartFile file) {

        BulkUploadResponse response = new BulkUploadResponse();

        if (file == null || file.isEmpty()) {
            response.getErrors().add("File is empty.");
            return response;
        }

        int total = 0, success = 0, failed = 0;
        Set<String> serialSet = new HashSet<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream()))) {

            String headerLine = reader.readLine();
            if (headerLine == null) {
                response.getErrors().add("Empty CSV file.");
                return response;
            }

            String[] headers = headerLine.split(",");
            Map<String, Integer> headerMap = mapHeaders(headers);

            validateRequiredHeaders(headerMap);

            String line;
            int rowNumber = 1;

            while ((line = reader.readLine()) != null) {
                rowNumber++;
                total++;

                try {
                    String[] values = line.split(",");

                    String name = getValue(values, headerMap, "equipmentName");
                    String lab = getValue(values, headerMap, "laboratory");
                    String model = getValue(values, headerMap, "model");
                    String serial = getValue(values, headerMap, "serialNumber");
                    String costStr = getValue(values, headerMap, "cost");
                    String dateStr = getValue(values, headerMap, "purchaseDate");
                    String supplier = getValue(values, headerMap, "supplier");
                    String statusStr = getValue(values, headerMap, "status");
                    String grn = getValue(values, headerMap, "grnNumber");

                    // REQUIRED VALIDATION
                    if (name == null || name.isBlank())
                        throw new RuntimeException("equipmentName is required");

                    if (lab == null || lab.isBlank())
                        throw new RuntimeException("laboratory is required");

                    if (serial == null || serial.isBlank())
                        throw new RuntimeException("serialNumber is required");

                    if (statusStr == null || statusStr.isBlank())
                        throw new RuntimeException("status is required");

                    // DUPLICATE CHECK
                    if (equipmentRepository.existsBySerialNumber(serial))
                        throw new RuntimeException("Duplicate serial in DB");

                    if (serialSet.contains(serial))
                        throw new RuntimeException("Duplicate serial in file");

                    serialSet.add(serial);

                    Equipment equipment = new Equipment();
                    equipment.setEquipmentName(name);
                    equipment.setLaboratory(lab);
                    equipment.setModel(model);
                    equipment.setSerialNumber(serial);
                    equipment.setSupplier(supplier);
                    equipment.setGrnNumber(grn);

                    if (costStr != null && !costStr.isBlank())
                        equipment.setCost(Double.parseDouble(costStr));

                    if (dateStr != null && !dateStr.isBlank())
                        if (dateStr != null && !dateStr.isBlank()) {
                            try {
                                // Try ISO format first (YYYY-MM-DD)
                                equipment.setPurchaseDate(LocalDate.parse(dateStr));
                            } catch (Exception e) {
                                // Try MM/DD/YYYY (Excel format)
                                String[] parts = dateStr.split("/");
                                if (parts.length == 3) {
                                    int month = Integer.parseInt(parts[0]);
                                    int day = Integer.parseInt(parts[1]);
                                    int year = Integer.parseInt(parts[2]);

                                    equipment.setPurchaseDate(LocalDate.of(year, month, day));
                                } else {
                                    throw new RuntimeException("Invalid date format: " + dateStr);
                                }
                            }
                        }
                    equipment.setStatus(
                            EquipmentStatus.valueOf(statusStr.toUpperCase())
                    );

                    // AUTO GENERATE
                    equipment.setQrCode("QR-" + serial);
                    equipment.setPhotoPath("uploads/default.png");

                    equipmentService.saveEquipment(equipment);
                    success++;

                } catch (Exception e) {
                    failed++;
                    response.getErrors().add(
                            "Row " + rowNumber + ": " + e.getMessage()
                    );
                }
            }

            response.setTotalRows(total);
            response.setSuccessCount(success);
            response.setFailedCount(failed);

        } catch (Exception e) {
            response.getErrors().add("Error reading CSV: " + e.getMessage());
        }

        return response;
    }

    // ================= HELPER METHODS =================

    private Map<String, Integer> mapHeaders(String[] headers) {
        Map<String, Integer> map = new HashMap<>();
        for (int i = 0; i < headers.length; i++) {
            map.put(headers[i].trim(), i);
        }
        return map;
    }

    private void validateRequiredHeaders(Map<String, Integer> map) {
        List<String> required = List.of(
                "equipmentName", "laboratory", "serialNumber", "status"
        );

        for (String key : required) {
            if (!map.containsKey(key)) {
                throw new RuntimeException("Missing column: " + key);
            }
        }
    }

    private String getValue(String[] values, Map<String, Integer> map, String key) {
        Integer index = map.get(key);
        if (index == null || index >= values.length) return null;
        return values[index].trim();
    }
}