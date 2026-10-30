
package com.equipment.Management.System.demo.repository;

import com.equipment.Management.System.demo.model.BorrowRequest;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {

    // Lock a borrow request while processing its approval/rejection.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT br FROM BorrowRequest br WHERE br.id = :id")
    Optional<BorrowRequest> findByIdForUpdate(@Param("id") Long id);


    // Find all overlapping PENDING and APPROVED requests.
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


    // Find overlapping requests EXCLUDING the request currently being approved.
    @Query("""
            SELECT br
            FROM BorrowRequest br
            WHERE br.id <> :excludedId
              AND br.equipment.id = :equipmentId
              AND UPPER(br.status) IN :blockingStatuses
              AND br.borrowStartDate <= :requestedEnd
              AND br.borrowEndDate >= :requestedStart
            """)
    List<BorrowRequest> findOverlappingBlockingRequestsExcept(
            @Param("excludedId") Long excludedId,
            @Param("equipmentId") Long equipmentId,
            @Param("requestedStart") LocalDate requestedStart,
            @Param("requestedEnd") LocalDate requestedEnd,
            @Param("blockingStatuses") List<String> blockingStatuses
    );


    // Find blocking requests for the equipment calendar.
    @Query("""
            SELECT br
            FROM BorrowRequest br
            WHERE br.equipment.id = :equipmentId
              AND UPPER(br.status) IN :blockingStatuses
              AND br.borrowStartDate <= :calendarEnd
              AND br.borrowEndDate >= :calendarStart
            ORDER BY br.borrowStartDate ASC
            """)
    List<BorrowRequest> findBlockingRequestsForCalendar(
            @Param("equipmentId") Long equipmentId,
            @Param("calendarStart") LocalDate calendarStart,
            @Param("calendarEnd") LocalDate calendarEnd,
            @Param("blockingStatuses") List<String> blockingStatuses
    );


    // Get all pending and approved requests for the calendar.
    @Query("""
            SELECT br
            FROM BorrowRequest br
            WHERE UPPER(br.status) IN ('PENDING', 'APPROVED')
              AND br.borrowStartDate <= :calendarEnd
              AND br.borrowEndDate >= :calendarStart
            ORDER BY br.borrowStartDate ASC
            """)
    List<BorrowRequest> findCalendarRequests(
            @Param("calendarStart") LocalDate calendarStart,
            @Param("calendarEnd") LocalDate calendarEnd
    );


    // Get requests belonging to an applicant.
    List<BorrowRequest> findByEmailIgnoreCaseOrderByCreatedAtDesc(String email);
}
