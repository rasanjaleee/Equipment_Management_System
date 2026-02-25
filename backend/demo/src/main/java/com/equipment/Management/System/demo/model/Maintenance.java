package com.equipment.Management.System.demo.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "maintenance")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Maintenance.java
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    @JsonIgnore  // ← ADD THIS LINE
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

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.reportedDate = LocalDate.now();
        this.status = "PENDING";
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}