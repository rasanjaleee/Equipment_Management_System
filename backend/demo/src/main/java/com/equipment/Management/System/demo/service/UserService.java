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

    // ✅ Registration with normalized username and email
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
        user.setMustChangePassword(false);

        return userRepository.save(user);
    }

    // ✅ Login verification with normalized username
    public boolean verifyUser(String username, String password) {

        String normalizedUsername = username.trim().toLowerCase();

        Optional<User> userOptional = userRepository.findByUsername(normalizedUsername);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            return passwordEncoder.matches(password, user.getPassword());
        }
        return false;
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username.trim().toLowerCase());
    }

    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }
}