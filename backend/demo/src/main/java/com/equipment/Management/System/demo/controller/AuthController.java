package com.equipment.Management.System.demo.controller;
import java.util.Map;

import com.equipment.Management.System.demo.model.LoginRequest;
import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.model.UserRegistrationRequest;
import com.equipment.Management.System.demo.service.AdminSettingService;
import com.equipment.Management.System.demo.service.LoginAttemptService;
import com.equipment.Management.System.demo.service.UserService;
import com.equipment.Management.System.demo.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/auth")
@CrossOrigin(originPatterns = {"http://localhost:*", "https://*.choreoapps.dev", "https://*.choreo.org"})
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private LoginAttemptService loginAttemptService;

    @Autowired
    private AdminSettingService adminSettingService;


    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationRequest request,
                                          HttpServletRequest httpRequest) {

        // 1️⃣ Get client IP and create rate limit key
        String ip = httpRequest.getRemoteAddr();
        String key = "register:" + ip;  // Rate limit by IP for registration

        // 2️⃣ Check if user is temporarily blocked
        if (loginAttemptService.isBlocked(key)) {
            long ms = loginAttemptService.remainingLockMs(key);
            long seconds = (ms + 999) / 1000;

            return ResponseEntity.status(429).body(Map.of(
                    "message", "Too many registration attempts. Try again in " + seconds + " seconds."
            ));
        }

        try {
            // 3️⃣ Attempt registration
            User savedUser = userService.registerUser(request);

            // 4️⃣ Registration successful → reset failed attempts
            loginAttemptService.loginSucceeded(key);

            // ✅ Return safe data only (NO password)
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Registration successful",
                    "id", savedUser.getId(),
                    "username", savedUser.getUsername(),
                    "email", savedUser.getEmail(),
                    "role", savedUser.getRole()
            ));
        } catch (RuntimeException e) {
            // 5️⃣ Handle duplicates (email/username already exists)
            loginAttemptService.loginFailed(key);

            String errorMsg = e.getMessage();
            if (errorMsg.contains("already exists")) {
                return ResponseEntity.status(409).body(Map.of(
                        "message", errorMsg
                ));
            }

            return ResponseEntity.status(400).body(Map.of(
                    "message", "Registration failed: " + errorMsg
            ));
        } catch (Exception e) {
            // 6️⃣ Handle unexpected errors
            loginAttemptService.loginFailed(key);
            return ResponseEntity.status(400).body(Map.of(
                    "message", "Registration failed: " + e.getMessage()
            ));
        }
    }



    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest,
                                       HttpServletRequest request) {

        String ip = request.getRemoteAddr();
        String key = loginRequest.getUsername().toLowerCase() + ":" + ip;

        // 1️⃣ Check if user is temporarily blocked
        if (loginAttemptService.isBlocked(key)) {
            long ms = loginAttemptService.remainingLockMs(key);
            long seconds = (ms + 999) / 1000;

            return ResponseEntity.status(429).body(Map.of(
                    "message", "Too many failed attempts. Try again in " + seconds + " seconds."
            ));
        }

        // 2️⃣ Verify username & password and retrieve user in a single database lookup
        java.util.Optional<User> userOpt = userService.authenticateUser(
                loginRequest.getUsername(),
                loginRequest.getPassword()
        );

        if (userOpt.isEmpty()) {
            loginAttemptService.loginFailed(key);
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        }

        // 3️⃣ Successful login → reset failed attempts
        loginAttemptService.loginSucceeded(key);

        User user = userOpt.get();

        // 4️⃣ Check maintenance mode — block non-admin users from logging in
        if (adminSettingService.isMaintenanceActive()) {
            String role = user.getRole() != null ? user.getRole().toUpperCase() : "";
            boolean isAdmin = role.equals("ROLE_ADMIN") || role.equals("ROLE_SUPER_ADMIN")
                    || role.equals("ADMIN") || role.equals("SUPER_ADMIN");

            if (!isAdmin) {
                String maintenanceMessage = adminSettingService.getSettingsDTO().getMaintenanceMessage();
                if (maintenanceMessage == null || maintenanceMessage.isBlank()) {
                    maintenanceMessage = "The system is currently undergoing scheduled maintenance. Please check back later.";
                }
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                        "maintenance", true,
                        "message", maintenanceMessage
                ));
            }
        }

        // Save successful login time
        user.setLastLogin(LocalDateTime.now());
        userService.saveUser(user);

        // Generate JWT with configured session timeout
        int sessionTimeout = adminSettingService.getSessionTimeoutMinutes();
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole(), sessionTimeout);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "mustChangePassword", user.isMustChangePassword(),
                "sessionTimeoutMinutes", sessionTimeout
        ));
    }
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username") != null ? request.get("username").trim().toLowerCase() : "";
            String oldPassword = request.get("oldPassword") != null ? request.get("oldPassword").trim() : "";
            String newPassword = request.get("newPassword") != null ? request.get("newPassword").trim() : "";

            if (username.isBlank() || oldPassword.isBlank() || newPassword.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "All fields are required"));
            }

            User user = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!userService.verifyUser(username, oldPassword)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Current password is incorrect"));
            }

            user.setPassword(userService.encodePassword(newPassword));
            user.setMustChangePassword(false);
            userService.saveUser(user);

            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Failed to change password: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok(Map.of("status", "UP", "message", "Backend service is active"));
    }

    /**
     * Refresh JWT - called by the client when the user is still active but the
     * existing token is close to expiry. The current (still-valid) token is
     * validated, then a fresh token with a renewed expiry window is issued.
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "No token provided"));
        }

        String token = authHeader.substring(7);
        try {
            String username = jwtUtil.extractUsername(token);

            if (username == null || !jwtUtil.validateToken(token, username)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Token is invalid or expired"));
            }

            // Verify the user still exists in the system
            java.util.Optional<User> userOpt = userService.getUserByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "User not found"));
            }

            User user = userOpt.get();

            // Check maintenance mode — block non-admin users from refreshing token
            if (adminSettingService.isMaintenanceActive()) {
                String role = user.getRole() != null ? user.getRole().toUpperCase() : "";
                boolean isAdmin = role.equals("ROLE_ADMIN") || role.equals("ROLE_SUPER_ADMIN")
                        || role.equals("ADMIN") || role.equals("SUPER_ADMIN");

                if (!isAdmin) {
                    String maintenanceMessage = adminSettingService.getSettingsDTO().getMaintenanceMessage();
                    if (maintenanceMessage == null || maintenanceMessage.isBlank()) {
                        maintenanceMessage = "The system is currently undergoing scheduled maintenance. Please check back later.";
                    }
                    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                            "maintenance", true,
                            "message", maintenanceMessage
                    ));
                }
            }

            int sessionTimeout = adminSettingService.getSessionTimeoutMinutes();
            String newToken = jwtUtil.generateToken(user.getUsername(), user.getRole(), sessionTimeout);

            return ResponseEntity.ok(Map.of(
                    "token", newToken,
                    "sessionTimeoutMinutes", sessionTimeout
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token refresh failed"));
        }
    }

}