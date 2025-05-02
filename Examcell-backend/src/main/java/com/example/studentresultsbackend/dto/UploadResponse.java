package com.example.studentresultsbackend.dto;

// Response sent back after a CSV upload attempt
public record UploadResponse(
        boolean success,
        Integer recordsProcessed, // Nullable if success is false and processing didn't start/finish
        String message            // Optional success or error message
) {}