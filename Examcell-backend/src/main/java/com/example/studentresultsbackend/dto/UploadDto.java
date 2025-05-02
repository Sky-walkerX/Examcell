package com.example.studentresultsbackend.dto;

import java.time.Instant;

// Mirrors the Upload interface
public record UploadDto(
        String id, // UUID as String
        String name,
        String type,
        int records,
        String status,
        Instant createdAt,
        Instant updatedAt
) {}