package com.equipment.Management.System.demo.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "maintenance")
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    @JsonIgnore
    private Equipment equipment;

    @Column(nullable = false, length = 1000)
    private String issueDescription;

    @Column(nullable = false)
    private String status;

    private String priority;

    @Column(nullable = false)
    private LocalDate reportedDate;

    private LocalDate dueDate;

    private LocalDate completedDate;

    private Double cost;

    @Column(length = 1000)
    private String repairNote;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ================= CONSTRUCTORS =================

    public Maintenance() {}

    private Maintenance(Builder builder) {
        this.equipment        = builder.equipment;
        this.issueDescription = builder.issueDescription;
        this.priority         = builder.priority;
        this.dueDate          = builder.dueDate;
        this.status           = builder.status;
        this.repairNote       = builder.repairNote;
        this.cost             = builder.cost;
    }

    // ================= BUILDER =================

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Equipment  equipment;
        private String     issueDescription;
        private String     priority;
        private LocalDate  dueDate;
        private String     status;
        private String     repairNote;
        private Double     cost;

        public Builder equipment(Equipment equipment) {
            this.equipment = equipment;
            return this;
        }

        public Builder issueDescription(String issueDescription) {
            this.issueDescription = issueDescription;
            return this;
        }

        public Builder priority(String priority) {
            this.priority = priority;
            return this;
        }

        public Builder dueDate(LocalDate dueDate) {
            this.dueDate = dueDate;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder repairNote(String repairNote) {
            this.repairNote = repairNote;
            return this;
        }

        public Builder cost(Double cost) {
            this.cost = cost;
            return this;
        }

        public Maintenance build() {
            return new Maintenance(this);
        }
    }

    // ================= GETTERS & SETTERS =================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Equipment getEquipment() { return equipment; }
    public void setEquipment(Equipment equipment) { this.equipment = equipment; }

    public String getIssueDescription() { return issueDescription; }
    public void setIssueDescription(String issueDescription) { this.issueDescription = issueDescription; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public LocalDate getReportedDate() { return reportedDate; }
    public void setReportedDate(LocalDate reportedDate) { this.reportedDate = reportedDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public LocalDate getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDate completedDate) { this.completedDate = completedDate; }

    public Double getCost() { return cost; }
    public void setCost(Double cost) { this.cost = cost; }

    public String getRepairNote() { return repairNote; }
    public void setRepairNote(String repairNote) { this.repairNote = repairNote; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // ================= LIFECYCLE =================

    @PrePersist
    public void onCreate() {
        this.createdAt   = LocalDateTime.now();
        this.updatedAt   = LocalDateTime.now();
        this.reportedDate = LocalDate.now();
        if (this.status == null) this.status = "PENDING";
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}