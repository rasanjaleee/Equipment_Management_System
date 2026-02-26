package com.equipment.Management.System.demo.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "issuances")
public class Issuance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String issuanceId;

    @Column(nullable = false)
    private LocalDate issueDate;

    @Column(nullable = false)
    private LocalDate returnDueDate;

    @Column(nullable = false, length = 20)
    private String status; // Issued, Pending, Returned, Overdue

    // Equipment Information
    @ManyToOne(optional = false)
    @JoinColumn(name = "equipment_pk")
    private Equipment equipment;

    @Column(nullable = false)
    private Integer qtyIssued;

    @Column(nullable = false, length = 50)
    private String conditionAtIssue; // Working, Broken, Under Repair

    // User Information
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 50)
    private String roleDept; // Student, Lab Assistant, Lecturer, Technician

    @Column(length = 20)
    private String contact;

    // Return Details
    private LocalDate returnDate;

    @Column(length = 50)
    private String conditionOnReturn; // Working, Broken, Under Repair, Missing Parts

    @Column(length = 500)
    private String remarks;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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