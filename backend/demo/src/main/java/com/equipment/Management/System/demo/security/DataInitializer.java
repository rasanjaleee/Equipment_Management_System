package com.equipment.Management.System.demo.security;

import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import jakarta.annotation.PostConstruct;

@Configuration
public class DataInitializer {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void createAdminUser() {

        if (userRepository.findByUsername("admin").isEmpty()) {

            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@lab.com");
            admin.setPassword(passwordEncoder.encode("admin123")); // 🔐
            admin.setRole("ADMIN");

            userRepository.save(admin);
            System.out.println("✅ Admin user created");
        }
    }
}