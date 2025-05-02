package com.example.studentresultsbackend.controller;

import com.example.studentresultsbackend.dto.UploadDto;
import com.example.studentresultsbackend.dto.UploadResponse;
import com.example.studentresultsbackend.service.UploadService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

    private static final Logger logger = LoggerFactory.getLogger(UploadController.class);
    private final UploadService uploadService;

    @GetMapping
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UploadDto>> getRecentUploads(@RequestParam(defaultValue = "5") int limit) {
        logger.debug("Request received for getting recent uploads (limit: {})", limit);
        if (limit <= 0) {
            limit = 5; // Ensure positive limit
        }
        List<UploadDto> uploads = uploadService.getRecentUploads(limit);
        return ResponseEntity.ok(uploads);
    }

    @PostMapping("/results/csv")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UploadResponse> uploadResultsCsv(
            @RequestParam("file") MultipartFile file, // Matches key in FormData
            @RequestParam("semester") String semester, // Matches key in FormData
            @RequestParam("type") String type         // Matches key in FormData
    ) throws IOException {
        logger.info("Request received to upload CSV results for file: {}, semester: {}, type: {}",
                file.getOriginalFilename(), semester, type);

        // Service method handles validation, processing, and error handling
        // Exceptions (BadRequest, Runtime) handled globally
        UploadResponse response = uploadService.processResultsCsv(file, semester, type);

        // Return 200 OK with the response object from the service
        return ResponseEntity.ok(response);
    }
}