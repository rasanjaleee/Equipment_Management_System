package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.dto.LabEquipmentInventoryDTO;
import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.repository.EquipmentRepository;
import com.equipment.Management.System.demo.repository.IssuanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class LabEquipmentInventoryService {

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private IssuanceRepository issuanceRepository;

    public List<LabEquipmentInventoryDTO> getInventoryByLaboratory(String laboratory) {

        List<Equipment> equipmentList =
                equipmentRepository.findByLaboratoryIgnoreCase(laboratory);

        Map<String, List<Equipment>> grouped = new LinkedHashMap<>();

        for (Equipment equipment : equipmentList) {
            grouped.computeIfAbsent(
                    equipment.getEquipmentName(),
                    key -> new ArrayList<>()
            ).add(equipment);
        }

        List<LabEquipmentInventoryDTO> result = new ArrayList<>();

        for (Map.Entry<String, List<Equipment>> entry : grouped.entrySet()) {

            long total = entry.getValue().size();
            long available = 0;
            long issued = 0;
            long underRepair = 0;
            long broken = 0;

            for (Equipment equipment : entry.getValue()) {

                boolean currentlyIssued =
                        issuanceRepository.existsByEquipment_IdAndStatusIgnoreCase(
                                equipment.getId(),
                                "Issued"
                        );

                if (currentlyIssued) {
                    issued++;
                    continue;
                }

                if (equipment.getStatus() == null) {
                    continue;
                }

                switch (equipment.getStatus()) {

                    case WORKING:
                        available++;
                        break;

                    case UNDER_REPAIR:
                        underRepair++;
                        break;

                    case BROKEN:
                        broken++;
                        break;
                }
            }

            result.add(
                    new LabEquipmentInventoryDTO(
                            entry.getKey(),
                            total,
                            available,
                            issued,
                            underRepair,
                            broken
                    )
            );
        }

        return result;
    }
}