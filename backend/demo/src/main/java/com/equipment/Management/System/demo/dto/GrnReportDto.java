package com.equipment.Management.System.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GrnReportDto {
    private String grnNumber;
    private String supplier;
    private Long itemCount;
    private Double totalCost;
}