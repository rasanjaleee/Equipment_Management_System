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
    private final NotificationService notificationService;

    public MaintenanceService(MaintenanceRepository repo,
                              EquipmentRepository equipmentRepo,
                              NotificationService notificationService) {
        this.repo = repo;
        this.equipmentRepo = equipmentRepo;
        this.notificationService = notificationService;
    }

    // ================= CREATE MAINTENANCE =================
    public Maintenance create(MaintenanceCreateDto dto) {

        if (dto == null || dto.equipmentId() == null) {
            throw new RuntimeException("equipmentId is required");
        }

        Equipment eq = equipmentRepo.findById(dto.equipmentId())
                .orElseThrow(() -> new RuntimeException(
                        "Equipment not found with id: " + dto.equipmentId()
                ));

        // ✅ FIXED: removed builder()
        Maintenance m = new Maintenance();
        m.setEquipment(eq);
        m.setIssueDescription(dto.issueDescription());
        m.setPriority(dto.priority());
        m.setDueDate(dto.dueDate());

        Maintenance saved = repo.save(m);

        // 🔔 NOTIFICATION
        notificationService.createNotification(
                null,
                "New Maintenance Created",
                "Maintenance added for equipment: " + eq.getEquipmentName(),
                "MAINTENANCE",
                saved.getId(),
                "MAINTENANCE",
                "HIGH"
        );

        return saved;
    }

    // ================= GET ALL =================
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

    // ================= UPDATE MAINTENANCE =================
    public Maintenance update(Long id, MaintenanceUpdateDto dto) {

        Maintenance m = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance not found with id: " + id));

        String oldStatus = m.getStatus();

        if (dto.equipment() != null && dto.equipment().id() != null) {
            Equipment eq = equipmentRepo.findById(dto.equipment().id())
                    .orElseThrow(() -> new RuntimeException(
                            "Equipment not found with id: " + dto.equipment().id()
                    ));
            m.setEquipment(eq);
        }

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

        // If completed → set date
        if ("COMPLETED".equalsIgnoreCase(dto.status())) {
            m.setCompletedDate(LocalDate.now());
        }

        Maintenance updated = repo.save(m);

        // 🔔 STATUS CHANGE NOTIFICATION
        if (dto.status() != null && !dto.status().equalsIgnoreCase(oldStatus)) {

            String priority = "LOW";

            if ("COMPLETED".equalsIgnoreCase(dto.status())) {
                priority = "NORMAL";
            }

            if ("PENDING".equalsIgnoreCase(dto.status())) {
                priority = "HIGH";
            }

            notificationService.createNotification(
                    null,
                    "Maintenance Status Updated",
                    "Status changed from " + oldStatus + " to " + dto.status() +
                            " for equipment: " + m.getEquipment().getEquipmentName(),
                    "MAINTENANCE",
                    updated.getId(),
                    "MAINTENANCE",
                    priority
            );
        }

        return updated;
    }

    // ================= DELETE =================
    public void delete(Long id) {

        Maintenance m = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance not found"));

        repo.deleteById(id);

        // 🔔 DELETE NOTIFICATION
        notificationService.createNotification(
                null,
                "Maintenance Deleted",
                "Maintenance removed for equipment: " + m.getEquipment().getEquipmentName(),
                "MAINTENANCE",
                id,
                "MAINTENANCE",
                "HIGH"
        );
    }
}