package com.example.studentresultsbackend.service;

import com.example.studentresultsbackend.dto.UploadDto;
import com.example.studentresultsbackend.dto.UploadResponse;
import com.example.studentresultsbackend.entity.Result;
import com.example.studentresultsbackend.entity.Subject;
import com.example.studentresultsbackend.entity.Upload;
import com.example.studentresultsbackend.exception.BadRequestException;
import com.example.studentresultsbackend.exception.ResourceNotFoundException;
import com.example.studentresultsbackend.repository.ResultRepository;
import com.example.studentresultsbackend.repository.SubjectRepository;
import com.example.studentresultsbackend.repository.UploadRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Important for atomicity
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UploadService {

    private static final Logger logger = LoggerFactory.getLogger(UploadService.class);

    private final UploadRepository uploadRepository;
    private final ResultRepository resultRepository;
    private final SubjectRepository subjectRepository;
    private final StudentService studentService; // For triggering GPA updates

    @Value("${app.upload.batchSize:100}") // Configure batch size in application.properties
    private int batchSize;

    @Transactional(readOnly = true)
    public List<UploadDto> getRecentUploads(int limit) {
        logger.debug("Fetching {} recent uploads", limit);
        // Ensure limit is positive
        int effectiveLimit = Math.max(1, limit);
        return uploadRepository.findByOrderByCreatedAtDesc(PageRequest.of(0, effectiveLimit)).stream()
                .map(this::mapToUploadDto)
                .collect(Collectors.toList());
    }

    // --- CSV Processing Logic (Moved from actions.ts) ---
    @Transactional // Ensures the whole process is atomic (all or nothing)
    public UploadResponse processResultsCsv(MultipartFile file, String semester, String uploadType) throws IOException {
        logger.info("Starting CSV processing for file: {}, semester: {}, type: {}", file.getOriginalFilename(), semester, uploadType);

        if (file.isEmpty()) {
            logger.error("Upload failed: File is empty.");
            throw new BadRequestException("Uploaded file is empty.");
        }
        // Basic content type check (can be spoofed, but better than nothing)
        if (!"text/csv".equalsIgnoreCase(file.getContentType()) && !file.getOriginalFilename().toLowerCase().endsWith(".csv")) {
            logger.error("Upload failed: Invalid file type '{}' for file {}", file.getContentType(), file.getOriginalFilename());
            throw new BadRequestException("Invalid file type. Please upload a CSV file.");
        }

        Set<String> affectedStudentIds = new HashSet<>();
        List<Result> resultsBatch = new ArrayList<>(batchSize);
        int recordsProcessed = 0;
        int totalRecordsInFile = 0;
        long startTime = System.currentTimeMillis();

        // Log initial upload attempt before processing
        Upload uploadLog = Upload.builder()
                .name(file.getOriginalFilename())
                .type(uploadType)
                .records(0) // Start with 0 records
                .status("Processing") // Initial status
                .build();
        uploadRepository.save(uploadLog); // Save initial log entry

        try (Reader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            // Define CSV format - **ADJUST HEADERS TO MATCH YOUR ACTUAL CSV FILE**
            CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                    .setHeader("student_id", "subject_code", "marks", "grade", "status") // CASE SENSITIVE? Ensure matches CSV
                    .setSkipHeaderRecord(true) // Assumes first row is header
                    .setTrim(true) // Trims whitespace from values
                    .setIgnoreEmptyLines(true)
                    .setAllowMissingColumnNames(false) // Fail if header is missing columns
                    .build();

            CSVParser csvParser = new CSVParser(reader, csvFormat);

            for (CSVRecord csvRecord : csvParser) {
                totalRecordsInFile++;
                try {
                    // --- Data Extraction and Validation ---
                    String studentId = csvRecord.get("student_id"); // Use header name
                    String subjectCode = csvRecord.get("subject_code");
                    String marksStr = csvRecord.get("marks");
                    String grade = csvRecord.get("grade");
                    String status = csvRecord.get("status"); // Use status from CSV? Or derive?

                    // Basic non-empty checks
                    if (studentId.isEmpty() || subjectCode.isEmpty() || marksStr.isEmpty() || grade.isEmpty() || status.isEmpty()) {
                        logger.warn("Skipping row {} due to missing mandatory field(s): {}", csvRecord.getRecordNumber(), csvRecord.toMap());
                        continue;
                    }

                    double marks = Double.parseDouble(marksStr); // Can throw NumberFormatException

                    // More validation (optional but recommended)
                    // if (marks < 0 || marks > 100) { logger.warn(...); continue; }
                    // if (!isValidGrade(grade)) { logger.warn(...); continue; }
                    // if (!studentRepository.existsById(studentId)) { logger.warn(...); continue; }

                    // --- Subject Name Lookup ---
                    // Consider fetching all subjects into a Map<String, String> before loop for large files
                    Subject subject = subjectRepository.findByCode(subjectCode)
                            .orElseThrow(() -> new BadRequestException("Row " + csvRecord.getRecordNumber() + ": Invalid subject code found in CSV: " + subjectCode));

                    // --- Derive Status (Optional - if not trusting CSV status) ---
                    // String derivedStatus = deriveStatusFromMarks(marks);

                    Result result = Result.builder()
                            .studentId(studentId)
                            .semester(semester)
                            .subjectCode(subjectCode)
                            .subjectName(subject.getName()) // Use name from DB
                            .marks(marks)
                            .grade(grade)
                            .status(status) // Use status from CSV or derivedStatus
                            .build();

                    resultsBatch.add(result);
                    affectedStudentIds.add(studentId);
                    recordsProcessed++;

                    // --- Batch Saving ---
                    if (resultsBatch.size() >= batchSize) {
                        resultRepository.saveAll(resultsBatch);
                        logger.debug("Saved batch of {} results.", resultsBatch.size());
                        resultsBatch.clear(); // Clear batch for next set
                    }

                } catch (NumberFormatException e) {
                    logger.error("CSV parsing error at row {}: Invalid number format for marks '{}'", csvRecord.getRecordNumber(), csvRecord.get("marks"));
                    throw new BadRequestException("CSV contains invalid numeric data for marks at row " + csvRecord.getRecordNumber() + ".");
                } catch (IllegalArgumentException e) { // Catches errors from csvRecord.get if header is missing
                    logger.error("CSV parsing error at row {}: Missing expected header or value error. {}", csvRecord.getRecordNumber(), e.getMessage());
                    throw new BadRequestException("CSV header/column mismatch or invalid value at row " + csvRecord.getRecordNumber() + ". Check format. Error: " + e.getMessage());
                } catch (BadRequestException | ResourceNotFoundException e) { // Catch specific validation errors
                    logger.error("Validation error processing row {}: {}", csvRecord.getRecordNumber(), e.getMessage());
                    throw e; // Rethrow to stop processing and rollback transaction
                }
            } // End CSV record loop

            // Save any remaining results in the last batch
            if (!resultsBatch.isEmpty()) {
                resultRepository.saveAll(resultsBatch);
                logger.debug("Saved final batch of {} results.", resultsBatch.size());
            }

            // --- Update Upload Log ---
            uploadLog.setStatus("Completed");
            uploadLog.setRecords(recordsProcessed);
            uploadRepository.save(uploadLog); // Update log with final status and count

            long endTime = System.currentTimeMillis();
            logger.info("Finished processing CSV '{}'. {}/{} records successfully processed in {} ms.",
                    file.getOriginalFilename(), recordsProcessed, totalRecordsInFile, (endTime - startTime));

            // --- Trigger GPA updates ---
            triggerGpaUpdatesAsync(affectedStudentIds); // Run GPA updates (potentially async)

            return new UploadResponse(true, recordsProcessed, "CSV processed successfully.");

        } catch (Exception e) { // Catch broader exceptions during file reading/parsing
            logger.error("Error processing CSV file '{}': {}", file.getOriginalFilename(), e.getMessage(), e);
            // Update upload log to 'Failed' status
            uploadLog.setStatus("Failed");
            uploadLog.setRecords(recordsProcessed); // Records processed before failure
            uploadRepository.save(uploadLog);
            // Determine response based on exception type
            if (e instanceof BadRequestException || e instanceof ResourceNotFoundException) {
                throw e; // Rethrow specific handled exceptions
            } else {
                throw new RuntimeException("Failed to process CSV file due to an unexpected error.", e); // Let global handler manage
            }
        }
    }

    // Separate method for GPA updates, potentially async later
    private void triggerGpaUpdatesAsync(Set<String> studentIds) {
        // For now, synchronous execution. Consider @Async for large sets.
        logger.info("Triggering GPA updates for {} affected students...", studentIds.size());
        int successCount = 0;
        int failCount = 0;
        long start = System.currentTimeMillis();
        for (String studentId : studentIds) {
            try {
                studentService.updateStudentGpa(studentId);
                successCount++;
            } catch (Exception gpaEx) {
                logger.error("Failed to update GPA for student {} during batch update: {}", studentId, gpaEx.getMessage());
                failCount++;
                // Decide how to handle GPA update failures (e.g., log, notify admin?)
            }
        }
        long end = System.currentTimeMillis();
        logger.info("Finished GPA updates for batch. Success: {}, Failed: {}. Time: {} ms", successCount, failCount, (end-start));
    }


    // Helper: Manual Mapping
    private UploadDto mapToUploadDto(Upload upload) {
        return new UploadDto(
                upload.getId(),
                upload.getName(),
                upload.getType(),
                upload.getRecords(),
                upload.getStatus(),
                upload.getCreatedAt(),
                upload.getUpdatedAt()
        );
    }

    // Optional helper to derive status
    // private String deriveStatusFromMarks(Double marks) { ... }
}