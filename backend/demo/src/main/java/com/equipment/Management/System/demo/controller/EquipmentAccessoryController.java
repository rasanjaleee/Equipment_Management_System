package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.model.EquipmentAccessory;
import com.equipment.Management.System.demo.service.EquipmentAccessoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipment-accessories")
@CrossOrigin(originPatterns = {
        "http://localhost:*",
        "https://*.choreoapps.dev",
        "https://*.choreo.org"
})
public class EquipmentAccessoryController {

    private final EquipmentAccessoryService accessoryService;

    public EquipmentAccessoryController(
            EquipmentAccessoryService accessoryService) {
        this.accessoryService = accessoryService;
    }

    @PostMapping("/equipment/{equipmentId}")
    public ResponseEntity<?> addAccessory(
            @PathVariable Long equipmentId,
            @RequestBody EquipmentAccessory accessory) {

        try {
            EquipmentAccessory saved =
                    accessoryService.addAccessory(equipmentId, accessory);

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<?> getAccessories(
            @PathVariable Long equipmentId) {

        try {
            List<EquipmentAccessory> accessories =
                    accessoryService.getAccessoriesByEquipment(equipmentId);

            return ResponseEntity.ok(accessories);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    @PutMapping("/{accessoryId}")
    public ResponseEntity<?> updateAccessory(
            @PathVariable Long accessoryId,
            @RequestBody EquipmentAccessory accessory) {

        try {
            EquipmentAccessory updated =
                    accessoryService.updateAccessory(
                            accessoryId,
                            accessory
                    );

            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    @DeleteMapping("/{accessoryId}")
    public ResponseEntity<?> deleteAccessory(
            @PathVariable Long accessoryId) {

        try {
            accessoryService.deleteAccessory(accessoryId);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Accessory deleted successfully"
                    )
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }
}