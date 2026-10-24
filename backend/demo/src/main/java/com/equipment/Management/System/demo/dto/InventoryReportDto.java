package com.equipment.Management.System.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InventoryReportDto {
    private long totalEquipment;
    private long working;
    private long underRepair;
    private long broken;
}