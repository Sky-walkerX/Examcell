package com.example.studentresultsbackend.repository;

import com.example.studentresultsbackend.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {

    // Finds all results for a given student ID, ordered by semester descending, then subject name ascending.
    List<Result> findByStudentIdOrderBySemesterDescSubjectNameAsc(String studentId);

    // Finds all results for a given semester, ordered by student ID ascending, then subject name ascending.
    List<Result> findBySemesterOrderByStudentIdAscSubjectNameAsc(String semester);

    // Finds all results for a given student ID (needed for GPA calculation).
    // Sorting is not strictly required here but can be added if needed elsewhere.
    List<Result> findByStudentId(String studentId);

    // Example using @Query if method naming gets too complex or needs specific JPQL/SQL
    // @Query("SELECT r FROM Result r WHERE r.studentId = :studentId AND r.marks > :minMarks")
    // List<Result> findResultsAboveMarkForStudent(@Param("studentId") String studentId, @Param("minMarks") double minMarks);
}