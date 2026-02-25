package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.repository.EquipmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    public EquipmentService(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    // ================= SAVE / UPDATE =================
    public Equipment saveEquipment(Equipment equipment) {
        return equipmentRepository.save(equipment);
    }

    // ================= GET ALL =================
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    // ================= GET BY ID (FOR EDIT) =================
    public Equipment getById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found with id: " + id)
                );
    }

    // ================= DELETE =================
    public void deleteEquipment(Long id) {
        equipmentRepository.deleteById(id);
    }
}