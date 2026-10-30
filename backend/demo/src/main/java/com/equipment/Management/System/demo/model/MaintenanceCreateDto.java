package com.equipment.Management.System.demo.model;

import java.time.LocalDate;
import jakarta.validation.constraints.DecimalMin;

public record MaintenanceCreateDto(
        Long equipmentId,
        String issueDescription,
        String priority,
        LocalDate dueDate,
        String status,
        String repairNote,
        @DecimalMin(value = "0.0", message = "Maintenance cost cannot be negative")
        Double cost
) {}
