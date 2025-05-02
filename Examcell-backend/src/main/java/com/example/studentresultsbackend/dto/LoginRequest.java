package com.example.studentresultsbackend.dto;

import jakarta.validation.constraints.*;

// Used as request body for POST /api/auth/login
public record LoginRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Password is required")
        String password,

        @NotBlank(message = "Role is required (e.g., 'admin', 'student')")
        String role // To potentially distinguish login logic if needed
) {}