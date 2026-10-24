package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.model.Admin;
import com.equipment.Management.System.demo.service.AdminService;

import com.equipment.Management.System.demo.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(originPatterns = {"http://localhost:*", "https://*.choreoapps.dev", "https://*.choreo.org"})
public class AdminController {

    @Autowired
    private AdminService service;

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping("/profile")
    public ResponseEntity<Admin> getProfile() {
        return ResponseEntity.ok(service.getProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<Admin> updateProfile(@RequestBody Admin admin) {
        return ResponseEntity.ok(service.updateProfile(admin));
    }

    @PostMapping("/upload-profile")
    public ResponseEntity<String> uploadProfileImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = cloudinaryService.uploadImage(file, "profiles");
            return ResponseEntity.ok(imageUrl);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to upload image: " + e.getMessage());
        }
    }
}