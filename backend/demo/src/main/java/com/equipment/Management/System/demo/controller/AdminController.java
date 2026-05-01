package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.model.Admin;
import com.equipment.Management.System.demo.service.AdminService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private AdminService service;

    @GetMapping("/profile")
    public ResponseEntity<Admin> getProfile() {
        return ResponseEntity.ok(service.getProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<Admin> updateProfile(@RequestBody Admin admin) {
        return ResponseEntity.ok(service.updateProfile(admin));
    }
}