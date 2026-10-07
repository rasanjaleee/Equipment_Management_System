package com.equipment.Management.System.demo.repository;

import com.equipment.Management.System.demo.model.IssuanceAccessory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssuanceAccessoryRepository
        extends JpaRepository<IssuanceAccessory, Long> {

    List<IssuanceAccessory> findByIssuance_Id(Long issuanceId);
}