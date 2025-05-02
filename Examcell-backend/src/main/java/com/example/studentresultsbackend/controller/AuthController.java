package com.example.studentresultsbackend.controller;

import com.example.studentresultsbackend.dto.JwtResponse;
import com.example.studentresultsbackend.dto.LoginRequest;
import com.example.studentresultsbackend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth") // Base path for authentication endpoints
@RequiredArgsConstructor
// @CrossOrigin(origins = "*", maxAge = 3600) // Allow all origins ONLY for login if needed, but global config is generally better.
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // AuthService handles the authentication logic and throws exceptions on failure
        // GlobalExceptionHandler will catch authentication exceptions (like BadCredentialsException)
        // and return appropriate error responses (e.g., 401 Unauthorized).
        logger.info("Received login request for email: {}", loginRequest.email());
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        logger.info("Login successful for email: {}", loginRequest.email());
        return ResponseEntity.ok(jwtResponse);
    }

    // Potential future endpoints like /register, /refresh-token could go here
}