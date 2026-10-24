package com.equipment.Management.System.demo.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class IssuanceAccessoryReturnRequest {

    @NotNull(message = "Quantity returned is required")
    @PositiveOrZero(message = "Returned quantity cannot be negative")
    private Integer quantityReturned;

    @NotNull(message = "Return status is required")
    private String returnStatus;

    private String remarks;

    public Integer getQuantityReturned() {
        return quantityReturned;
    }

    public void setQuantityReturned(Integer quantityReturned) {
        this.quantityReturned = quantityReturned;
    }

    public String getReturnStatus() {
        return returnStatus;
    }

    public void setReturnStatus(String returnStatus) {
        this.returnStatus = returnStatus;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}