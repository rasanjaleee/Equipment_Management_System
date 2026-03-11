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

<<<<<<< HEAD
=======
    // ================= SAVE / UPDATE =================
>>>>>>> c934fe99cf1d8f0211b0868148fcabf2c9af0ae4
    public Equipment saveEquipment(Equipment equipment) {
        return equipmentRepository.save(equipment);
    }

<<<<<<< HEAD
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }
=======
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
>>>>>>> c934fe99cf1d8f0211b0868148fcabf2c9af0ae4
}