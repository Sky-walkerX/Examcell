package com.example.studentresultsbackend.controller;

import com.example.studentresultsbackend.dto.*;
import com.example.studentresultsbackend.service.SubjectService;
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
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private static final Logger logger = LoggerFactory.getLogger(SubjectController.class);
    private final SubjectService subjectService;

    @GetMapping
    // @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT')") // Allow students too?
    public ResponseEntity<List<SubjectDto>> getAllSubjects() {
        logger.debug("Request received for getting all subjects");
        List<SubjectDto> subjects = subjectService.getAllSubjects();
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/{code}")
    // @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT')")
    public ResponseEntity<SubjectDto> getSubjectByCode(@PathVariable String code) {
        logger.debug("Request received for getting subject by code: {}", code);
        SubjectDto subject = subjectService.getSubjectByCode(code);
        // ResourceNotFoundException handled globally
        return ResponseEntity.ok(subject);
    }

    @PostMapping
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SubjectDto> createSubject(@Valid @RequestBody CreateSubjectDto createSubjectDto) {
        logger.info("Request received to create subject with code: {}", createSubjectDto.code());
        SubjectDto createdSubject = subjectService.createSubject(createSubjectDto);
        // BadRequestException handled globally
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSubject);
    }

    @PutMapping("/{code}")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SubjectDto> updateSubject(@PathVariable String code, @Valid @RequestBody UpdateSubjectDto updateSubjectDto) {
        logger.info("Request received to update subject with code: {}", code);
        SubjectDto updatedSubject = subjectService.updateSubject(code, updateSubjectDto);
        // ResourceNotFoundException handled globally
        return ResponseEntity.ok(updatedSubject);
    }

    @DeleteMapping("/{code}")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSubject(@PathVariable String code) {
        logger.warn("Request received to delete subject with code: {}", code);
        subjectService.deleteSubject(code);
        // ResourceNotFoundException or BadRequestException handled globally
        return ResponseEntity.noContent().build();
    }
}