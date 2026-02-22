package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.model.Maintenance;
import com.equipment.Management.System.demo.service.MaintenanceService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin
public class MaintenanceController {

    private final MaintenanceService service;

    public MaintenanceController(MaintenanceService service) {
        this.service = service;
    }

    // Create
    @PostMapping
    public Maintenance create(@RequestBody Maintenance m) {
        return service.create(m);
    }

    // Get all
    @GetMapping
    public List<Maintenance> getAll() {
        return service.getAll();
    }

    // Update status
    @PutMapping("/{id}")
    public Maintenance update(@PathVariable Long id,
                              @RequestBody Maintenance m) {
        return service.update(id, m);
    }

    // Delete
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}