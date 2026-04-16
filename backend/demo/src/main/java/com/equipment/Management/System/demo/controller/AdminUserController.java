package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminUserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserController(UserRepository userRepository,
                               PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            String username = user.getUsername() != null ? user.getUsername().trim().toLowerCase() : "";
            String email = user.getEmail() != null ? user.getEmail().trim().toLowerCase() : "";
            String password = user.getPassword() != null ? user.getPassword().trim() : "";
            String role = user.getRole() != null ? user.getRole().trim().toUpperCase() : "";

            if (username.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username is required"));
            }

            if (email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
            }

            if (password.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Temporary password is required"));
            }

            if (role.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Role is required"));
            }

            if (!(role.equals("ADMIN") || role.equals("TECHNICIAN") || role.equals("STUDENT"))) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Invalid role. Allowed roles: ADMIN, TECHNICIAN, STUDENT"
                ));
            }

            if (userRepository.existsByUsername(username)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Username already exists"));
            }

            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Email already exists"));
            }

            User newUser = new User();
            newUser.setUsername(username);
            newUser.setEmail(email);
            newUser.setPassword(passwordEncoder.encode(password));
            newUser.setRole(role);
            newUser.setMustChangePassword(true);

            User savedUser = userRepository.save(newUser);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "User created successfully with temporary password",
                    "id", savedUser.getId(),
                    "username", savedUser.getUsername(),
                    "email", savedUser.getEmail(),
                    "role", savedUser.getRole(),
                    "mustChangePassword", savedUser.isMustChangePassword()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Failed to create user: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Failed to fetch users: " + e.getMessage()
            ));
        }
    }
}