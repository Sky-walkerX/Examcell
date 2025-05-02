package com.example.studentresultsbackend.dto;

import java.time.Instant; // Use Instant for precise time

// This record mirrors the structure of the Student interface in api-service.ts
public record StudentDto(
        String id,
        String name,
        String email,
        String department,
        int year,
        double gpa,
        String status,
        String profileImage, // Field name matches JSON (camelCase)
        Instant createdAt,  // Use Instant, Jackson will serialize to ISO 8601 string
        Instant updatedAt
) {}