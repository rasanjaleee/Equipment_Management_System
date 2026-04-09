package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.dto.BulkUploadResponse;
import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.model.EquipmentStatus;
import com.equipment.Management.System.demo.repository.EquipmentRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.Set;

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
            response.getErrors().add("Uploaded file is empty.");
            return response;
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.toLowerCase().endsWith(".csv")) {
            response.getErrors().add("Please upload a valid CSV file.");
            return response;
        }

        int total = 0;
        int success = 0;
        int failed = 0;

        // To detect duplicates inside the same uploaded CSV
        Set<String> uploadedSerialNumbers = new HashSet<>();

        try (
                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)
                );
                CSVParser csvParser = new CSVParser(
                        reader,
                        CSVFormat.DEFAULT
                                .builder()
                                .setHeader()
                                .setSkipHeaderRecord(true)
                                .setIgnoreHeaderCase(true)
                                .setTrim(true)
                                .build()
                )
        ) {
            validateRequiredHeaders(csvParser);

            for (CSVRecord record : csvParser) {
                total++;
                long actualRowNumber = record.getRecordNumber() + 1; // +1 because header is row 1

                try {
                    String equipmentName = getValue(record, "equipmentName");
                    String laboratory = getValue(record, "laboratory");
                    String model = getValue(record, "model");
                    String serialNumber = getValue(record, "serialNumber");
                    String costStr = getValue(record, "cost");
                    String purchaseDateStr = getValue(record, "purchaseDate");
                    String supplier = getValue(record, "supplier");
                    String statusStr = getValue(record, "status");
                    String grnNumber = getValue(record, "grnNumber");

                    // Required fields
                    validateRequired(equipmentName, "equipmentName");
                    validateRequired(laboratory, "laboratory");
                    validateRequired(serialNumber, "serialNumber");
                    validateRequired(statusStr, "status");

                    // Duplicate serial checks
                    if (equipmentRepository.existsBySerialNumber(serialNumber)) {
                        throw new RuntimeException("serialNumber already exists in database: " + serialNumber);
                    }

                    if (uploadedSerialNumbers.contains(serialNumber.toLowerCase())) {
                        throw new RuntimeException("duplicate serialNumber inside uploaded file: " + serialNumber);
                    }
                    uploadedSerialNumbers.add(serialNumber.toLowerCase());

                    Equipment equipment = new Equipment();
                    equipment.setEquipmentName(equipmentName);
                    equipment.setLaboratory(laboratory);
                    equipment.setModel(emptyToNull(model));
                    equipment.setSerialNumber(serialNumber);
                    equipment.setSupplier(emptyToNull(supplier));
                    equipment.setGrnNumber(emptyToNull(grnNumber));
                    equipment.setStatus(parseStatus(statusStr));
                    equipment.setPhotoPath("uploads/default.png"); // default image for bulk upload

                    if (costStr != null && !costStr.isBlank()) {
                        double cost = Double.parseDouble(costStr);
                        if (cost < 0) {
                            throw new RuntimeException("cost cannot be negative");
                        }
                        equipment.setCost(cost);
                    }

                    if (purchaseDateStr != null && !purchaseDateStr.isBlank()) {
                        equipment.setPurchaseDate(parseDate(purchaseDateStr));
                    }

                    // equipmentCode and qrCode will be generated automatically
                    equipmentService.createEquipmentWithQr(equipment);
                    success++;

                } catch (Exception e) {
                    failed++;
                    response.getErrors().add("Row " + actualRowNumber + ": " + e.getMessage());
                }
            }

            response.setTotalRows(total);
            response.setSuccessCount(success);
            response.setFailedCount(failed);

        } catch (Exception e) {
            response.getErrors().add("Failed to process CSV file: " + e.getMessage());
        }

        return response;
    }

    // ================= HELPER METHODS =================

    private void validateRequiredHeaders(CSVParser csvParser) {
        Set<String> headers = csvParser.getHeaderMap().keySet();

        String[] requiredHeaders = {
                "equipmentName",
                "laboratory",
                "serialNumber",
                "status"
        };

        for (String header : requiredHeaders) {
            boolean found = headers.stream()
                    .anyMatch(h -> h.equalsIgnoreCase(header));

            if (!found) {
                throw new RuntimeException("Missing required column: " + header);
            }
        }
    }

    private String getValue(CSVRecord record, String columnName) {
        try {
            return record.get(columnName) != null ? record.get(columnName).trim() : null;
        } catch (IllegalArgumentException e) {
            return null; // optional column missing
        }
    }

    private void validateRequired(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new RuntimeException(fieldName + " is required");
        }
    }

    private String emptyToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    private EquipmentStatus parseStatus(String statusStr) {
        try {
            return EquipmentStatus.valueOf(statusStr.trim().toUpperCase());
        } catch (Exception e) {
            throw new RuntimeException(
                    "invalid status: " + statusStr + ". Allowed values: WORKING, UNDER_REPAIR, BROKEN"
            );
        }
    }

    private LocalDate parseDate(String dateStr) {
        String value = dateStr.trim();

        // 1) yyyy-MM-dd
        try {
            return LocalDate.parse(value);
        } catch (Exception ignored) {
        }

        // 2) M/d/yyyy or MM/dd/yyyy (common Excel CSV output)
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("M/d/yyyy");
            return LocalDate.parse(value, formatter);
        } catch (Exception ignored) {
        }

        // 3) d/M/yyyy
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d/M/yyyy");
            return LocalDate.parse(value, formatter);
        } catch (Exception ignored) {
        }

        throw new RuntimeException("invalid purchaseDate format: " + value + ". Use yyyy-MM-dd");
    }
}