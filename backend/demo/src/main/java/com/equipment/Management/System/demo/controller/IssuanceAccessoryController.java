package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.dto.IssuanceAccessoryReturnRequest;
import com.equipment.Management.System.demo.model.IssuanceAccessory;
import com.equipment.Management.System.demo.service.IssuanceAccessoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issuance-accessories")
@CrossOrigin(origins = "http://localhost:5173")
public class IssuanceAccessoryController {

    private final IssuanceAccessoryService issuanceAccessoryService;

    public IssuanceAccessoryController(
            IssuanceAccessoryService issuanceAccessoryService) {
        this.issuanceAccessoryService = issuanceAccessoryService;
    }

    @GetMapping("/issuance/{issuanceId}")
    public ResponseEntity<?> getByIssuance(
            @PathVariable Long issuanceId) {

        try {
            List<IssuanceAccessory> accessories =
                    issuanceAccessoryService.getByIssuanceId(issuanceId);

            return ResponseEntity.ok(accessories);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<?> returnAccessory(
            @PathVariable Long id,
            @Valid @RequestBody IssuanceAccessoryReturnRequest request) {

        try {
            IssuanceAccessory updated =
                    issuanceAccessoryService.returnAccessory(id, request);

            return ResponseEntity.ok(updated);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }
}