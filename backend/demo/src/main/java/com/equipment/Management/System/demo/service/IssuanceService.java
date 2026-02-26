package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.dto.IssuanceDTO;
import com.equipment.Management.System.demo.dto.IssuanceRequest;
import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.model.Issuance;
import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.repository.EquipmentRepository;
import com.equipment.Management.System.demo.repository.IssuanceRepository;
import com.equipment.Management.System.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class IssuanceService {

    @Autowired
    private IssuanceRepository issuanceRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private UserRepository userRepository;

    // ===================== CREATE =====================
    @Transactional
    public IssuanceDTO createIssuance(IssuanceRequest request) {

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new RuntimeException(
                        "Equipment not found with ID: " + request.getEquipmentId()));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException(
                        "User not found with ID: " + request.getUserId()));

        if (issuanceRepository.findByIssuanceId(request.getIssuanceId()).isPresent()) {
            throw new RuntimeException(
                    "Issuance ID already exists: " + request.getIssuanceId());
        }

        Issuance issuance = new Issuance();
        issuance.setIssuanceId(request.getIssuanceId());
        issuance.setIssueDate(request.getIssueDate());
        issuance.setReturnDueDate(request.getReturnDueDate());
        issuance.setStatus(request.getStatus());
        issuance.setEquipment(equipment);
        issuance.setQtyIssued(request.getQtyIssued());
        issuance.setConditionAtIssue(request.getConditionAtIssue());
        issuance.setUser(user);
        issuance.setRoleDept(request.getRoleDept());
        issuance.setContact(request.getContact());
        issuance.setReturnDate(request.getReturnDate());
        issuance.setConditionOnReturn(request.getConditionOnReturn());
        issuance.setRemarks(request.getRemarks());

        Issuance saved = issuanceRepository.save(issuance);
        return convertToDTO(saved);
    }

    // ===================== READ =====================
    public List<IssuanceDTO> getAllIssuances() {
        return issuanceRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public IssuanceDTO getIssuanceById(Long id) {
        Issuance issuance = issuanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Issuance not found with ID: " + id));
        return convertToDTO(issuance);
    }

    public IssuanceDTO getIssuanceByIssuanceId(String issuanceId) {
        Issuance issuance = issuanceRepository.findByIssuanceId(issuanceId)
                .orElseThrow(() -> new RuntimeException(
                        "Issuance not found with Issuance ID: " + issuanceId));
        return convertToDTO(issuance);
    }

    public List<IssuanceDTO> getIssuancesByStatus(String status) {
        return issuanceRepository.findByStatus(status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<IssuanceDTO> getIssuancesByUserId(Long userId) {
        return issuanceRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<IssuanceDTO> getIssuancesByEquipmentId(Long equipmentId) {
       return issuanceRepository.findByEquipment_Id(equipmentId)
        .stream()
        .map(this::convertToDTO)
        .collect(Collectors.toList());
    }

    // ===================== UPDATE =====================
    @Transactional
    public IssuanceDTO updateIssuance(Long id, IssuanceRequest request) {

        Issuance issuance = issuanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Issuance not found with ID: " + id));

        // Update Equipment if changed
        if (!issuance.getEquipment().getId().equals(request.getEquipmentId())) {
            Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                    .orElseThrow(() -> new RuntimeException(
                            "Equipment not found with ID: " + request.getEquipmentId()));
            issuance.setEquipment(equipment);
        }

        // Update User if changed
        if (!issuance.getUser().getId().equals(request.getUserId())) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException(
                            "User not found with ID: " + request.getUserId()));
            issuance.setUser(user);
        }

        issuance.setIssuanceId(request.getIssuanceId());
        issuance.setIssueDate(request.getIssueDate());
        issuance.setReturnDueDate(request.getReturnDueDate());
        issuance.setStatus(request.getStatus());
        issuance.setQtyIssued(request.getQtyIssued());
        issuance.setConditionAtIssue(request.getConditionAtIssue());
        issuance.setRoleDept(request.getRoleDept());
        issuance.setContact(request.getContact());
        issuance.setReturnDate(request.getReturnDate());
        issuance.setConditionOnReturn(request.getConditionOnReturn());
        issuance.setRemarks(request.getRemarks());

        Issuance updated = issuanceRepository.save(issuance);
        return convertToDTO(updated);
    }

    // ===================== DELETE =====================
    @Transactional
    public void deleteIssuance(Long id) {
        if (!issuanceRepository.existsById(id)) {
            throw new RuntimeException("Issuance not found with ID: " + id);
        }
        issuanceRepository.deleteById(id);
    }

    // ===================== DTO CONVERSION =====================
    private IssuanceDTO convertToDTO(Issuance issuance) {

        IssuanceDTO dto = new IssuanceDTO();

        dto.setId(issuance.getId());
        dto.setIssuanceId(issuance.getIssuanceId());
        dto.setIssueDate(issuance.getIssueDate());
        dto.setReturnDueDate(issuance.getReturnDueDate());
        dto.setStatus(issuance.getStatus());

        // Equipment Details
        dto.setEquipmentId(issuance.getEquipment().getId());
        dto.setEquipmentName(issuance.getEquipment().getEquipmentName());
        dto.setQtyIssued(issuance.getQtyIssued());
        dto.setConditionAtIssue(issuance.getConditionAtIssue());

        // User Details
        dto.setUserId(issuance.getUser().getId());
        dto.setUserName(issuance.getUser().getUsername());
        dto.setUserEmail(issuance.getUser().getEmail());
        dto.setRoleDept(issuance.getRoleDept());
        dto.setContact(issuance.getContact());

        // Return Details
        dto.setReturnDate(issuance.getReturnDate());
        dto.setConditionOnReturn(issuance.getConditionOnReturn());
        dto.setRemarks(issuance.getRemarks());

        return dto;
    }
}