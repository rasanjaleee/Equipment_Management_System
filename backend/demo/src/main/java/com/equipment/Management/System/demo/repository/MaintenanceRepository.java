package com.equipment.Management.System.demo.repository;

import com.equipment.Management.System.demo.model.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {

    List<Maintenance> findByStatus(String status);

    List<Maintenance> findByEquipment_Id(Long equipmentId);

    @Query("""
           SELECT m
           FROM Maintenance m
           WHERE m.equipment.id = :equipmentId
             AND m.status IN :statuses
           ORDER BY m.reportedDate DESC, m.id DESC
           """)
    Optional<Maintenance> findLatestActiveByEquipmentId(
            @Param("equipmentId") Long equipmentId,
            @Param("statuses") List<String> statuses
    );

    @Query("SELECT m FROM Maintenance m JOIN FETCH m.equipment")
    List<Maintenance> findAllWithEquipment();

    @Query("""
           SELECT m
           FROM Maintenance m
           JOIN FETCH m.equipment
           WHERE m.status IN :statuses
           """)
    List<Maintenance> findByStatusInWithEquipment(
            List<String> statuses
    );
}
