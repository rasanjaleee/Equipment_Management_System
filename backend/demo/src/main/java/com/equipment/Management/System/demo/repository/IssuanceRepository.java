package com.equipment.Management.System.demo.repository;

import com.equipment.Management.System.demo.model.Issuance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IssuanceRepository extends JpaRepository<Issuance, Long> {

    Optional<Issuance> findByIssuanceId(String issuanceId);

    Optional<Issuance> findFirstByEquipment_IdAndStatusIgnoreCase(
            Long equipmentId,
            String status
    );

    List<Issuance> findByStatus(String status);

    List<Issuance> findByUser_Id(Long userId);

    List<Issuance> findByEquipment_Id(Long equipmentId);

    boolean existsByEquipment_IdAndStatusIgnoreCase(
            Long equipmentId,
            String status
    );
}