package com.equipment.Management.System.demo.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Who receives the notification
    @Column(nullable = false)
    private Long userId;

    // Short heading
    @Column(nullable = false)
    private String title;

    // Detailed message
    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    // Type: ISSUE, MAINTENANCE, OVERDUE, etc.
    @Column(nullable = false)
    private String type;

    // Optional: link to another table (equipment, issuance, maintenance)
    private Long relatedId;

    // Optional: EQUIPMENT, ISSUANCE, MAINTENANCE
    private String relatedType;

    // Read/unread status
    @Column(nullable = false)
    private boolean isRead = false;

    // Priority: LOW, NORMAL, HIGH
    @Column(nullable = false)
    private String priority = "NORMAL";

    // When notification was created
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}