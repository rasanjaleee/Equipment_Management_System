package com.equipment.Management.System.demo.repository;

import com.equipment.Management.System.demo.model.Maintenance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {

    List<Maintenance> findByStatus(String status);

    List<Maintenance> findByEquipment_Id(Long equipmentId);

    @Query("SELECT m FROM Maintenance m JOIN FETCH m.equipment")
    List<Maintenance> findAllWithEquipment();
}