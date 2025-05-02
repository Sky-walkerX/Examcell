package com.example.studentresultsbackend.service;

import com.example.studentresultsbackend.dto.*;
import com.example.studentresultsbackend.entity.Subject;
import com.example.studentresultsbackend.exception.BadRequestException;
import com.example.studentresultsbackend.exception.ResourceNotFoundException;
import com.example.studentresultsbackend.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private static final Logger logger = LoggerFactory.getLogger(SubjectService.class);

    private final SubjectRepository subjectRepository;

    @Transactional(readOnly = true)
    public List<SubjectDto> getAllSubjects() {
        logger.debug("Fetching all subjects");
        return subjectRepository.findAll().stream()
                .map(this::mapToSubjectDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubjectDto getSubjectByCode(String code) {
        logger.debug("Fetching subject by code: {}", code);
        Subject subject = subjectRepository.findById(code) // findById works as code is the ID
                .orElseThrow(() -> {
                    logger.warn("Subject not found with code: {}", code);
                    return new ResourceNotFoundException("Subject not found with code: " + code);
                });
        return mapToSubjectDto(subject);
    }

    @Transactional
    public SubjectDto createSubject(CreateSubjectDto dto) {
        logger.info("Creating new subject with code: {}", dto.code());
        // Check if subject code already exists
        if (subjectRepository.existsById(dto.code())) {
            logger.warn("Attempted to create subject with existing code: {}", dto.code());
            throw new BadRequestException("Subject with code " + dto.code() + " already exists.");
        }

        Subject subject = Subject.builder()
                .code(dto.code())
                .name(dto.name())
                .department(dto.department())
                .credits(dto.credits())
                .build();
        Subject saved = subjectRepository.save(subject);
        logger.info("Subject created successfully with code: {}", saved.getCode());
        return mapToSubjectDto(saved);
    }

    @Transactional
    public SubjectDto updateSubject(String code, UpdateSubjectDto dto) {
        logger.info("Updating subject with code: {}", code);
        Subject subject = subjectRepository.findById(code)
                .orElseThrow(() -> {
                    logger.warn("Subject not found for update with code: {}", code);
                    return new ResourceNotFoundException("Subject not found with code: " + code);
                });

        boolean updated = false;
        if (dto.name() != null && !dto.name().equals(subject.getName())) {
            subject.setName(dto.name());
            updated = true;
        }
        if (dto.department() != null && !dto.department().equals(subject.getDepartment())) {
            subject.setDepartment(dto.department());
            updated = true;
        }
        if (dto.credits() != null && dto.credits() != subject.getCredits()) {
            subject.setCredits(dto.credits());
            updated = true;
        }

        if (!updated) {
            logger.info("No changes detected for subject code: {}", code);
            return mapToSubjectDto(subject);
        }

        Subject updatedSubject = subjectRepository.save(subject);
        logger.info("Subject updated successfully with code: {}", updatedSubject.getCode());
        return mapToSubjectDto(updatedSubject);
    }

    @Transactional
    public void deleteSubject(String code) {
        logger.warn("Attempting to delete subject with code: {}", code);
        Subject subject = subjectRepository.findById(code)
                .orElseThrow(() -> {
                    logger.warn("Subject not found for deletion with code: {}", code);
                    return new ResourceNotFoundException("Subject not found with code: " + code);
                });

        // Business Rule: Check if subject is used in any results?
        // If so, prevent deletion or handle appropriately.
        // Example check (would require adding a method to ResultRepository):
        // if (resultRepository.existsBySubjectCode(code)) {
        //     throw new BadRequestException("Cannot delete subject that has associated results.");
        // }

        subjectRepository.delete(subject);
        logger.info("Subject deleted successfully with code: {}", code);
    }

    // Helper: Manual mapping
    private SubjectDto mapToSubjectDto(Subject subject) {
        return new SubjectDto(
                subject.getCode(),
                subject.getName(),
                subject.getDepartment(),
                subject.getCredits(),
                subject.getCreatedAt(),
                subject.getUpdatedAt()
        );
    }
}