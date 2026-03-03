package com.equipment.Management.System.demo.security;

import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

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
            admin.setUsername("admin"); // ✅ must use setUsername
            admin.setEmail("admin@lab.com");
            admin.setPassword(passwordEncoder.encode("admin123")); // 🔐 hashed
            admin.setRole("ADMIN");

            userRepository.save(admin);
            System.out.println("✅ Admin user created");
        }
    }
}