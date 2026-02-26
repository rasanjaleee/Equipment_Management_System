package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.dto.IssuanceDTO;
import com.equipment.Management.System.demo.dto.IssuanceRequest;
import com.equipment.Management.System.demo.service.IssuanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issuances")
@CrossOrigin(origins = "http://localhost:5173")
public class IssuanceController {

    @Autowired
    private IssuanceService issuanceService;

    // Create new issuance
    @PostMapping
    public ResponseEntity<?> createIssuance(@Valid @RequestBody IssuanceRequest request) {
        try {
            IssuanceDTO created = issuanceService.createIssuance(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Get all issuances
    @GetMapping
    public ResponseEntity<List<IssuanceDTO>> getAllIssuances() {
        List<IssuanceDTO> issuances = issuanceService.getAllIssuances();
        return ResponseEntity.ok(issuances);
    }

    // Get issuance by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getIssuanceById(@PathVariable Long id) {
        try {
            IssuanceDTO issuance = issuanceService.getIssuanceById(id);
            return ResponseEntity.ok(issuance);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Get issuance by issuance ID (string)
    @GetMapping("/code/{issuanceId}")
    public ResponseEntity<?> getIssuanceByIssuanceId(@PathVariable String issuanceId) {
        try {
            IssuanceDTO issuance = issuanceService.getIssuanceByIssuanceId(issuanceId);
            return ResponseEntity.ok(issuance);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Get issuances by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<IssuanceDTO>> getIssuancesByStatus(@PathVariable String status) {
        List<IssuanceDTO> issuances = issuanceService.getIssuancesByStatus(status);
        return ResponseEntity.ok(issuances);
    }

    // Get issuances by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<IssuanceDTO>> getIssuancesByUserId(@PathVariable Long userId) {
        List<IssuanceDTO> issuances = issuanceService.getIssuancesByUserId(userId);
        return ResponseEntity.ok(issuances);
    }

    // Get issuances by equipment ID
    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<IssuanceDTO>> getIssuancesByEquipmentId(@PathVariable Long equipmentId) {
        List<IssuanceDTO> issuances = issuanceService.getIssuancesByEquipmentId(equipmentId);
        return ResponseEntity.ok(issuances);
    }

    // Update issuance
    @PutMapping("/{id}")
    public ResponseEntity<?> updateIssuance(@PathVariable Long id, @Valid @RequestBody IssuanceRequest request) {
        try {
            IssuanceDTO updated = issuanceService.updateIssuance(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Delete issuance
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIssuance(@PathVariable Long id) {
        try {
            issuanceService.deleteIssuance(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Issuance deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}
