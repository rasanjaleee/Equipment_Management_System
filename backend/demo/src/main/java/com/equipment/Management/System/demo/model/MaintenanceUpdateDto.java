package com.equipment.Management.System.demo.model;

import java.time.LocalDate;
import jakarta.validation.constraints.DecimalMin;

public record MaintenanceUpdateDto(
        EquipmentRef equipment,  // ← Nested object with just ID
        String issueDescription,
        String priority,
        LocalDate dueDate,
        String status,
        String repairNote,
        @DecimalMin(value = "0.0", message = "Maintenance cost cannot be negative")
        Double cost
) {
    // Inner record for { equipment: { id: 3 } }
    public record EquipmentRef(Long id) {}
}
