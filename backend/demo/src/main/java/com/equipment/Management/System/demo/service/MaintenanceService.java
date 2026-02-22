package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.model.Maintenance;
import com.equipment.Management.System.demo.repository.MaintenanceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MaintenanceService {

    private final MaintenanceRepository repo;

    public MaintenanceService(MaintenanceRepository repo) {
        this.repo = repo;
    }

    // Create maintenance
    public Maintenance create(Maintenance m) {
        return repo.save(m);
    }

    // Get all
    public List<Maintenance> getAll() {
        return repo.findAll();
    }

    // Update status + repair note + cost
    public Maintenance update(Long id, Maintenance updated) {
        Maintenance m = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        m.setStatus(updated.getStatus());
        m.setRepairNote(updated.getRepairNote());
        m.setCost(updated.getCost());

        if ("COMPLETED".equalsIgnoreCase(updated.getStatus())) {
            m.setCompletedDate(LocalDate.now());
        }

        return repo.save(m);
    }

    // Delete
    public void delete(Long id) {
        repo.deleteById(id);
    }
}