package com.example.studentresultsbackend.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException; // Base class for auth errors
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice // Makes this class applicable across the whole application (all controllers)
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // --- Custom Exception Handlers ---

    /**
     * Handles ResourceNotFoundException (HTTP 404 Not Found).
     * Triggered when a requested resource (e.g., student, result by ID) doesn't exist.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        log.warn("Resource not found: {} (Path: {})", ex.getMessage(), request.getDescription(false));
        Map<String, Object> body = Map.of(
                "status", HttpStatus.NOT_FOUND.value(),
                "error", HttpStatus.NOT_FOUND.getReasonPhrase(),
                "message", ex.getMessage(), // Use message from the exception
                "path", request.getDescription(false) // Path where error occurred
        );
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    /**
     * Handles BadRequestException (HTTP 400 Bad Request).
     * Triggered for general client-side errors like invalid input that isn't caught by validation,
     * or violations of business rules (e.g., trying to delete something that shouldn't be deleted).
     */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Object> handleBadRequestException(BadRequestException ex, WebRequest request) {
        log.warn("Bad request: {} (Path: {})", ex.getMessage(), request.getDescription(false));
        Map<String, Object> body = Map.of(
                "status", HttpStatus.BAD_REQUEST.value(),
                "error", HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "message", ex.getMessage(),
                "path", request.getDescription(false)
        );
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // --- Spring Security Exception Handlers ---

    /**
     * Handles AuthenticationException (HTTP 401 Unauthorized).
     * Catches exceptions related to failed authentication (e.g., BadCredentialsException).
     * Note: AuthEntryPointJwt usually handles the initial trigger, but this can catch others.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Object> handleAuthenticationException(AuthenticationException ex, WebRequest request) {
        log.error("Authentication failed: {} (Path: {})", ex.getMessage(), request.getDescription(false));
        // Log stack trace for debugging if needed: log.debug("Authentication exception details", ex);
        Map<String, Object> body = Map.of(
                "status", HttpStatus.UNAUTHORIZED.value(),
                "error", HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                "message", "Authentication failed: " + ex.getMessage(), // Provide specific auth error
                "path", request.getDescription(false)
        );
        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handles AccessDeniedException (HTTP 403 Forbidden).
     * Triggered when an authenticated user tries to access a resource they don't have permission for
     * (e.g., based on roles defined in SecurityConfig or with @PreAuthorize).
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        log.warn("Access denied: {} (Path: {})", ex.getMessage(), request.getDescription(false));
        Map<String, Object> body = Map.of(
                "status", HttpStatus.FORBIDDEN.value(),
                "error", HttpStatus.FORBIDDEN.getReasonPhrase(),
                "message", "Access Denied: You do not have permission to access this resource.",
                // "detail": ex.getMessage(), // Optionally include original message
                "path", request.getDescription(false)
        );
        return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
    }


    // --- Validation Error Handler (Overrides default) ---

    /**
     * Handles MethodArgumentNotValidException (HTTP 400 Bad Request).
     * Triggered when request body validation (using @Valid and annotations like @NotBlank) fails.
     * Provides a more structured error response listing all validation failures.
     */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {

        Map<String, Object> body = new HashMap<>();
        body.put("status", status.value()); // Use the status provided (usually 400)
        body.put("error", "Validation Failed");
        body.put("message", "Input validation failed. Please check the errors.");
        body.put("path", request.getDescription(false));

        // Extract field-specific errors
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField, // Field name
                        fieldError -> fieldError.getDefaultMessage() != null ? fieldError.getDefaultMessage() : "Invalid value", // Error message
                        (msg1, msg2) -> msg1 + "; " + msg2 // Handle multiple errors on same field
                ));
        body.put("errors", fieldErrors);

        log.warn("Validation failed: {} (Path: {})", fieldErrors, request.getDescription(false));

        return new ResponseEntity<>(body, headers, status);
    }


    // --- Generic Catch-All Handler ---

    /**
     * Handles any other Exception not caught by more specific handlers (HTTP 500 Internal Server Error).
     * This is a safety net for unexpected errors.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGenericException(Exception ex, WebRequest request) {
        log.error("An unexpected error occurred: {} (Path: {})", ex.getMessage(), request.getDescription(false), ex); // Log stack trace for unexpected errors
        Map<String, Object> body = Map.of(
                "status", HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "error", HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                "message", "An internal server error occurred. Please contact support if the problem persists.",
                "path", request.getDescription(false)
        );
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}