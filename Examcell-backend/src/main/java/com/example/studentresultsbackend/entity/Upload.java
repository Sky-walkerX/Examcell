package com.example.studentresultsbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;
import java.util.UUID; // Import UUID

@Entity
@Table(name = "uploads") // Ensure this matches your actual table name
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Upload {

    @Id
    @Column(name = "id", length = 36) // Standard UUID length
    private String id;

    @Column(name = "name", nullable = false) // e.g., the filename
    private String name;

    @Column(name = "type", nullable = false) // e.g., "semester-results", "student-data"
    private String type;

    @Column(name = "records", nullable = false) // Number of records processed/uploaded
    private int records;

    @Column(name = "status", nullable = false, length = 20) // e.g., "Processing", "Completed", "Failed"
    private String status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist // Hook executed before the entity is persisted
    public void ensureId() {
        // Generate a UUID if the ID is not already set (e.g., during creation)
        if (this.id == null || this.id.isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
    }
}