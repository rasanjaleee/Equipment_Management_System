package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.dto.IssuanceDTO;
import com.equipment.Management.System.demo.dto.IssuanceRequest;
import com.equipment.Management.System.demo.service.IssuanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issuances")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class IssuanceController {

    @Autowired
    private IssuanceService issuanceService;

    // Create a new issuance
    @PostMapping
    public ResponseEntity<IssuanceDTO> createIssuance(@RequestBody IssuanceRequest request) {
        try {
            IssuanceDTO issuance = issuanceService.createIssuance(request);
            return new ResponseEntity<>(issuance, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    // Get all issuances
    @GetMapping
    public ResponseEntity<List<IssuanceDTO>> getAllIssuances() {
        try {
            List<IssuanceDTO> issuances = issuanceService.getAllIssuances();
            return new ResponseEntity<>(issuances, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get issuance by ID
    @GetMapping("/{id}")
    public ResponseEntity<IssuanceDTO> getIssuanceById(@PathVariable Long id) {
        try {
            IssuanceDTO issuance = issuanceService.getIssuanceById(id);
            return new ResponseEntity<>(issuance, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    // Get issuance by Issuance ID
    @GetMapping("/issuanceId/{issuanceId}")
    public ResponseEntity<IssuanceDTO> getIssuanceByIssuanceId(@PathVariable String issuanceId) {
        try {
            IssuanceDTO issuance = issuanceService.getIssuanceByIssuanceId(issuanceId);
            return new ResponseEntity<>(issuance, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    // Get issuances by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<IssuanceDTO>> getIssuancesByStatus(@PathVariable String status) {
        try {
            List<IssuanceDTO> issuances = issuanceService.getIssuancesByStatus(status);
            return new ResponseEntity<>(issuances, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get issuances by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<IssuanceDTO>> getIssuancesByUserId(@PathVariable Long userId) {
        try {
            List<IssuanceDTO> issuances = issuanceService.getIssuancesByUserId(userId);
            return new ResponseEntity<>(issuances, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update an issuance
    @PutMapping("/{id}")
    public ResponseEntity<IssuanceDTO> updateIssuance(@PathVariable Long id, @RequestBody IssuanceRequest request) {
        try {
            IssuanceDTO issuance = issuanceService.updateIssuance(id, request);
            return new ResponseEntity<>(issuance, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    // Delete an issuance
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteIssuance(@PathVariable Long id) {
        try {
            issuanceService.deleteIssuance(id);
            return new ResponseEntity<>("Issuance deleted successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error deleting issuance", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
