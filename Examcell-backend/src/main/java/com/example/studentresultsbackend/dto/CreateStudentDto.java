package com.example.studentresultsbackend.dto;

import jakarta.validation.constraints.*;

// Used as the request body when creating a new student via POST /api/students
// Includes validation annotations
public record CreateStudentDto(
        @NotBlank(message = "Student ID is required")
        @Size(max = 50, message = "Student ID cannot exceed 50 characters") // Example size limit
        String id, // Assuming the ID (e.g., STU2024001) is entered in the form

        @NotBlank(message = "Student name is required")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Department is required")
        String department,

        @NotNull(message = "Year is required")
        @Min(value = 1, message = "Year must be at least 1")
        Integer year,

        // GPA is calculated on the backend based on results
        // Status defaults to 'Active' on the backend service layer

        String profileImage // Optional field
) {}