package com.equipment.Management.System.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "issuance_accessories")
public class IssuanceAccessory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The issuance this accessory belongs to
    @ManyToOne(optional = false)
    @JoinColumn(name = "issuance_id", nullable = false)
    private Issuance issuance;

    // Original master accessory ID
    @Column(name = "accessory_id", nullable = false)
    private Long accessoryId;

    // Snapshot of name at time of issue
    @Column(name = "accessory_name", nullable = false, length = 150)
    private String accessoryName;

    @Column(name = "quantity_issued", nullable = false)
    private Integer quantityIssued;

    @Column(name = "quantity_returned")
    private Integer quantityReturned;

    @Column(name = "return_status", length = 30)
    private String returnStatus;

    @Column(length = 500)
    private String remarks;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Issuance getIssuance() {
        return issuance;
    }

    public void setIssuance(Issuance issuance) {
        this.issuance = issuance;
    }

    public Long getAccessoryId() {
        return accessoryId;
    }

    public void setAccessoryId(Long accessoryId) {
        this.accessoryId = accessoryId;
    }

    public String getAccessoryName() {
        return accessoryName;
    }

    public void setAccessoryName(String accessoryName) {
        this.accessoryName = accessoryName;
    }

    public Integer getQuantityIssued() {
        return quantityIssued;
    }

    public void setQuantityIssued(Integer quantityIssued) {
        this.quantityIssued = quantityIssued;
    }

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