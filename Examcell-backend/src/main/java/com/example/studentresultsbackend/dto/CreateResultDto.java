package com.example.studentresultsbackend.dto;

import jakarta.validation.constraints.*;

// Used as the request body for POST /api/results
public record CreateResultDto(
        @NotBlank(message = "Student ID is required")
        String studentId,

        @NotBlank(message = "Semester is required")
        String semester,

        @NotBlank(message = "Subject Code is required")
        String subjectCode,

        @NotBlank(message = "Subject Name is required")
        String subjectName, // Frontend sends this, backend might ignore if looking up by code

        @NotNull(message = "Marks are required")
        @DecimalMin(value = "0.0", message = "Marks cannot be negative")
        @DecimalMax(value = "100.0", message = "Marks cannot exceed 100") // Adjust max if needed
        Double marks,

        @NotBlank(message = "Grade is required")
        String grade // Frontend sends calculated grade, backend might recalculate/validate

        // Status is derived from marks on the backend
) {}