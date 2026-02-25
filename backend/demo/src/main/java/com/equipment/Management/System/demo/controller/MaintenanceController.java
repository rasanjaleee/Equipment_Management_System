package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.model.Maintenance;
import com.equipment.Management.System.demo.model.MaintenanceCreateDto;
import com.equipment.Management.System.demo.model.MaintenanceResponseDto;
import com.equipment.Management.System.demo.model.MaintenanceUpdateDto;
import com.equipment.Management.System.demo.service.MaintenanceService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping(
        value = "/api/maintenance",
        produces = MediaType.APPLICATION_JSON_VALUE
)
public class MaintenanceController {

    private final MaintenanceService service;

    public MaintenanceController(MaintenanceService service) {
        this.service = service;
    }

    // ✅ Create (POST /api/maintenance) - uses DTO
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Maintenance> create(@RequestBody MaintenanceCreateDto dto) {
        Maintenance created = service.create(dto);
        URI location = URI.create("/api/maintenance/" + created.getId());
        return ResponseEntity.created(location).body(created); // 201
    }

    // ✅ Get all (GET /api/maintenance)
    @GetMapping
    public ResponseEntity<List<MaintenanceResponseDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // ✅ Update (PUT /api/maintenance/{id}) - NOW USES DTO
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Maintenance> update(@PathVariable Long id,
                                              @RequestBody MaintenanceUpdateDto dto) {
        Maintenance updated = service.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    // ✅ Delete (DELETE /api/maintenance/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build(); // 204
    }

    // ✅ Debug endpoint
    @GetMapping("/me")
    public Object me(org.springframework.security.core.Authentication auth) {
        return auth;
    }
}