package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.dto.GrnReportDto;
import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(originPatterns = {"http://localhost:*", "https://*.choreoapps.dev", "https://*.choreo.org"})
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(dateStr.trim());
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping("/grn")
    public ResponseEntity<?> getGrnReport(
            @RequestParam(required = false) String supplier,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        return ResponseEntity.ok(reportService.getGrnReport(
                supplier, search, parseDate(startDate), parseDate(endDate)
        ));
    }

    @GetMapping("/inventory-summary")
    public ResponseEntity<?> getInventorySummary(
            @RequestParam(required = false) String laboratory,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        List<Equipment> filtered = reportService.getFilteredInventory(
                laboratory, status, search, parseDate(startDate), parseDate(endDate)
        );
        return ResponseEntity.ok(reportService.getInventorySummary(filtered));
    }

    @GetMapping("/inventory-list")
    public ResponseEntity<?> getInventoryList(
            @RequestParam(required = false) String laboratory,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        return ResponseEntity.ok(reportService.getFilteredInventory(
                laboratory, status, search, parseDate(startDate), parseDate(endDate)
        ));
    }

    @GetMapping("/inventory/export/csv")
    public ResponseEntity<?> exportInventoryCsv(
            @RequestParam(required = false) String laboratory,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) throws Exception {
        List<Equipment> filtered = reportService.getFilteredInventory(
                laboratory, status, search, parseDate(startDate), parseDate(endDate)
        );
        byte[] csv = reportService.generateInventoryCsv(filtered);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=inventory_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/inventory/export/pdf")
    public ResponseEntity<?> exportInventoryPdf(
            @RequestParam(required = false) String laboratory,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) throws Exception {
        List<Equipment> filtered = reportService.getFilteredInventory(
                laboratory, status, search, parseDate(startDate), parseDate(endDate)
        );
        byte[] pdf = reportService.generateInventoryPdf(filtered);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=inventory_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/grn/export/csv")
    public ResponseEntity<?> exportGrnCsv(
            @RequestParam(required = false) String supplier,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) throws Exception {
        List<GrnReportDto> grnReport = reportService.getGrnReport(
                supplier, search, parseDate(startDate), parseDate(endDate)
        );
        byte[] csv = reportService.generateGrnCsv(grnReport);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=grn_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/grn/export/pdf")
    public ResponseEntity<?> exportGrnPdf(
            @RequestParam(required = false) String supplier,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) throws Exception {
        List<GrnReportDto> grnReport = reportService.getGrnReport(
                supplier, search, parseDate(startDate), parseDate(endDate)
        );
        byte[] pdf = reportService.generateGrnPdf(grnReport);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=grn_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}