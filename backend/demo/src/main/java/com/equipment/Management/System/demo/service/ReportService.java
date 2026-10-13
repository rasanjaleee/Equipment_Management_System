package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.dto.GrnReportDto;
import com.equipment.Management.System.demo.dto.InventoryReportDto;
import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.repository.EquipmentRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final EquipmentRepository equipmentRepository;

    public ReportService(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    public List<GrnReportDto> getGrnReport() {
        return getGrnReport(null, null, null, null);
    }

    public List<GrnReportDto> getGrnReport(String supplier, String search, LocalDate startDate, LocalDate endDate) {
        List<Object[]> rows = equipmentRepository.getGrnReportSummary();

        return rows.stream()
                .map(row -> {
                    LocalDate date = null;
                    if (row.length > 4 && row[4] != null) {
                        if (row[4] instanceof LocalDate ld) {
                            date = ld;
                        } else if (row[4] instanceof java.sql.Date sd) {
                            date = sd.toLocalDate();
                        }
                    }
                    return new GrnReportDto(
                            (String) row[0],
                            (String) row[1],
                            (Long) row[2],
                            ((Number) row[3]).doubleValue(),
                            date
                    );
                })
                .filter(item -> supplier == null || supplier.isBlank() || (item.getSupplier() != null && item.getSupplier().equalsIgnoreCase(supplier.trim())))
                .filter(item -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.trim().toLowerCase();
                    boolean matchGrn = item.getGrnNumber() != null && item.getGrnNumber().toLowerCase().contains(s);
                    boolean matchSupplier = item.getSupplier() != null && item.getSupplier().toLowerCase().contains(s);
                    return matchGrn || matchSupplier;
                })
                .filter(item -> {
                    if (startDate == null && endDate == null) return true;
                    if (item.getReceivedDate() == null) return false;
                    boolean afterStart = startDate == null || !item.getReceivedDate().isBefore(startDate);
                    boolean beforeEnd = endDate == null || !item.getReceivedDate().isAfter(endDate);
                    return afterStart && beforeEnd;
                })
                .collect(Collectors.toList());
    }

    public InventoryReportDto getInventorySummary(List<Equipment> equipmentList) {
        long total = equipmentList.size();
        long working = equipmentList.stream()
                .filter(e -> e.getStatus() != null && e.getStatus().name().equals("WORKING"))
                .count();
        long underRepair = equipmentList.stream()
                .filter(e -> e.getStatus() != null && e.getStatus().name().equals("UNDER_REPAIR"))
                .count();
        long broken = equipmentList.stream()
                .filter(e -> e.getStatus() != null && e.getStatus().name().equals("BROKEN"))
                .count();

        return new InventoryReportDto(total, working, underRepair, broken);
    }

    public List<Equipment> getFilteredInventory(String laboratory, String status) {
        return getFilteredInventory(laboratory, status, null, null, null);
    }

    public List<Equipment> getFilteredInventory(String laboratory, String status, String search, LocalDate startDate, LocalDate endDate) {
        List<Equipment> equipmentList = equipmentRepository.findAll();

        return equipmentList.stream()
                .filter(e -> laboratory == null || laboratory.isBlank() || laboratory.equalsIgnoreCase(e.getLaboratory()))
                .filter(e -> status == null || status.isBlank() || (e.getStatus() != null && status.equalsIgnoreCase(e.getStatus().name())))
                .filter(e -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.trim().toLowerCase();
                    boolean matchName = e.getEquipmentName() != null && e.getEquipmentName().toLowerCase().contains(s);
                    boolean matchModel = e.getModel() != null && e.getModel().toLowerCase().contains(s);
                    boolean matchSerial = e.getSerialNumber() != null && e.getSerialNumber().toLowerCase().contains(s);
                    boolean matchGrn = e.getGrnNumber() != null && e.getGrnNumber().toLowerCase().contains(s);
                    return matchName || matchModel || matchSerial || matchGrn;
                })
                .filter(e -> {
                    if (startDate == null && endDate == null) return true;
                    if (e.getPurchaseDate() == null) return false;
                    boolean afterStart = startDate == null || !e.getPurchaseDate().isBefore(startDate);
                    boolean beforeEnd = endDate == null || !e.getPurchaseDate().isAfter(endDate);
                    return afterStart && beforeEnd;
                })
                .collect(Collectors.toList());
    }

    public byte[] generateInventoryCsv(List<Equipment> inventoryList) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (
                OutputStreamWriter writer = new OutputStreamWriter(out, StandardCharsets.UTF_8);
                CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT
                        .builder()
                        .setHeader("ID", "Equipment Name", "Laboratory", "Model", "Serial Number", "Purchase Date", "Status", "Cost (Rs.)", "GRN Number")
                        .build())
        ) {
            for (Equipment item : inventoryList) {
                csvPrinter.printRecord(
                        item.getId(),
                        item.getEquipmentName(),
                        item.getLaboratory(),
                        item.getModel(),
                        item.getSerialNumber(),
                        item.getPurchaseDate() != null ? item.getPurchaseDate().toString() : "-",
                        item.getStatus(),
                        item.getCost() != null ? item.getCost() : "-",
                        item.getGrnNumber()
                );
            }
            csvPrinter.flush();
        }

        return out.toByteArray();
    }

    public byte[] generateInventoryPdf(List<Equipment> inventoryList) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        document.add(new Paragraph("Inventory Report"));
        document.add(new Paragraph(" "));

        for (Equipment item : inventoryList) {
            document.add(new Paragraph(
                    "ID: " + item.getId()
                            + " | Name: " + item.getEquipmentName()
                            + " | Lab: " + item.getLaboratory()
                            + " | Model: " + (item.getModel() != null ? item.getModel() : "-")
                            + " | Serial: " + (item.getSerialNumber() != null ? item.getSerialNumber() : "-")
                            + " | Date: " + (item.getPurchaseDate() != null ? item.getPurchaseDate().toString() : "-")
                            + " | Status: " + (item.getStatus() != null ? item.getStatus().name() : "-")
                            + " | GRN: " + (item.getGrnNumber() != null ? item.getGrnNumber() : "-")
            ));
        }

        document.close();
        return out.toByteArray();
    }

    public byte[] generateGrnCsv(List<GrnReportDto> grnReport) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (
                OutputStreamWriter writer = new OutputStreamWriter(out, StandardCharsets.UTF_8);
                CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT
                        .builder()
                        .setHeader("GRN Number", "Supplier", "Date", "Item Count", "Total Cost (Rs.)")
                        .build())
        ) {
            for (GrnReportDto item : grnReport) {
                csvPrinter.printRecord(
                        item.getGrnNumber(),
                        item.getSupplier(),
                        item.getReceivedDate() != null ? item.getReceivedDate().toString() : "-",
                        item.getItemCount(),
                        item.getTotalCost()
                );
            }
            csvPrinter.flush();
        }

        return out.toByteArray();
    }

    public byte[] generateGrnPdf(List<GrnReportDto> grnReport) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        document.add(new Paragraph("GRN Summary Report"));
        document.add(new Paragraph(" "));

        for (GrnReportDto item : grnReport) {
            String formattedCost = item.getTotalCost() != null
                    ? (item.getTotalCost() % 1 == 0
                            ? String.format("Rs. %,.0f", item.getTotalCost())
                            : String.format("Rs. %,.2f", item.getTotalCost()))
                    : "Rs. 0";

            document.add(new Paragraph(
                    "GRN: " + (item.getGrnNumber() != null ? item.getGrnNumber() : "-")
                            + " | Supplier: " + (item.getSupplier() != null ? item.getSupplier() : "-")
                            + " | Date: " + (item.getReceivedDate() != null ? item.getReceivedDate().toString() : "-")
                            + " | Item Count: " + item.getItemCount()
                            + " | Total Cost: " + formattedCost
            ));
        }

        document.close();
        return out.toByteArray();
    }
}