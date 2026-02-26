package com.equipment.Management.System.demo.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    // NO custom getters or setters
    // Lombok @Data generates getUsername(), getPassword(), setUsername(), setPassword()
}