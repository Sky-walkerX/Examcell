package com.example.studentresultsbackend.controller;

import com.example.studentresultsbackend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports") // Base path for reports
@RequiredArgsConstructor
public class ReportController {

    private static final Logger logger = LoggerFactory.getLogger(ReportController.class);
    private final ReportService reportService;

    @GetMapping(value = "/semester/{semester}", produces = MediaType.TEXT_HTML_VALUE) // Specify HTML production
    @PreAuthorize("hasRole('ADMIN')") // Secure the endpoint
    public ResponseEntity<String> getSemesterReportHtml(@PathVariable String semester) {
        logger.info("Request received for HTML report for semester: {}", semester);
        try {
            String reportHtml = reportService.generateSemesterHtmlReport(semester);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_HTML);
            // Optional: Add Content-Disposition if you want to suggest a filename
            // headers.setContentDispositionFormData("attachment", "semester_report_" + semester + ".html");

            return ResponseEntity.ok().headers(headers).body(reportHtml);
        } catch (Exception e) {
            logger.error("Error generating report for semester {}: {}", semester, e.getMessage(), e);
            // Let GlobalExceptionHandler handle it, or return a specific error response
            throw e; // Re-throw for global handling
        }
    }
}