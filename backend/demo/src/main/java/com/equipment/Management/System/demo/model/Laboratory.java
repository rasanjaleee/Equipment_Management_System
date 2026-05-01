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