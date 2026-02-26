package com.equipment.Management.System.demo.repository;

import com.equipment.Management.System.demo.model.Issuance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IssuanceRepository extends JpaRepository<Issuance, Long> {
    
    Optional<Issuance> findByIssuanceId(String issuanceId);
    
    List<Issuance> findByStatus(String status);
    
    List<Issuance> findByUserId(Long userId);
    
    List<Issuance> findByEquipmentEquipmentPk(Long equipmentPk);
}
