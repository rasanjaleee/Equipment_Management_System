package com.equipment.Management.System.demo.repository;

import com.equipment.Management.System.demo.model.EquipmentAccessory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentAccessoryRepository
        extends JpaRepository<EquipmentAccessory, Long> {

    List<EquipmentAccessory> findByEquipmentId(Long equipmentId);
}