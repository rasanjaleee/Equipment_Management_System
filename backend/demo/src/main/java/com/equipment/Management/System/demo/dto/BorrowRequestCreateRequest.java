package com.equipment.Management.System.demo.dto;

import java.time.LocalDate;

public class BorrowRequestCreateRequest {

    private Long equipmentId;
    private String applicantName;
    private String registrationOrStaffId;
    private String department;
    private String email;
    private String contactNumber;
    private LocalDate borrowStartDate;
    private LocalDate borrowEndDate;
    private String purpose;
    private String status;

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
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
}
