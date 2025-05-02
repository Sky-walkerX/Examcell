package com.example.studentresultsbackend.repository;

import com.example.studentresultsbackend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository; // Optional, but good practice

import java.util.Optional;

@Repository // Marks this as a Spring-managed repository component
public interface StudentRepository extends JpaRepository<Student, String> {

    // Spring Data JPA automatically implements this method based on its name
    // It finds a Student entity by matching the 'email' field.
    // Returns Optional to handle cases where no student is found with that email.
    Optional<Student> findByEmail(String email);

    // You can add other custom query methods here if needed, e.g.:
    // List<Student> findByDepartmentAndYear(String department, int year);
    // boolean existsByEmail(String email);
}