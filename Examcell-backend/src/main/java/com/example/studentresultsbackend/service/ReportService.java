package com.example.studentresultsbackend.service;

import com.example.studentresultsbackend.entity.Result;
import com.example.studentresultsbackend.entity.Student;
import com.example.studentresultsbackend.exception.ResourceNotFoundException;
import com.example.studentresultsbackend.repository.ResultRepository;
import com.example.studentresultsbackend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private static final Logger logger = LoggerFactory.getLogger(ReportService.class);

    private final ResultRepository resultRepository;
    private final StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public String generateSemesterHtmlReport(String semester) {
        logger.info("Generating HTML report for semester: {}", semester);

        // 1. Fetch Results for the semester
        List<Result> results = resultRepository.findBySemesterOrderByStudentIdAscSubjectNameAsc(semester);

        if (results.isEmpty()) {
            logger.warn("No results found for semester {} to generate report.", semester);
            return buildHtmlShell("No Results Found", "<h2>No Results Found</h2><p>No results data available for semester: " + escapeHtml(semester) + "</p>");
        }

        // 2. Fetch corresponding Student names
        List<String> studentIds = results.stream()
                .map(Result::getStudentId)
                .distinct()
                .toList();
        Map<String, String> studentNameMap = studentRepository.findAllById(studentIds).stream()
                .collect(Collectors.toMap(Student::getId, Student::getName));

        // Log missing students
        for (String studentId : studentIds) {
            if (!studentNameMap.containsKey(studentId)) {
                logger.warn("No student found for studentId: {} in semester: {}", studentId, semester);
            }
        }

        // 3. Build the HTML Table Content
        StringBuilder tableRows = new StringBuilder();
        for (Result result : results) {
            String studentName = studentNameMap.getOrDefault(result.getStudentId(), "Unknown");
            tableRows.append("<tr>")
                    .append("<td>").append(escapeHtml(result.getStudentId())).append("</td>")
                    .append("<td>").append(escapeHtml(studentName)).append("</td>")
                    .append("<td>").append(escapeHtml(result.getSubjectName())).append("</td>")
                    .append("<td>").append(escapeHtml(result.getSubjectCode())).append("</td>")
                    .append("<td style='text-align: right;'>").append(result.getMarks()).append("</td>")
                    .append("<td style='text-align: center;'>").append(escapeHtml(result.getGrade())).append("</td>")
                    .append("<td style='text-align: center;'>").append(escapeHtml(result.getStatus())).append("</td>")
                    .append("</tr>\n");
        }

        // 4. Assemble the table content
        String tableContent = String.format(
                """
                <h2>Semester Results: %s</h2>
                <p>Generated on: %s</p>
                <table border="1" cellpadding="5" cellspacing="0" style="width: 100%%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th>Student ID</th>
                            <th>Student Name</th>
                            <th>Subject</th>
                            <th>Code</th>
                            <th style='text-align: right;'>Marks</th>
                            <th style='text-align: center;'>Grade</th>
                            <th style='text-align: center;'>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        %s
                    </tbody>
                </table>
                """,
                escapeHtml(semester),
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                tableRows.toString()
        );

        logger.info("Successfully generated HTML report for semester: {}", semester);
        return buildHtmlShell("Semester Results - " + escapeHtml(semester), tableContent);
    }

    // Helper to build the basic HTML structure
    private String buildHtmlShell(String title, String bodyContent) {
        return String.format(
                """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>%s</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        table { width: 100%%; border-collapse: collapse; margin-top: 15px; font-size: 10pt; }
                        th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
                        th { background-color: #eee; font-weight: bold; }
                        h2 { border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                        @media print {
                            body { padding: 5px; font-size: 9pt; }
                            table { margin-top: 10px; }
                            p { margin: 5px 0; }
                            h2 { margin-bottom: 10px; font-size: 14pt; border: none; }
                            button { display: none; }
                        }
                    </style>
                </head>
                <body>
                    %s
                    <button onclick="window.print()" style="margin-top: 20px;">Print this report</button>
                </body>
                </html>
                """,
                escapeHtml(title),
                bodyContent
        );
    }

    // Proper HTML escaping helper
    private String escapeHtml(String input) {
        if (input == null) {
            return "";
        }
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}