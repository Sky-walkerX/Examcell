package com.example.studentresultsbackend.controller;

import com.example.studentresultsbackend.dto.*;
import com.example.studentresultsbackend.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
// Import PreAuthorize if using method-level security later
// import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students") // Base path for student resources
@RequiredArgsConstructor
// Assumes global CORS configuration in WebConfig is used
public class StudentController {

    private static final Logger logger = LoggerFactory.getLogger(StudentController.class);
    private final StudentService studentService;

    @GetMapping
    // @PreAuthorize("hasRole('ADMIN')") // Example: Only Admins can get all students
    public ResponseEntity<List<StudentDto>> getAllStudents() {
        logger.debug("Request received for getting all students");
        List<StudentDto> students = studentService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    @GetMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id") // Example: Admin or the student themselves
    public ResponseEntity<StudentDto> getStudentById(@PathVariable String id) {
        logger.debug("Request received for getting student by ID: {}", id);
        StudentDto student = studentService.getStudentById(id);
        // ResourceNotFoundException handled by GlobalExceptionHandler
        return ResponseEntity.ok(student);
    }

    @PostMapping
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentDto> createStudent(@Valid @RequestBody CreateStudentDto createStudentDto) {
        logger.info("Request received to create student with ID: {}", createStudentDto.id());
        StudentDto createdStudent = studentService.createStudent(createStudentDto);
        // BadRequestException for duplicates handled by GlobalExceptionHandler
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStudent);
    }

    @PutMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentDto> updateStudent(@PathVariable String id, @Valid @RequestBody UpdateStudentDto updateStudentDto) {
        logger.info("Request received to update student with ID: {}", id);
        StudentDto updatedStudent = studentService.updateStudent(id, updateStudentDto);
        // ResourceNotFoundException or BadRequestException handled by GlobalExceptionHandler
        return ResponseEntity.ok(updatedStudent);
    }

    @DeleteMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStudent(@PathVariable String id) {
        logger.warn("Request received to delete student with ID: {}", id); // Log delete intent
        studentService.deleteStudent(id);
        // ResourceNotFoundException or potential business rule exceptions handled by GlobalExceptionHandler
        return ResponseEntity.noContent().build(); // Standard 204 response for successful DELETE
    }
}