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
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private LoginAttemptService loginAttemptService;


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

        // 2️⃣ Verify username & password
        boolean success = userService.verifyUser(
                loginRequest.getUsername(),
                loginRequest.getPassword()
        );

        if (!success) {
            loginAttemptService.loginFailed(key);
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        }

        // 3️⃣ Successful login → reset failed attempts
        loginAttemptService.loginSucceeded(key);

        User user = userService
                .getUserByUsername(loginRequest.getUsername())
                .orElseThrow();

        // 4️⃣ Generate JWT
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