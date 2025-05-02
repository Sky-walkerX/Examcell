package com.example.studentresultsbackend.repository;

import com.example.studentresultsbackend.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, String> {

    // Explicitly define findByCode, equivalent to findById for this entity.
    // Useful in services where you specifically have the code.
    Optional<Subject> findByCode(String code);

    // Find all subjects in a specific department, ordered by name
    // List<Subject> findByDepartmentOrderByNameAsc(String department);
}