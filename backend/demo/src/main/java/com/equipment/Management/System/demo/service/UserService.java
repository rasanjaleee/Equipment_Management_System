package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.model.UserRegistrationRequest;
import com.equipment.Management.System.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ================= REGISTER USER =================
    public User registerUser(UserRegistrationRequest request) {

        String normalizedUsername = request.getUsername().trim().toLowerCase();
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Email already exists");
        }

        if (userRepository.existsByUsername(normalizedUsername)) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(normalizedUsername);
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("STUDENT");

        return userRepository.save(user);
    }

    // ================= LOGIN VERIFY =================
    public boolean verifyUser(String username, String password) {

        String normalizedUsername = username.trim().toLowerCase();

        Optional<User> userOptional = userRepository.findByUsername(normalizedUsername);

        System.out.println("LOGIN DEBUG -------------------");
        System.out.println("Username: " + normalizedUsername);
        System.out.println("User found: " + userOptional.isPresent());

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            System.out.println("DB Password: " + user.getPassword());
            System.out.println("Input Password: " + password);

            boolean match = passwordEncoder.matches(password, user.getPassword());

            System.out.println("Password Match: " + match);

            return match;
        }

        return false;
    }

    // ================= GET USER =================
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username.trim().toLowerCase());
    }
}