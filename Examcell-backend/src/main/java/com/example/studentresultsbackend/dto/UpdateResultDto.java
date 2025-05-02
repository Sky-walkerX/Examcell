package com.example.studentresultsbackend.dto;

import jakarta.validation.constraints.*;

// Used as request body for PUT /api/results/{id}
// Typically only marks and grade are updatable directly
public record UpdateResultDto(
        @NotNull(message = "Marks are required")
        @DecimalMin(value = "0.0", message = "Marks cannot be negative")
        @DecimalMax(value = "100.0", message = "Marks cannot exceed 100") // Adjust max if needed
        Double marks,

        @NotBlank(message = "Grade is required")
        String grade

        // Status is derived from marks on the backend
        // studentId, semester, subjectCode/Name usually shouldn't change via update
) {}