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
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final EquipmentRepository equipmentRepository;

    public ReportService(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    public List<GrnReportDto> getGrnReport() {
        List<Object[]> rows = equipmentRepository.getGrnReportSummary();

        return rows.stream()
                .map(row -> new GrnReportDto(
                        (String) row[0],
                        (String) row[1],
                        (Long) row[2],
                        ((Number) row[3]).doubleValue()
                ))
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
        List<Equipment> equipmentList = equipmentRepository.findAll();

        return equipmentList.stream()
                .filter(e -> laboratory == null || laboratory.isBlank() || laboratory.equals(e.getLaboratory()))
                .filter(e -> status == null || status.isBlank() || (e.getStatus() != null && status.equals(e.getStatus().name())))
                .collect(Collectors.toList());
    }

    public byte[] generateInventoryCsv(List<Equipment> inventoryList) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (
                OutputStreamWriter writer = new OutputStreamWriter(out, StandardCharsets.UTF_8);
                CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT
                        .builder()
                        .setHeader("ID", "Equipment Name", "Laboratory", "Model", "Serial Number", "Status", "GRN Number")
                        .build())
        ) {
            for (Equipment item : inventoryList) {
                csvPrinter.printRecord(
                        item.getId(),
                        item.getEquipmentName(),
                        item.getLaboratory(),
                        item.getModel(),
                        item.getSerialNumber(),
                        item.getStatus(),
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
                        .setHeader("GRN Number", "Supplier", "Item Count", "Total Cost")
                        .build())
        ) {
            for (GrnReportDto item : grnReport) {
                csvPrinter.printRecord(
                        item.getGrnNumber(),
                        item.getSupplier(),
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
            document.add(new Paragraph(
                    "GRN: " + (item.getGrnNumber() != null ? item.getGrnNumber() : "-")
                            + " | Supplier: " + (item.getSupplier() != null ? item.getSupplier() : "-")
                            + " | Item Count: " + item.getItemCount()
                            + " | Total Cost: $" + item.getTotalCost()
            ));
        }

        document.close();
        return out.toByteArray();
    }
}