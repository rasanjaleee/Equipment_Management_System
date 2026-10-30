
package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.dto.GrnReportDto;
import com.equipment.Management.System.demo.dto.InventoryReportDto;
import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.repository.EquipmentRepository;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final EquipmentRepository equipmentRepository;

    public ReportService(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    // ===================== GRN REPORT =====================

    public List<GrnReportDto> getGrnReport() {
        return getGrnReport(null, null, null, null);
    }

    public List<GrnReportDto> getGrnReport(
            String supplier,
            String search,
            LocalDate startDate,
            LocalDate endDate) {

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
                .filter(item ->
                        supplier == null
                                || supplier.isBlank()
                                || (item.getSupplier() != null
                                && item.getSupplier().equalsIgnoreCase(
                                supplier.trim())))
                .filter(item -> {
                    if (search == null || search.isBlank()) {
                        return true;
                    }

                    String s = search.trim().toLowerCase(Locale.ROOT);

                    boolean matchGrn =
                            item.getGrnNumber() != null
                                    && item.getGrnNumber()
                                    .toLowerCase(Locale.ROOT)
                                    .contains(s);

                    boolean matchSupplier =
                            item.getSupplier() != null
                                    && item.getSupplier()
                                    .toLowerCase(Locale.ROOT)
                                    .contains(s);

                    return matchGrn || matchSupplier;
                })
                .filter(item -> {
                    if (startDate == null && endDate == null) {
                        return true;
                    }

                    if (item.getReceivedDate() == null) {
                        return false;
                    }

                    boolean afterStart =
                            startDate == null
                                    || !item.getReceivedDate().isBefore(startDate);

                    boolean beforeEnd =
                            endDate == null
                                    || !item.getReceivedDate().isAfter(endDate);

                    return afterStart && beforeEnd;
                })
                .collect(Collectors.toList());
    }

    // ===================== INVENTORY SUMMARY =====================

    public InventoryReportDto getInventorySummary(
            List<Equipment> equipmentList) {

        long total = equipmentList.size();

        long working = equipmentList.stream()
                .filter(e -> e.getStatus() != null
                        && e.getStatus().name().equals("WORKING"))
                .count();

        long underRepair = equipmentList.stream()
                .filter(e -> e.getStatus() != null
                        && e.getStatus().name().equals("UNDER_REPAIR"))
                .count();

        long broken = equipmentList.stream()
                .filter(e -> e.getStatus() != null
                        && e.getStatus().name().equals("BROKEN"))
                .count();

        return new InventoryReportDto(
                total,
                working,
                underRepair,
                broken
        );
    }

    // ===================== FILTER INVENTORY =====================

    public List<Equipment> getFilteredInventory(
            String laboratory,
            String status) {

        return getFilteredInventory(
                laboratory, status, null, null, null);
    }

    public List<Equipment> getFilteredInventory(
            String laboratory,
            String status,
            String search,
            LocalDate startDate,
            LocalDate endDate) {

        List<Equipment> equipmentList = equipmentRepository.findAll();

        return equipmentList.stream()
                .filter(e ->
                        laboratory == null
                                || laboratory.isBlank()
                                || laboratory.equalsIgnoreCase(e.getLaboratory()))
                .filter(e ->
                        status == null
                                || status.isBlank()
                                || (e.getStatus() != null
                                && status.equalsIgnoreCase(e.getStatus().name())))
                .filter(e -> {
                    if (search == null || search.isBlank()) {
                        return true;
                    }

                    String s = search.trim().toLowerCase(Locale.ROOT);

                    boolean matchName =
                            e.getEquipmentName() != null
                                    && e.getEquipmentName()
                                    .toLowerCase(Locale.ROOT).contains(s);

                    boolean matchModel =
                            e.getModel() != null
                                    && e.getModel()
                                    .toLowerCase(Locale.ROOT).contains(s);

                    boolean matchSerial =
                            e.getSerialNumber() != null
                                    && e.getSerialNumber()
                                    .toLowerCase(Locale.ROOT).contains(s);

                    boolean matchGrn =
                            e.getGrnNumber() != null
                                    && e.getGrnNumber()
                                    .toLowerCase(Locale.ROOT).contains(s);

                    return matchName || matchModel || matchSerial || matchGrn;
                })
                .filter(e -> {
                    if (startDate == null && endDate == null) {
                        return true;
                    }

                    if (e.getPurchaseDate() == null) {
                        return false;
                    }

                    boolean afterStart =
                            startDate == null
                                    || !e.getPurchaseDate().isBefore(startDate);

                    boolean beforeEnd =
                            endDate == null
                                    || !e.getPurchaseDate().isAfter(endDate);

                    return afterStart && beforeEnd;
                })
                .collect(Collectors.toList());
    }

    // ===================== INVENTORY CSV =====================

    public byte[] generateInventoryCsv(
            List<Equipment> inventoryList) throws Exception {

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (
                OutputStreamWriter writer = new OutputStreamWriter(
                        out, StandardCharsets.UTF_8);

                CSVPrinter csvPrinter = new CSVPrinter(
                        writer,
                        CSVFormat.DEFAULT.builder()
                                .setHeader(
                                        "ID",
                                        "Equipment Name",
                                        "Laboratory",
                                        "Model",
                                        "Serial Number",
                                        "Purchase Date",
                                        "Status",
                                        "Cost (Rs.)",
                                        "GRN Number"
                                )
                                .build())
        ) {
            for (Equipment item : inventoryList) {
                csvPrinter.printRecord(
                        item.getId(),
                        item.getEquipmentName(),
                        item.getLaboratory(),
                        item.getModel(),
                        item.getSerialNumber(),
                        item.getPurchaseDate() != null
                                ? item.getPurchaseDate().toString() : "-",
                        item.getStatus() != null
                                ? item.getStatus().name() : "-",
                        item.getCost() != null ? item.getCost() : "-",
                        item.getGrnNumber()
                );
            }

            csvPrinter.flush();
        }

        return out.toByteArray();
    }

    // ===================== INVENTORY PDF =====================

    public byte[] generateInventoryPdf(
            List<Equipment> inventoryList) throws Exception {

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        pdf.setDefaultPageSize(PageSize.A4.rotate());

        Document document = new Document(pdf);
        document.setMargins(30, 25, 35, 25);

        document.add(reportTitle("INVENTORY REPORT"));
        addReportMetadata(document, inventoryList.size());

        long working = inventoryList.stream()
                .filter(e -> e.getStatus() != null
                        && e.getStatus().name().equals("WORKING"))
                .count();

        long broken = inventoryList.stream()
                .filter(e -> e.getStatus() != null
                        && e.getStatus().name().equals("BROKEN"))
                .count();

        long underRepair = inventoryList.stream()
                .filter(e -> e.getStatus() != null
                        && e.getStatus().name().equals("UNDER_REPAIR"))
                .count();

        Table summary = new Table(
                UnitValue.createPercentArray(new float[]{1, 1, 1, 1})
        ).useAllAvailableWidth();

        summary.addCell(dataCell(
                "Total equipment: " + inventoryList.size()));
        summary.addCell(dataCell("Working: " + working));
        summary.addCell(dataCell("Broken: " + broken));
        summary.addCell(dataCell("Under repair: " + underRepair));

        document.add(summary.setMarginBottom(15));

        float[] widths = {
                0.6f, 2.0f, 1.5f, 1.3f, 1.6f,
                1.1f, 1.2f, 1.2f, 1.2f
        };

        Table table = new Table(
                UnitValue.createPercentArray(widths)
        ).useAllAvailableWidth();

        table.addHeaderCell(headerCell("ID"));
        table.addHeaderCell(headerCell("Equipment"));
        table.addHeaderCell(headerCell("Laboratory"));
        table.addHeaderCell(headerCell("Model"));
        table.addHeaderCell(headerCell("Serial Number"));
        table.addHeaderCell(headerCell("Purchase Date"));
        table.addHeaderCell(headerCell("Status"));
        table.addHeaderCell(headerCell("Cost (Rs.)"));
        table.addHeaderCell(headerCell("GRN Number"));

        for (Equipment item : inventoryList) {
            table.addCell(dataCell(display(item.getId())));
            table.addCell(dataCell(display(item.getEquipmentName())));
            table.addCell(dataCell(display(item.getLaboratory())));
            table.addCell(dataCell(display(item.getModel())));
            table.addCell(dataCell(display(item.getSerialNumber())));
            table.addCell(dataCell(formatDate(item.getPurchaseDate())));
            table.addCell(dataCell(
                    item.getStatus() == null
                            ? "-" : item.getStatus().name()));
            table.addCell(dataCell(formatMoney(item.getCost())));
            table.addCell(dataCell(display(item.getGrnNumber())));
        }

        if (inventoryList.isEmpty()) {
            document.add(
                    new Paragraph("No inventory records found.")
                            .setTextAlignment(TextAlignment.CENTER)
                            .setFontColor(ColorConstants.GRAY)
            );
        } else {
            document.add(table);
        }

        document.close();

        return out.toByteArray();
    }

    // ===================== GRN CSV =====================

    public byte[] generateGrnCsv(
            List<GrnReportDto> grnReport) throws Exception {

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (
                OutputStreamWriter writer = new OutputStreamWriter(
                        out, StandardCharsets.UTF_8);

                CSVPrinter csvPrinter = new CSVPrinter(
                        writer,
                        CSVFormat.DEFAULT.builder()
                                .setHeader(
                                        "GRN Number",
                                        "Supplier",
                                        "Date",
                                        "Item Count",
                                        "Total Cost (Rs.)"
                                )
                                .build())
        ) {
            for (GrnReportDto item : grnReport) {
                csvPrinter.printRecord(
                        item.getGrnNumber(),
                        item.getSupplier(),
                        item.getReceivedDate() != null
                                ? item.getReceivedDate().toString() : "-",
                        item.getItemCount(),
                        item.getTotalCost()
                );
            }

            csvPrinter.flush();
        }

        return out.toByteArray();
    }

    // ===================== GRN PDF =====================

    public byte[] generateGrnPdf(
            List<GrnReportDto> grnReport) throws Exception {

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        pdf.setDefaultPageSize(PageSize.A4);

        Document document = new Document(pdf);
        document.setMargins(35, 30, 40, 30);

        document.add(reportTitle("GOODS RECEIVED NOTE REPORT"));
        addReportMetadata(document, grnReport.size());

        long totalItems = grnReport.stream()
                .filter(item -> item.getItemCount() != null)
                .mapToLong(item -> item.getItemCount())
                .sum();

        double totalCost = grnReport.stream()
                .filter(item -> item.getTotalCost() != null)
                .mapToDouble(item -> item.getTotalCost())
                .sum();

        Table summary = new Table(
                UnitValue.createPercentArray(new float[]{1, 1, 1})
        ).useAllAvailableWidth();

        summary.addCell(dataCell(
                "GRN records: " + grnReport.size()));
        summary.addCell(dataCell("Total items: " + totalItems));
        summary.addCell(dataCell("Total value: " + formatMoney(totalCost)));

        document.add(summary.setMarginBottom(15));

        Table table = new Table(
                UnitValue.createPercentArray(
                        new float[]{1.5f, 2.0f, 1.4f, 1.0f, 1.6f})
        ).useAllAvailableWidth();

        table.addHeaderCell(headerCell("GRN Number"));
        table.addHeaderCell(headerCell("Supplier"));
        table.addHeaderCell(headerCell("Received Date"));
        table.addHeaderCell(headerCell("Item Count"));
        table.addHeaderCell(headerCell("Total Cost (Rs.)"));

        for (GrnReportDto item : grnReport) {
            table.addCell(dataCell(display(item.getGrnNumber())));
            table.addCell(dataCell(display(item.getSupplier())));
            table.addCell(dataCell(formatDate(item.getReceivedDate())));
            table.addCell(dataCell(display(item.getItemCount())));
            table.addCell(dataCell(formatMoney(item.getTotalCost())));
        }

        if (grnReport.isEmpty()) {
            document.add(
                    new Paragraph("No GRN records found.")
                            .setTextAlignment(TextAlignment.CENTER)
                            .setFontColor(ColorConstants.GRAY)
            );
        } else {
            document.add(table);
        }

        document.close();

        return out.toByteArray();
    }

    // ===================== PDF HELPERS =====================

    private String display(Object value) {
        return value == null || value.toString().isBlank()
                ? "-"
                : value.toString();
    }

    private String formatDate(LocalDate date) {
        return date == null ? "-" : date.toString();
    }

    private String formatMoney(Number amount) {
        return amount == null
                ? "Rs. 0.00"
                : String.format(
                Locale.US,
                "Rs. %,.2f",
                amount.doubleValue()
        );
    }

    private Paragraph reportTitle(String title) {
        return new Paragraph(title)
                .setFontSize(20)
                .setBold()
                .setFontColor(ColorConstants.DARK_GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(5);
    }

    private void addReportMetadata(
            Document document,
            int recordCount) {

        String generatedAt = LocalDateTime.now().format(
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
        );

        document.add(
                new Paragraph("Faculty Equipment Management System")
                        .setFontSize(10)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setFontColor(ColorConstants.GRAY)
                        .setMarginBottom(3)
        );

        document.add(
                new Paragraph(
                        "Generated: " + generatedAt
                                + "     |     Total records: " + recordCount
                )
                        .setFontSize(9)
                        .setTextAlignment(TextAlignment.CENTER)
                        .setMarginBottom(15)
        );
    }

    private Cell headerCell(String text) {
        return new Cell()
                .add(new Paragraph(text)
                        .setBold()
                        .setFontSize(9))
                .setBackgroundColor(ColorConstants.DARK_GRAY)
                .setFontColor(ColorConstants.WHITE)
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(6);
    }

    private Cell dataCell(String text) {
        return new Cell()
                .add(new Paragraph(text)
                        .setFontSize(8))
                .setPadding(5)
                .setBorder(new SolidBorder(
                        ColorConstants.LIGHT_GRAY, 0.5f));
    }
}
