package com.equipment.Management.System.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public class IssuanceRequest {
    
    @NotBlank(message = "Issuance ID is required")
    private String issuanceId;
    
    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;
    
    @NotNull(message = "Return due date is required")
    private LocalDate returnDueDate;
    
    @NotBlank(message = "Status is required")
    private String status;
    
    // Equipment Information
    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;
    
    @NotNull(message = "Quantity issued is required")
    @Positive(message = "Quantity must be positive")
    private Integer qtyIssued;
    
    @NotBlank(message = "Condition at issue is required")
    private String conditionAtIssue;
    
    // User Information
    @NotNull(message = "User ID is required")
    private Long userId;
    
    private String roleDept;
    private String contact;
    
    // Return Details (optional)
    private LocalDate returnDate;
    private String conditionOnReturn;
    private String remarks;

    // Getters and Setters
    public String getIssuanceId() {
        return issuanceId;
    }

    public void setIssuanceId(String issuanceId) {
        this.issuanceId = issuanceId;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDate getReturnDueDate() {
        return returnDueDate;
    }

    public void setReturnDueDate(LocalDate returnDueDate) {
        this.returnDueDate = returnDueDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public Integer getQtyIssued() {
        return qtyIssued;
    }

    public void setQtyIssued(Integer qtyIssued) {
        this.qtyIssued = qtyIssued;
    }

    public String getConditionAtIssue() {
        return conditionAtIssue;
    }

    public void setConditionAtIssue(String conditionAtIssue) {
        this.conditionAtIssue = conditionAtIssue;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getRoleDept() {
        return roleDept;
    }

    public void setRoleDept(String roleDept) {
        this.roleDept = roleDept;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public String getConditionOnReturn() {
        return conditionOnReturn;
    }

    public void setConditionOnReturn(String conditionOnReturn) {
        this.conditionOnReturn = conditionOnReturn;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
