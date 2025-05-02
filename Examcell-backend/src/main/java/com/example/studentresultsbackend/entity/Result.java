package com.example.studentresultsbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;

@Entity
@Table(name = "results") // Ensure this matches your actual table name
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Assumes DB auto-increments this ID
    @Column(name = "id")
    private Long id;

    @Column(name = "student_id", nullable = false) // Foreign key column linking to students table
    private String studentId;

    @Column(name = "semester", nullable = false)
    private String semester;

    @Column(name = "subject_code", nullable = false) // Foreign key column linking to subjects table
    private String subjectCode;

    @Column(name = "subject_name", nullable = false) // Often included for convenience, even if redundant
    private String subjectName;

    @Column(name = "marks", nullable = false)
    private double marks;

    @Column(name = "grade", nullable = false, length = 5) // Limit grade length if needed
    private String grade;

    @Column(name = "status", nullable = false, length = 10) // Limit status length if needed
    private String status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // Optional: Define relationships if needed for JPA queries, but keep it simple if not required
    /*
    @ManyToOne(fetch = FetchType.LAZY) // LAZY is usually better for performance
    @JoinColumn(name = "student_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_code", referencedColumnName = "code", insertable = false, updatable = false)
    private Subject subject;
    */
}