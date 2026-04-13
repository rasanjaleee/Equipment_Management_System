package com.equipment.Management.System.demo.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class BorrowRequestResponse {

    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private String laboratoryName;
    private String model;
    private String serialNumber;
    private String applicantName;
    private String registrationOrStaffId;
    private String department;
    private String email;
    private String contactNumber;
    private LocalDate borrowStartDate;
    private LocalDate borrowEndDate;
    private String purpose;
    private String status;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public String getLaboratoryName() {
        return laboratoryName;
    }

    public void setLaboratoryName(String laboratoryName) {
        this.laboratoryName = laboratoryName;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getApplicantName() {
        return applicantName;
    }

    public void setApplicantName(String applicantName) {
        this.applicantName = applicantName;
    }

    public String getRegistrationOrStaffId() {
        return registrationOrStaffId;
    }

    public void setRegistrationOrStaffId(String registrationOrStaffId) {
        this.registrationOrStaffId = registrationOrStaffId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public LocalDate getBorrowStartDate() {
        return borrowStartDate;
    }

    public void setBorrowStartDate(LocalDate borrowStartDate) {
        this.borrowStartDate = borrowStartDate;
    }

    public LocalDate getBorrowEndDate() {
        return borrowEndDate;
    }

    public void setBorrowEndDate(LocalDate borrowEndDate) {
        this.borrowEndDate = borrowEndDate;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
