package com.equipment.Management.System.demo.repository;

import com.equipment.Management.System.demo.model.Issuance;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface IssuanceRepository extends JpaRepository<Issuance, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Issuance i WHERE i.id = :id")
    Optional<Issuance> findByIdForUpdate(@Param("id") Long id);
    
    Optional<Issuance> findByIssuanceId(String issuanceId);

    Optional<Issuance> findByBorrowRequest_Id(Long borrowRequestId);
    
    List<Issuance> findByStatus(String status);
    
    List<Issuance> findByUserId(Long userId);
    
    List<Issuance> findByEquipment_Id(Long equipmentId);

    List<Issuance> findByUser_Id(Long userId);

    List<Issuance> findByIssuanceIdStartingWith(String prefix);

    Optional<Issuance> findFirstByEquipment_IdAndStatusIgnoreCase(Long equipmentId, String status);

    boolean existsByEquipment_IdAndStatusIgnoreCase(Long equipmentId, String status);

    @Query("""
            SELECT i
            FROM Issuance i
            WHERE i.equipment.id = :equipmentId
              AND UPPER(i.status) IN :activeStatuses
              AND i.returnDate IS NULL
              AND i.issueDate <= :requestedEnd
              AND i.returnDueDate >= :requestedStart
            """)
    List<Issuance> findOverlappingActiveIssuances(
            @Param("equipmentId") Long equipmentId,
            @Param("requestedStart") LocalDate requestedStart,
            @Param("requestedEnd") LocalDate requestedEnd,
            @Param("activeStatuses") List<String> activeStatuses
    );

    @Query("""
            SELECT i
            FROM Issuance i
            WHERE i.id <> :excludedId
              AND i.equipment.id = :equipmentId
              AND UPPER(i.status) IN :activeStatuses
              AND i.returnDate IS NULL
              AND i.issueDate <= :requestedEnd
              AND i.returnDueDate >= :requestedStart
            """)
    List<Issuance> findOverlappingActiveIssuancesExcept(
            @Param("excludedId") Long excludedId,
            @Param("equipmentId") Long equipmentId,
            @Param("requestedStart") LocalDate requestedStart,
            @Param("requestedEnd") LocalDate requestedEnd,
            @Param("activeStatuses") List<String> activeStatuses
    );
}