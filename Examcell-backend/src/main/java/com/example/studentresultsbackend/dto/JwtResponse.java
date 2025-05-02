package com.example.studentresultsbackend.dto;

// Response sent back after successful login
public record JwtResponse(
        String token, // The JWT access token
        String id,    // User's ID (Admin or Student)
        String email, // User's email
        String name,  // User's name
        String role   // User's role ("admin" or "student")
) {}