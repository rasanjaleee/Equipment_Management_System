package com.equipment.Management.System.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "lab")

public class Laboratory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String department;
    private String categoryDepartment;
    private String location;

    private String inCharge;
    private String inChargeDesignation;
    private String inChargeEmail;
    private String inChargeContactNumber;

    private String technicalOfficerInCharge;
    private String technicalOfficerEmail;
    private String technicalOfficerContactNumber;

    private String operatingHours;
    private String accessInformation;

    private int totalEquipment;
    private int workingEquipment;

    // GETTERS & SETTERS

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getCategoryDepartment() {
        return categoryDepartment;
    }

    public void setCategoryDepartment(String categoryDepartment) {
        this.categoryDepartment = categoryDepartment;
    }

    public String getLocation() {
        return location;
    }
    public void setLocation(String location) {
        this.location = location;
    }

    public String getInCharge() {
        return inCharge;
    }

    public void setInCharge(String inCharge) {
        this.inCharge = inCharge;
    }

    public String getTechnicalOfficerInCharge() {return technicalOfficerInCharge;}

    public void setTechnicalOfficerInCharge(String technicalOfficerInCharge) {
        this.technicalOfficerInCharge = technicalOfficerInCharge;
    }

    public String getInChargeDesignation() {
        return inChargeDesignation;
    }

    public void setInChargeDesignation(String inChargeDesignation) {
        this.inChargeDesignation = inChargeDesignation;
    }

    public String getInChargeEmail() {
        return inChargeEmail;
    }

    public void setInChargeEmail(String inChargeEmail) {
        this.inChargeEmail = inChargeEmail;
    }

    public String getInChargeContactNumber() {
        return inChargeContactNumber;
    }

    public void setInChargeContactNumber(String inChargeContactNumber) {
        this.inChargeContactNumber = inChargeContactNumber;
    }

    public String getTechnicalOfficerEmail() {
        return technicalOfficerEmail;
    }

    public void setTechnicalOfficerEmail(String technicalOfficerEmail) {
        this.technicalOfficerEmail = technicalOfficerEmail;
    }

    public String getTechnicalOfficerContactNumber() {
        return technicalOfficerContactNumber;
    }

    public void setTechnicalOfficerContactNumber(String technicalOfficerContactNumber) {
        this.technicalOfficerContactNumber = technicalOfficerContactNumber;
    }

    public String getOperatingHours() {
        return operatingHours;
    }

    public void setOperatingHours(String operatingHours) {
        this.operatingHours = operatingHours;
    }

    public String getAccessInformation() {
        return accessInformation;
    }

    public void setAccessInformation(String accessInformation) {
        this.accessInformation = accessInformation;
    }

    public int getTotalEquipment() {
        return totalEquipment;
    }

    public void setTotalEquipment(int totalEquipment) {
        this.totalEquipment = totalEquipment;
    }

    public int getWorkingEquipment() {
        return workingEquipment;
    }

    public void setWorkingEquipment(int workingEquipment) {
        this.workingEquipment = workingEquipment;
    }
}