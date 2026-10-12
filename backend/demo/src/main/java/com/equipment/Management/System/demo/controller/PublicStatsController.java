package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.repository.BorrowRequestRepository;
import com.equipment.Management.System.demo.repository.EquipmentRepository;
import com.equipment.Management.System.demo.repository.IssuanceRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public/stats")
public class PublicStatsController {

    private final BorrowRequestRepository borrowRequestRepository;
    private final EquipmentRepository equipmentRepository;
    private final IssuanceRepository issuanceRepository;

    public PublicStatsController(
            BorrowRequestRepository borrowRequestRepository,
            EquipmentRepository equipmentRepository,
            IssuanceRepository issuanceRepository) {
        this.borrowRequestRepository = borrowRequestRepository;
        this.equipmentRepository = equipmentRepository;
        this.issuanceRepository = issuanceRepository;
    }

    @GetMapping
    public Map<String, Long> getHomeStats() {
        return Map.of(
                "borrowedItems", issuanceRepository.countByStatusIgnoreCase("issued"),
                "pendingRequests", borrowRequestRepository.countByStatusIgnoreCase("pending"),
                "totalEquipment", equipmentRepository.count()
        );
    }
}