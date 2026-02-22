package com.equipment.Management.System.demo.repository;

import com.equipment.Management.System.demo.model.Maintenance;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {

    List<Maintenance> findByStatus(String status);

    List<Maintenance> findByEquipmentId(Long equipmentId);
}