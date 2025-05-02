package com.example.studentresultsbackend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

// Used as request body for PUT /api/subjects/{code}
// Code itself is usually not updatable, used in path parameter
public record UpdateSubjectDto(
        @Size(min = 1, message = "Name cannot be empty if provided")
        String name,

        String department,

        @Min(value = 0, message = "Credits cannot be negative if provided")
        Integer credits
) {}