package com.equipment.Management.System.demo.model;

import java.time.LocalDate;

public record MaintenanceUpdateDto(
        EquipmentRef equipment,  // ← Nested object with just ID
        String issueDescription,
        String priority,
        LocalDate dueDate,
        String status,
        String repairNote,
        Double cost
) {
    // Inner record for { equipment: { id: 3 } }
    public record EquipmentRef(Long id) {}
}