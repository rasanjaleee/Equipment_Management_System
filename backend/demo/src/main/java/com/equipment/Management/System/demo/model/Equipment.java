package com.equipment.Management.System.demo.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "equipment")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String equipmentName;
    private String laboratory;
    private String model;
    private String serialNumber;
    private Double cost;
    private LocalDate purchaseDate;
    private String supplier;

    @Enumerated(EnumType.STRING)
    private EquipmentStatus status;

    private String qrCode;
    private String grnNumber;

    private String photoPath; // store image file path
}