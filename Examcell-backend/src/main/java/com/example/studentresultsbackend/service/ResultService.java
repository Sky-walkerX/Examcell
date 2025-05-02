package com.example.studentresultsbackend.service;

import com.example.studentresultsbackend.dto.*;
import com.example.studentresultsbackend.entity.Result;
import com.example.studentresultsbackend.entity.Student; // Needed to check if student exists
import com.example.studentresultsbackend.exception.BadRequestException;
import com.example.studentresultsbackend.exception.ResourceNotFoundException;
import com.example.studentresultsbackend.repository.ResultRepository;
import com.example.studentresultsbackend.repository.StudentRepository; // Inject StudentRepo
import com.example.studentresultsbackend.repository.SubjectRepository; // Inject SubjectRepo
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResultService {

    private static final Logger logger = LoggerFactory.getLogger(ResultService.class);

    private final ResultRepository resultRepository;
    private final StudentRepository studentRepository; // To verify student exists
    private final SubjectRepository subjectRepository; // To verify subject exists
    private final StudentService studentService; // To trigger GPA updates

    @Transactional(readOnly = true)
    public List<ResultDto> getAllResults() {
        logger.debug("Fetching all results");
        return resultRepository.findAll().stream()
                .map(this::mapToResultDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ResultDto> getResultsByStudentId(String studentId) {
        logger.debug("Fetching results for student ID: {}", studentId);
        // Optional: Check if student exists first
        // if (!studentRepository.existsById(studentId)) {
        //     throw new ResourceNotFoundException("Student not found with id: " + studentId);
        // }
        return resultRepository.findByStudentIdOrderBySemesterDescSubjectNameAsc(studentId).stream()
                .map(this::mapToResultDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ResultDto> getResultsBySemester(String semester) {
        logger.debug("Fetching results for semester: {}", semester);
        return resultRepository.findBySemesterOrderByStudentIdAscSubjectNameAsc(semester).stream()
                .map(this::mapToResultDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ResultDto createResult(CreateResultDto dto) {
        logger.info("Creating new result for student ID: {}, subject: {}", dto.studentId(), dto.subjectCode());
        // --- Business Rule Validations ---
        // 1. Check if student exists
        if (!studentRepository.existsById(dto.studentId())) {
            logger.warn("Attempted to create result for non-existent student: {}", dto.studentId());
            throw new ResourceNotFoundException("Student not found with id: " + dto.studentId());
        }
        // 2. Check if subject exists
        if (!subjectRepository.existsById(dto.subjectCode())) {
            logger.warn("Attempted to create result for non-existent subject: {}", dto.subjectCode());
            throw new ResourceNotFoundException("Subject not found with code: " + dto.subjectCode());
        }
        // 3. Optional: Check if a result for this student+subject+semester already exists

        // --- Derive Status ---
        String status = deriveStatusFromMarks(dto.marks());

        Result result = Result.builder()
                .studentId(dto.studentId())
                .semester(dto.semester())
                .subjectCode(dto.subjectCode())
                .subjectName(dto.subjectName()) // Consider fetching from Subject entity for consistency
                .marks(dto.marks())
                .grade(dto.grade()) // Frontend sends this, could be validated/recalculated here
                .status(status)
                .build();

        Result savedResult = resultRepository.save(result);
        logger.info("Result created successfully with ID: {}", savedResult.getId());

        // --- Trigger GPA Update ---
        try {
            studentService.updateStudentGpa(savedResult.getStudentId());
        } catch (Exception e) {
            logger.error("Failed to update GPA for student {} after creating result {}: {}", savedResult.getStudentId(), savedResult.getId(), e.getMessage());
            // Decide if the result creation should be rolled back or just log the GPA error
        }

        return mapToResultDto(savedResult);
    }

    @Transactional
    public ResultDto updateResult(Long id, UpdateResultDto dto) {
        logger.info("Updating result with ID: {}", id);
        Result result = resultRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Result not found for update with ID: {}", id);
                    return new ResourceNotFoundException("Result not found with id: " + id);
                });

        // --- Derive Status ---
        String status = deriveStatusFromMarks(dto.marks());

        boolean updated = false;
        if (Double.compare(result.getMarks(), dto.marks()) != 0) {
            result.setMarks(dto.marks());
            updated = true;
        }
        if (!result.getGrade().equals(dto.grade())) {
            result.setGrade(dto.grade());
            updated = true;
        }
        if (!result.getStatus().equals(status)) {
            result.setStatus(status);
            updated = true;
        }
        // Usually semester, studentId, subjectCode should not be updated here

        if (!updated) {
            logger.info("No changes detected for result ID: {}", id);
            return mapToResultDto(result);
        }

        Result updatedResult = resultRepository.save(result);
        logger.info("Result updated successfully with ID: {}", updatedResult.getId());

        // --- Trigger GPA Update ---
        try {
            studentService.updateStudentGpa(updatedResult.getStudentId());
        } catch (Exception e) {
            logger.error("Failed to update GPA for student {} after updating result {}: {}", updatedResult.getStudentId(), updatedResult.getId(), e.getMessage());
            // Decide handling
        }

        return mapToResultDto(updatedResult);
    }

    @Transactional
    public void deleteResult(Long id) {
        logger.warn("Attempting to delete result with ID: {}", id);
        Result result = resultRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Result not found for deletion with ID: {}", id);
                    return new ResourceNotFoundException("Result not found with id: " + id);
                });

        String studentId = result.getStudentId(); // Get student ID BEFORE deleting
        resultRepository.delete(result);
        logger.info("Result deleted successfully with ID: {}", id);

        // --- Trigger GPA Update ---
        try {
            studentService.updateStudentGpa(studentId);
        } catch (Exception e) {
            logger.error("Failed to update GPA for student {} after deleting result {}: {}", studentId, id, e.getMessage());
            // Decide handling
        }
    }

    // Helper to derive status
    private String deriveStatusFromMarks(Double marks) {
        if (marks == null) {
            return "Fail"; // Or handle as invalid input earlier
        }
        return marks >= 40 ? "Pass" : "Fail"; // Match frontend logic
    }

    // Helper: Manual Mapping
    private ResultDto mapToResultDto(Result result) {
        return new ResultDto(
                result.getId(),
                result.getStudentId(),
                result.getSemester(),
                result.getSubjectCode(),
                result.getSubjectName(),
                result.getMarks(),
                result.getGrade(),
                result.getStatus(),
                result.getCreatedAt(),
                result.getUpdatedAt()
        );
    }
}