package com.equipment.Management.System.demo.repository;

import com.equipment.Management.System.demo.model.BorrowRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {

    @Query("""
            SELECT br
            FROM BorrowRequest br
            WHERE br.equipment.id = :equipmentId
              AND UPPER(br.status) IN :blockingStatuses
              AND br.borrowStartDate <= :requestedEnd
              AND br.borrowEndDate >= :requestedStart
            """)
    List<BorrowRequest> findOverlappingBlockingRequests(
            @Param("equipmentId") Long equipmentId,
            @Param("requestedStart") LocalDate requestedStart,
            @Param("requestedEnd") LocalDate requestedEnd,
            @Param("blockingStatuses") List<String> blockingStatuses
    );
}
