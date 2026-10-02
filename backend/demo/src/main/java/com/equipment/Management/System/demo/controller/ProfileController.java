package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.repository.UserRepository;
import com.equipment.Management.System.demo.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.equipment.Management.System.demo.service.CloudinaryService;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(originPatterns = {"http://localhost:*", "https://*.choreoapps.dev", "https://*.choreo.org"})
public class ProfileController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final CloudinaryService cloudinaryService;

    public ProfileController(UserRepository userRepository,
                             UserService userService,
                             CloudinaryService cloudinaryService) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.cloudinaryService = cloudinaryService;
    }
    @GetMapping
    public ResponseEntity<?> getMyProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            User user = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> profile = new java.util.HashMap<>();

            profile.put("id", user.getId());
            profile.put("username", user.getUsername());
            profile.put("email", user.getEmail());
            profile.put("role", user.getRole());
            profile.put("mustChangePassword", user.isMustChangePassword());
            profile.put("lastLogin", user.getLastLogin());
            profile.put("profileImage", user.getProfileImage());

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Failed to load profile: " + e.getMessage()
            ));
        }
    }

    @PutMapping("/email")
    public ResponseEntity<?> updateEmail(@RequestBody Map<String, String> request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            String newEmail = request.get("email") != null
                    ? request.get("email").trim().toLowerCase()
                    : "";

            if (newEmail.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
            }

            User user = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!user.getEmail().equalsIgnoreCase(newEmail) &&
                    userRepository.existsByEmail(newEmail)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Email already exists"));
            }

            user.setEmail(newEmail);
            userService.saveUser(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Email updated successfully",
                    "email", user.getEmail()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Failed to update email: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/photo")
    public ResponseEntity<?> uploadProfilePhoto(
            @RequestParam("photo") MultipartFile photo) {

        try {
            Authentication authentication =
                    SecurityContextHolder.getContext().getAuthentication();

            String username = authentication.getName();

            User user = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (photo == null || photo.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Please select an image"));
            }

            String imageUrl =
                    cloudinaryService.uploadImage(photo, "profiles");

            user.setProfileImage(imageUrl);
            userService.saveUser(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Profile photo updated successfully",
                    "profileImage", imageUrl
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Failed to upload profile photo: " + e.getMessage()
            ));
        }
    }
}