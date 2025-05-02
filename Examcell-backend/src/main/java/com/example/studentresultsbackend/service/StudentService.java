package com.example.studentresultsbackend.service;

import com.example.studentresultsbackend.dto.*;
import com.example.studentresultsbackend.entity.Result; // Need Result entity for GPA calc
import com.example.studentresultsbackend.entity.Student;
import com.example.studentresultsbackend.exception.BadRequestException;
import com.example.studentresultsbackend.exception.ResourceNotFoundException;
import com.example.studentresultsbackend.repository.ResultRepository; // Inject for GPA
import com.example.studentresultsbackend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Automatically creates constructor with final fields
public class StudentService {

    private static final Logger logger = LoggerFactory.getLogger(StudentService.class);

    private final StudentRepository studentRepository;
    private final ResultRepository resultRepository; // Inject ResultRepository for GPA logic

    @Transactional(readOnly = true)
    public List<StudentDto> getAllStudents() {
        logger.debug("Fetching all students");
        return studentRepository.findAll().stream()
                .map(this::mapToStudentDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudentDto getStudentById(String id) {
        logger.debug("Fetching student by ID: {}", id);
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Student not found with ID: {}", id);
                    return new ResourceNotFoundException("Student not found with id: " + id);
                });
        return mapToStudentDto(student);
    }

    @Transactional
    public StudentDto createStudent(CreateStudentDto dto) {
        logger.info("Creating new student with ID: {}", dto.id());
        // Optional: Check if student ID or email already exists
        if (studentRepository.existsById(dto.id())) {
            logger.warn("Attempted to create student with existing ID: {}", dto.id());
            throw new BadRequestException("Student with ID " + dto.id() + " already exists.");
        }
        if (studentRepository.findByEmail(dto.email()).isPresent()) {
            logger.warn("Attempted to create student with existing email: {}", dto.email());
            throw new BadRequestException("Student with email " + dto.email() + " already exists.");
        }

        Student student = Student.builder()
                .id(dto.id())
                .name(dto.name())
                .email(dto.email())
                .department(dto.department())
                .year(dto.year())
                .gpa(0.0) // Initial GPA is 0
                .status("Active") // Default status
                .profileImage(dto.profileImage())
                .build();
        Student savedStudent = studentRepository.save(student);
        logger.info("Student created successfully with ID: {}", savedStudent.getId());
        return mapToStudentDto(savedStudent);
    }

    @Transactional
    public StudentDto updateStudent(String id, UpdateStudentDto dto) {
        logger.info("Updating student with ID: {}", id);
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Student not found for update with ID: {}", id);
                    return new ResourceNotFoundException("Student not found with id: " + id);
                });

        // Update fields only if they are provided in the DTO
        boolean updated = false;
        if (dto.name() != null && !dto.name().equals(student.getName())) {
            student.setName(dto.name());
            updated = true;
        }
        if (dto.email() != null && !dto.email().equals(student.getEmail())) {
            // Optional: Check if the new email is already taken by another student
            studentRepository.findByEmail(dto.email()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    logger.warn("Attempted to update student {} with existing email: {}", id, dto.email());
                    throw new BadRequestException("Email " + dto.email() + " is already in use.");
                }
            });
            student.setEmail(dto.email());
            updated = true;
        }
        if (dto.department() != null && !dto.department().equals(student.getDepartment())) {
            student.setDepartment(dto.department());
            updated = true;
        }
        if (dto.year() != null && dto.year() != student.getYear()) {
            student.setYear(dto.year());
            updated = true;
        }
        if (dto.status() != null && !dto.status().equals(student.getStatus())) {
            student.setStatus(dto.status());
            updated = true;
        }
        if (dto.profileImage() != null && !dto.profileImage().equals(student.getProfileImage())) {
            student.setProfileImage(dto.profileImage());
            updated = true;
        }

        if (!updated) {
            logger.info("No changes detected for student ID: {}", id);
            return mapToStudentDto(student); // Return current state if no changes
        }

        Student updatedStudent = studentRepository.save(student);
        logger.info("Student updated successfully with ID: {}", updatedStudent.getId());
        return mapToStudentDto(updatedStudent);
    }

    @Transactional
    public void deleteStudent(String id) {
        logger.warn("Attempting to delete student with ID: {}", id); // Log deletion attempts
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Student not found for deletion with ID: {}", id);
                    return new ResourceNotFoundException("Student not found with id: " + id);
                });

        // Business Rule: What happens to results when a student is deleted?
        // Option 1: Delete associated results (might need cascading delete or manual deletion)
        // Option 2: Prevent deletion if results exist
        // Option 3: Mark student as 'Inactive' or 'Deleted' instead of actually deleting
        // Implementing Option 3 (soft delete) is often safer. Let's assume hard delete for now.
        // Consider adding logic here to handle results if needed. E.g.:
        // List<Result> results = resultRepository.findByStudentId(id);
        // if (!results.isEmpty()) {
        //     throw new BadRequestException("Cannot delete student with existing results.");
        // }

        studentRepository.delete(student);
        logger.info("Student deleted successfully with ID: {}", id);
    }

    // --- GPA Calculation Logic (Moved from actions.ts) ---
    // This is called by ResultService after results change
    @Transactional // Needs to be transactional to save the updated student GPA
    public void updateStudentGpa(String studentId) {
        logger.debug("Updating GPA for student ID: {}", studentId);
        // Find the student or throw error if not found
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId + " during GPA update."));

        // Fetch all results for this student
        List<Result> results = resultRepository.findByStudentId(studentId);

        if (results.isEmpty()) {
            logger.debug("No results found for student {}. Setting GPA to 0.0", studentId);
            if (student.getGpa() != 0.0) { // Only save if GPA changes
                student.setGpa(0.0);
                studentRepository.save(student);
            }
            return;
        }

        // Same GPA calculation logic as in your actions.ts
        Map<String, Double> gradePoints = Map.ofEntries(
                Map.entry("A+", 4.0), Map.entry("A", 4.0), Map.entry("A-", 3.7),
                Map.entry("B+", 3.3), Map.entry("B", 3.0), Map.entry("B-", 2.7),
                Map.entry("C+", 2.3), Map.entry("C", 2.0), Map.entry("C-", 1.7),
                Map.entry("D+", 1.3), Map.entry("D", 1.0), Map.entry("F", 0.0)
        );

        double totalPoints = 0;
        int totalSubjects = 0; // Or use total credits if available and needed

        for (Result result : results) {
            // Assuming simple average (not credit-weighted). Adjust if needed.
            totalPoints += gradePoints.getOrDefault(result.getGrade(), 0.0);
            totalSubjects++;
        }

        double newGpa = (totalSubjects > 0) ? totalPoints / totalSubjects : 0.0;
        // Format GPA to two decimal places before comparing/saving
        double formattedNewGpa = Double.parseDouble(String.format("%.2f", newGpa));

        // Only save if the formatted GPA has actually changed
        if (Double.compare(student.getGpa(), formattedNewGpa) != 0) {
            student.setGpa(formattedNewGpa);
            studentRepository.save(student);
            logger.debug("Updated GPA for student {} to {}", studentId, formattedNewGpa);
        } else {
            logger.debug("GPA for student {} remains unchanged at {}", studentId, formattedNewGpa);
        }
    }


    // --- Helper: Manual Mapping (or use MapStruct) ---
    private StudentDto mapToStudentDto(Student student) {
        return new StudentDto(
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getDepartment(),
                student.getYear(),
                student.getGpa(),
                student.getStatus(),
                student.getProfileImage(),
                student.getCreatedAt(),
                student.getUpdatedAt()
        );
    }
}