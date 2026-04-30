package com.equipment.Management.System.demo.controller;

import java.util.Map;

import com.equipment.Management.System.demo.model.LoginRequest;
import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.model.UserRegistrationRequest;
import com.equipment.Management.System.demo.service.LoginAttemptService;
import com.equipment.Management.System.demo.service.UserService;
import com.equipment.Management.System.demo.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(originPatterns = "http://localhost:*")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private LoginAttemptService loginAttemptService;

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @Valid @RequestBody UserRegistrationRequest request,
            HttpServletRequest httpRequest) {

        String ip = httpRequest.getRemoteAddr();
        String key = "register:" + ip;

        if (loginAttemptService.isBlocked(key)) {
            long ms = loginAttemptService.remainingLockMs(key);
            long seconds = (ms + 999) / 1000;

            return ResponseEntity.status(429).body(Map.of(
                    "message", "Too many registration attempts. Try again in " + seconds + " seconds."
            ));
        }

        try {
            User savedUser = userService.registerUser(request);

            loginAttemptService.loginSucceeded(key);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Registration successful",
                    "id", savedUser.getId(),
                    "username", savedUser.getUsername(),
                    "email", savedUser.getEmail(),
                    "role", savedUser.getRole()
            ));

        } catch (RuntimeException e) {
            loginAttemptService.loginFailed(key);

            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "message", e.getMessage()
            ));

        } catch (Exception e) {
            loginAttemptService.loginFailed(key);

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", "Registration failed: " + e.getMessage()
            ));
        }
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {

        String ip = request.getRemoteAddr();

        // ✔ FIXED: safe username handling
        String username = loginRequest.getUsername().trim().toLowerCase();
        String key = username + ":" + ip;

        if (loginAttemptService.isBlocked(key)) {
            long ms = loginAttemptService.remainingLockMs(key);
            long seconds = (ms + 999) / 1000;

            return ResponseEntity.status(429).body(Map.of(
                    "message", "Too many failed attempts. Try again in " + seconds + " seconds."
            ));
        }

        boolean success = userService.verifyUser(
                username,
                loginRequest.getPassword()
        );

        if (!success) {
            loginAttemptService.loginFailed(key);

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        }

        loginAttemptService.loginSucceeded(key);

        User user = userService.getUserByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole()
        ));
    }
}