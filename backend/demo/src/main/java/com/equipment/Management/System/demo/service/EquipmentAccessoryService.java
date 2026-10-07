package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.model.EquipmentAccessory;
import com.equipment.Management.System.demo.repository.EquipmentAccessoryRepository;
import com.equipment.Management.System.demo.repository.EquipmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentAccessoryService {

    private final EquipmentAccessoryRepository accessoryRepository;
    private final EquipmentRepository equipmentRepository;

    public EquipmentAccessoryService(
            EquipmentAccessoryRepository accessoryRepository,
            EquipmentRepository equipmentRepository) {

        this.accessoryRepository = accessoryRepository;
        this.equipmentRepository = equipmentRepository;
    }

    public EquipmentAccessory addAccessory(
            Long equipmentId,
            EquipmentAccessory accessory) {

        if (!equipmentRepository.existsById(equipmentId)) {
            throw new RuntimeException("Equipment not found");
        }

        if (accessory.getAccessoryName() == null ||
                accessory.getAccessoryName().isBlank()) {
            throw new RuntimeException("Accessory name is required");
        }

        if (accessory.getQuantity() == null ||
                accessory.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        accessory.setId(null);
        accessory.setEquipmentId(equipmentId);

        if (accessory.getStatus() == null ||
                accessory.getStatus().isBlank()) {
            accessory.setStatus("AVAILABLE");
        }

        return accessoryRepository.save(accessory);
    }

    public List<EquipmentAccessory> getAccessoriesByEquipment(Long equipmentId) {

        if (!equipmentRepository.existsById(equipmentId)) {
            throw new RuntimeException("Equipment not found");
        }

        return accessoryRepository.findByEquipmentId(equipmentId);
    }

    public EquipmentAccessory updateAccessory(
            Long accessoryId,
            EquipmentAccessory request) {

        EquipmentAccessory accessory = accessoryRepository
                .findById(accessoryId)
                .orElseThrow(() ->
                        new RuntimeException("Accessory not found"));

        if (request.getAccessoryName() == null ||
                request.getAccessoryName().isBlank()) {
            throw new RuntimeException("Accessory name is required");
        }

        if (request.getQuantity() == null ||
                request.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        accessory.setAccessoryName(request.getAccessoryName());
        accessory.setQuantity(request.getQuantity());
        accessory.setDescription(request.getDescription());

        if (request.getStatus() != null &&
                !request.getStatus().isBlank()) {
            accessory.setStatus(request.getStatus());
        }

        return accessoryRepository.save(accessory);
    }

    public void deleteAccessory(Long accessoryId) {

        if (!accessoryRepository.existsById(accessoryId)) {
            throw new RuntimeException("Accessory not found");
        }

        accessoryRepository.deleteById(accessoryId);
    }
}