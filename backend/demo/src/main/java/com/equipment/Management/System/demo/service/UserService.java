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

    public User registerUser(UserRegistrationRequest request) {
        // You can add validations here (check if username/email exists)
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // 🔹 encode password
        user.setRole("STUDENT"); // default role
        return userRepository.save(user);
    }


    public boolean verifyUser(String username, String password){
        Optional<User> userOptional = userRepository.findByUsername(username);
        if(userOptional.isPresent()){
            User user = userOptional.get();
            return passwordEncoder.matches(password,user.getPassword());
        }
        return false;
    }
}
