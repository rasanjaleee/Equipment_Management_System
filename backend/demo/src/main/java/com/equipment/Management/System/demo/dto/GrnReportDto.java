package com.equipment.Management.System.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GrnReportDto {
    private String grnNumber;
    private String supplier;
    private Long itemCount;
    private Double totalCost;
    private LocalDate receivedDate;

    public GrnReportDto(String grnNumber, String supplier, Long itemCount, Double totalCost) {
        this.grnNumber = grnNumber;
        this.supplier = supplier;
        this.itemCount = itemCount;
        this.totalCost = totalCost;
    }
}