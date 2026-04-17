package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.dto.GrnReportDto;
import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/grn")
    public ResponseEntity<?> getGrnReport() {
        return ResponseEntity.ok(reportService.getGrnReport());
    }

    @GetMapping("/inventory-summary")
    public ResponseEntity<?> getInventorySummary(
            @RequestParam(required = false) String laboratory,
            @RequestParam(required = false) String status
    ) {
        List<Equipment> filtered = reportService.getFilteredInventory(laboratory, status);
        return ResponseEntity.ok(reportService.getInventorySummary(filtered));
    }

    @GetMapping("/inventory-list")
    public ResponseEntity<?> getInventoryList(
            @RequestParam(required = false) String laboratory,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(reportService.getFilteredInventory(laboratory, status));
    }

    @GetMapping("/inventory/export/csv")
    public ResponseEntity<?> exportInventoryCsv(
            @RequestParam(required = false) String laboratory,
            @RequestParam(required = false) String status
    ) throws Exception {
        List<Equipment> filtered = reportService.getFilteredInventory(laboratory, status);
        byte[] csv = reportService.generateInventoryCsv(filtered);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=inventory_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/inventory/export/pdf")
    public ResponseEntity<?> exportInventoryPdf(
            @RequestParam(required = false) String laboratory,
            @RequestParam(required = false) String status
    ) throws Exception {
        List<Equipment> filtered = reportService.getFilteredInventory(laboratory, status);
        byte[] pdf = reportService.generateInventoryPdf(filtered);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=inventory_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/grn/export/csv")
    public ResponseEntity<?> exportGrnCsv() throws Exception {
        List<GrnReportDto> grnReport = reportService.getGrnReport();
        byte[] csv = reportService.generateGrnCsv(grnReport);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=grn_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/grn/export/pdf")
    public ResponseEntity<?> exportGrnPdf() throws Exception {
        List<GrnReportDto> grnReport = reportService.getGrnReport();
        byte[] pdf = reportService.generateGrnPdf(grnReport);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=grn_report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}