package com.example.studentresultsbackend.dto;

import java.time.Instant;

// Mirrors the Subject interface
public record SubjectDto(
        String code,
        String name,
        String department,
        int credits,
        Instant createdAt,
        Instant updatedAt
) {}