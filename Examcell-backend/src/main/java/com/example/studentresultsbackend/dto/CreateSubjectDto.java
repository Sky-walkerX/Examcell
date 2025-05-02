package com.example.studentresultsbackend.dto;

import jakarta.validation.constraints.*;

// Used as request body for POST /api/subjects
public record CreateSubjectDto(
        @NotBlank(message = "Subject code is required")
        @Size(max = 20, message = "Subject code cannot exceed 20 characters")
        String code,

        @NotBlank(message = "Subject name is required")
        String name,

        @NotBlank(message = "Department is required")
        String department,

        @NotNull(message = "Credits are required")
        @Min(value = 0, message = "Credits cannot be negative")
        Integer credits
) {}