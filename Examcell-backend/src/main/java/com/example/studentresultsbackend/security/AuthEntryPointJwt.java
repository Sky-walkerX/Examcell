package com.example.studentresultsbackend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component // Marks this as a Spring-managed component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {

    private static final Logger logger = LoggerFactory.getLogger(AuthEntryPointJwt.class);

    // This method is called whenever an exception is thrown due to an unauthenticated user
    // trying to access a resource that requires authentication.
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException, ServletException {

        // Log the unauthorized access attempt
        logger.error("Unauthorized error: {}. Path: {}", authException.getMessage(), request.getServletPath());
        // logger.debug("Unauthorized error details", authException); // Log full stack trace if needed

        // Set the response content type to application/json
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        // Set the HTTP status code to 401 Unauthorized
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        // Create a structured JSON error response body
        final Map<String, Object> body = new HashMap<>();
        body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        body.put("error", "Unauthorized");
        body.put("message", "Authentication required. Please log in or provide a valid token.");
        // Include the exception message for more detail (optional, consider security implications)
        // body.put("detail", authException.getMessage());
        body.put("path", request.getServletPath()); // The path the user tried to access

        // Use Jackson ObjectMapper to write the map as JSON to the response output stream
        final ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(response.getOutputStream(), body);
    }
}