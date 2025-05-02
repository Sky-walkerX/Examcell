// AuthService.java
package com.example.studentresultsbackend.service;

import com.example.studentresultsbackend.dto.JwtResponse;
import com.example.studentresultsbackend.dto.LoginRequest;
// No need for Admin/Student Repositories here if UserDetailsImpl holds the name
// import com.example.studentresultsbackend.entity.Admin;
// import com.example.studentresultsbackend.exception.ResourceNotFoundException;
// import com.example.studentresultsbackend.repository.AdminRepository;
import com.example.studentresultsbackend.security.JwtUtils;
import com.example.studentresultsbackend.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    // Remove repository injection if name is fetched from UserDetailsImpl
    // private final AdminRepository adminRepository;

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        logger.info("Attempting authentication for user: {}", loginRequest.email());

        // --- REMOVE/COMMENT OUT THIS ROLE CHECK ---
        /*
        if (!"admin".equalsIgnoreCase(loginRequest.role())) {
             logger.warn("Login attempt rejected: Invalid role '{}' for user {}", loginRequest.role(), loginRequest.email());
             throw new BadCredentialsException("Invalid role specified. Only 'admin' role is supported for direct login.");
        }
        */
        // -----------------------------------------

        try {
            // AuthenticationManager will use UserDetailsServiceImpl to load the user (admin or student)
            // and DaoAuthenticationProvider to compare the hashed passwords
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            // Get details from the authenticated principal
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            // Optional: Verify the role found matches the role requested in LoginRequest
            // This adds an extra layer of check specific to your form's role selection
            if (!userDetails.getRole().equalsIgnoreCase(loginRequest.role())) {
                logger.warn("Authentication successful for {} but requested role '{}' does not match actual role '{}'",
                        loginRequest.email(), loginRequest.role(), userDetails.getRole());
                // Decide how to handle: throw error, ignore, log? Let's throw for clarity.
                throw new BadCredentialsException("Login successful but role mismatch.");
            }


            logger.info("Authentication successful for user: {} with role: {}", loginRequest.email(), userDetails.getRole());

            // Return the response DTO using details directly from UserDetailsImpl
            return new JwtResponse(
                    jwt,
                    userDetails.getId(),    // User ID (String)
                    userDetails.getEmail(), // Email
                    userDetails.getName(),  // Name (should be populated in UserDetailsImpl)
                    userDetails.getRole()   // Role ("admin" or "student")
            );

        } catch (AuthenticationException e) {
            logger.error("Authentication failed for user {}: {}", loginRequest.email(), e.getMessage());
            // Use a generic message for security, don't leak details like "user not found" vs "bad password"
            throw new BadCredentialsException("Invalid credentials.", e);
        }
    }
}