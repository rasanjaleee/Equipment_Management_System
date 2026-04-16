package com.equipment.Management.System.demo.repository;

import com.equipment.Management.System.demo.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    boolean existsBySerialNumber(String serialNumber);

    @Query("""
        SELECT e.grnNumber, e.supplier, COUNT(e), COALESCE(SUM(e.cost), 0)
        FROM Equipment e
        WHERE e.grnNumber IS NOT NULL AND e.grnNumber <> ''
        GROUP BY e.grnNumber, e.supplier
        ORDER BY e.grnNumber
    """)
    List<Object[]> getGrnReportSummary();
}