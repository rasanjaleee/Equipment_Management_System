package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.model.UserRegistrationRequest;
import com.equipment.Management.System.demo.service.UserService;
import com.equipment.Management.System.demo.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationRequest request) {
        try {
            User savedUser = userService.registerUser(request);
            return ResponseEntity
                    .status(HttpStatus.CREATED)   // 🔹 201 Created
                    .body(savedUser);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body("Registration failed: " + e.getMessage());
        }
    }


    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        boolean success = userService.verifyUser(user.getUsername(), user.getPassword());
        if (success) {
            String token = jwtUtil.generateToken(user.getUsername());
            return ResponseEntity.ok("Bearer"+ token);
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }
}
