package com.example.studentresultsbackend.repository;

import com.example.studentresultsbackend.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

    // Finds an Admin entity by matching the 'email' field.
    // Essential for the authentication process (UserDetailsServiceImpl).
    Optional<Admin> findByEmail(String email);
}