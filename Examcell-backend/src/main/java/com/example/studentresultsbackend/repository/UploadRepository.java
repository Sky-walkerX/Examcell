package com.example.studentresultsbackend.repository;

import com.example.studentresultsbackend.entity.Upload;
import org.springframework.data.domain.Pageable; // Required for pagination/limiting
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UploadRepository extends JpaRepository<Upload, String> {

    // Finds uploads ordered by creation date descending.
    // The actual limit is applied when calling this method by passing a PageRequest object.
    // Example call in service: uploadRepository.findByOrderByCreatedAtDesc(PageRequest.of(0, 5));
    List<Upload> findByOrderByCreatedAtDesc(Pageable pageable);
}