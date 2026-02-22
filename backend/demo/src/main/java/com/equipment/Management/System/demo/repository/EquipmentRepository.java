package com.equipment.Management.System.demo.repository;

import com.equipment.Management.System.demo.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
}