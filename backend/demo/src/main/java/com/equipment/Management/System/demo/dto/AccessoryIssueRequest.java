package com.equipment.Management.System.demo.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class AccessoryIssueRequest {

    @NotNull(message = "Accessory ID is required")
    private Long accessoryId;

    @NotNull(message = "Accessory quantity is required")
    @Positive(message = "Accessory quantity must be positive")
    private Integer quantityIssued;

    public Long getAccessoryId() {
        return accessoryId;
    }

    public void setAccessoryId(Long accessoryId) {
        this.accessoryId = accessoryId;
    }

    public Integer getQuantityIssued() {
        return quantityIssued;
    }

    public void setQuantityIssued(Integer quantityIssued) {
        this.quantityIssued = quantityIssued;
    }
}