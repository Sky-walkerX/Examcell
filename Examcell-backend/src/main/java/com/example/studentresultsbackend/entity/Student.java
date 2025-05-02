// Student.java
package com.example.studentresultsbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;

@Entity
@Table(name = "students") // Ensure this matches your actual table name
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @Column(name = "id", nullable = false, unique = true, length = 50)
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "department", nullable = false)
    private String department;

    @Column(name = "year", nullable = false)
    private int year;

    @Column(name = "gpa", columnDefinition = "DECIMAL(3,2)") // Using DECIMAL
    private double gpa;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "profile_image")
    private String profileImage;


    @Column(name = "password", nullable = true) // Store HASHED password, make nullable for now
    private String password;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}