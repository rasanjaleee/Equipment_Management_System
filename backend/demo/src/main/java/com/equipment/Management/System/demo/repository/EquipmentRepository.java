package com.equipment.Management.System.demo.repository;

import com.equipment.Management.System.demo.model.Equipment;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Equipment e WHERE e.id = :id")
    Optional<Equipment> findByIdForUpdate(@Param("id") Long id);

    boolean existsBySerialNumber(String serialNumber);

    List<Equipment> findByLaboratoryIgnoreCase(String laboratory);

    @Query("""
        SELECT e.grnNumber, e.supplier, COUNT(e), COALESCE(SUM(e.cost), 0), MAX(e.purchaseDate)
        FROM Equipment e
        WHERE e.grnNumber IS NOT NULL AND e.grnNumber <> ''
        GROUP BY e.grnNumber, e.supplier
        ORDER BY MAX(e.purchaseDate) DESC, e.grnNumber ASC
    """)
    List<Object[]> getGrnReportSummary();
}