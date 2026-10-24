package com.equipment.Management.System.demo.repository;

import com.equipment.Management.System.demo.model.BorrowRequestNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BorrowRequestNotificationRepository extends JpaRepository<BorrowRequestNotification, Long> {

    boolean existsByBorrowRequestIdAndDecision(Long borrowRequestId, String decision);

    List<BorrowRequestNotification> findAllByRecipientUsernameOrderByCreatedAtDesc(String username);

    Optional<BorrowRequestNotification> findByIdAndRecipientUsername(Long id, String username);
}
