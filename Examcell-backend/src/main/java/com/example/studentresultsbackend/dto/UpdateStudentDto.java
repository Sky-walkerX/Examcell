package com.example.studentresultsbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

// Used for updating a student. Fields are optional.
// Validation applies only if the field is provided.
public record UpdateStudentDto(
        @Size(min = 1, message = "Name cannot be empty if provided")
        String name, // Null means don't update

        @Email(message = "Invalid email format if provided")
        String email, // Null means don't update

        String department, // Null means don't update

        @Min(value = 1, message = "Year must be at least 1 if provided")
        Integer year, // Null means don't update

        String status, // Null means don't update

        String profileImage // Null means don't update (or empty string to clear?)
) {}