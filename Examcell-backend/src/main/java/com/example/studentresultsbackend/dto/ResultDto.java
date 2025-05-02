package com.example.studentresultsbackend.dto;

import java.time.Instant;

// Mirrors the Result interface
public record ResultDto(
        Long id, // Use Long for the numeric ID from the Result entity
        String studentId,
        String semester,
        String subjectCode,
        String subjectName,
        double marks,
        String grade,
        String status,
        Instant createdAt,
        Instant updatedAt
) {}