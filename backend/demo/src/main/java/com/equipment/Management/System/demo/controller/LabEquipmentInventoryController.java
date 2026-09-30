package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.dto.LabEquipmentInventoryDTO;
import com.equipment.Management.System.demo.service.LabEquipmentInventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab-inventory")
@CrossOrigin(origins = "http://localhost:5173")
public class LabEquipmentInventoryController {

    @Autowired
    private LabEquipmentInventoryService labEquipmentInventoryService;

    @GetMapping("/{laboratory}")
    public ResponseEntity<List<LabEquipmentInventoryDTO>> getLabInventory(
            @PathVariable String laboratory) {

        return ResponseEntity.ok(
                labEquipmentInventoryService.getInventoryByLaboratory(laboratory)
        );
    }
}