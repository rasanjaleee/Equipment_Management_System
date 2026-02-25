package com.equipment.Management.System.demo.model;

import java.time.LocalDate;

public record MaintenanceCreateDto(
        Long equipmentId,
        String issueDescription,
        String priority,
        LocalDate dueDate,
        String status
) {}