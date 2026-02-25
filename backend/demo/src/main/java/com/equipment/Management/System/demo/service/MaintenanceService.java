package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.model.Equipment;
import com.equipment.Management.System.demo.model.Maintenance;
import com.equipment.Management.System.demo.model.MaintenanceCreateDto;
import com.equipment.Management.System.demo.model.MaintenanceResponseDto;
import com.equipment.Management.System.demo.model.MaintenanceUpdateDto;
import com.equipment.Management.System.demo.repository.EquipmentRepository;
import com.equipment.Management.System.demo.repository.MaintenanceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MaintenanceService {

    private final MaintenanceRepository repo;
    private final EquipmentRepository equipmentRepo;

    public MaintenanceService(MaintenanceRepository repo, EquipmentRepository equipmentRepo) {
        this.repo = repo;
        this.equipmentRepo = equipmentRepo;
    }

    // ✅ CREATE (using DTO)
    public Maintenance create(MaintenanceCreateDto dto) {

        // Validate equipmentId
        if (dto == null || dto.equipmentId() == null) {
            throw new RuntimeException("equipmentId is required");
        }

        // Find equipment from DB
        Equipment eq = equipmentRepo.findById(dto.equipmentId())
                .orElseThrow(() -> new RuntimeException(
                        "Equipment not found with id: " + dto.equipmentId()
                ));

        // Build Maintenance entity
        Maintenance m = Maintenance.builder()
                .equipment(eq)
                .issueDescription(dto.issueDescription())
                .priority(dto.priority())
                .dueDate(dto.dueDate())
                .build();

        // status & reportedDate are automatically set by @PrePersist
        // (PENDING + current date)

        return repo.save(m);
    }

    // ✅ GET ALL (returns DTO list)
    public List<MaintenanceResponseDto> getAll() {
        return repo.findAllWithEquipment().stream()
                .map(m -> new MaintenanceResponseDto(
                        m.getId(),
                        m.getEquipment().getId(),
                        m.getEquipment().getEquipmentName(),
                        m.getEquipment().getLaboratory(),
                        m.getEquipment().getModel(),
                        m.getEquipment().getSerialNumber(),
                        m.getIssueDescription(),
                        m.getStatus(),
                        m.getPriority(),
                        m.getReportedDate(),
                        m.getDueDate(),
                        m.getCompletedDate(),
                        m.getCost(),
                        m.getRepairNote(),
                        m.getUpdatedAt()
                ))
                .toList();
    }

    // ✅ UPDATE (using DTO to handle nested equipment object)
    public Maintenance update(Long id, MaintenanceUpdateDto dto) {

        Maintenance m = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance not found with id: " + id));

        // Update equipment if provided
        if (dto.equipment() != null && dto.equipment().id() != null) {
            Equipment eq = equipmentRepo.findById(dto.equipment().id())
                    .orElseThrow(() -> new RuntimeException(
                            "Equipment not found with id: " + dto.equipment().id()
                    ));
            m.setEquipment(eq);
        }

        // Update other fields
        if (dto.issueDescription() != null) {
            m.setIssueDescription(dto.issueDescription());
        }
        if (dto.priority() != null) {
            m.setPriority(dto.priority());
        }
        if (dto.dueDate() != null) {
            m.setDueDate(dto.dueDate());
        }
        if (dto.status() != null) {
            m.setStatus(dto.status());
        }
        if (dto.repairNote() != null) {
            m.setRepairNote(dto.repairNote());
        }
        if (dto.cost() != null) {
            m.setCost(dto.cost());
        }

        // If completed → set completed date
        if ("COMPLETED".equalsIgnoreCase(dto.status())) {
            m.setCompletedDate(LocalDate.now());
        }

        return repo.save(m);
    }

    // ✅ DELETE
    public void delete(Long id) {
        repo.deleteById(id);
    }
}