package com.equipment.Management.System.demo.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record MaintenanceResponseDto(
        Long id,
        Long equipmentId,
        String equipmentName,
        String laboratory,
        String model,
        String serialNumber,

        String issueDescription,
        String status,
        String priority,
        LocalDate reportedDate,
        LocalDate dueDate,
        LocalDate completedDate,
        Double cost,
        String repairNote,
        LocalDateTime updatedAt
) {}