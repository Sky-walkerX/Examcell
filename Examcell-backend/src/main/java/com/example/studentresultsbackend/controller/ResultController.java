package com.example.studentresultsbackend.controller;

import com.example.studentresultsbackend.dto.*;
import com.example.studentresultsbackend.service.ResultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class ResultController {

    private static final Logger logger = LoggerFactory.getLogger(ResultController.class);
    private final ResultService resultService;

    // Get ALL results - Use with caution, might return large dataset
    @GetMapping
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ResultDto>> getAllResults() {
        logger.debug("Request received for getting all results");
        List<ResultDto> results = resultService.getAllResults();
        return ResponseEntity.ok(results);
    }

    @GetMapping("/student/{studentId}")
    // @PreAuthorize("hasRole('ADMIN') or #studentId == authentication.principal.id") // Admin or the student
    public ResponseEntity<List<ResultDto>> getResultsByStudentId(@PathVariable String studentId) {
        logger.debug("Request received for getting results for student ID: {}", studentId);
        List<ResultDto> results = resultService.getResultsByStudentId(studentId);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/semester/{semester}")
    // @PreAuthorize("hasRole('ADMIN')") // Typically an admin function
    public ResponseEntity<List<ResultDto>> getResultsBySemester(@PathVariable String semester) {
        logger.debug("Request received for getting results for semester: {}", semester);
        List<ResultDto> results = resultService.getResultsBySemester(semester);
        return ResponseEntity.ok(results);
    }

    // No Get /results/{id} as it wasn't in api-service, add if needed for editing view

    @PostMapping
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResultDto> createResult(@Valid @RequestBody CreateResultDto createResultDto) {
        logger.info("Request received to create result for student ID: {}, subject: {}", createResultDto.studentId(), createResultDto.subjectCode());
        ResultDto createdResult = resultService.createResult(createResultDto);
        // Exceptions (e.g., student/subject not found) handled globally
        return ResponseEntity.status(HttpStatus.CREATED).body(createdResult);
    }

    @PutMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResultDto> updateResult(@PathVariable Long id, @Valid @RequestBody UpdateResultDto updateResultDto) {
        logger.info("Request received to update result with ID: {}", id);
        ResultDto updatedResult = resultService.updateResult(id, updateResultDto);
        // ResourceNotFoundException handled globally
        return ResponseEntity.ok(updatedResult);
    }

    @DeleteMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResult(@PathVariable Long id) {
        logger.warn("Request received to delete result with ID: {}", id);
        resultService.deleteResult(id);
        // ResourceNotFoundException handled globally
        return ResponseEntity.noContent().build();
    }
}