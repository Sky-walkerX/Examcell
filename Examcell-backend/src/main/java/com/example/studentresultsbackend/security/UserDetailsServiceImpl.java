// UserDetailsServiceImpl.java
package com.example.studentresultsbackend.security;

import com.example.studentresultsbackend.entity.Admin;
import com.example.studentresultsbackend.entity.Student; // Import Student
import com.example.studentresultsbackend.repository.AdminRepository;
import com.example.studentresultsbackend.repository.StudentRepository; // Import StudentRepository
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(UserDetailsServiceImpl.class);

    @Autowired
    AdminRepository adminRepository;

    // --- INJECT STUDENT REPOSITORY ---
    @Autowired
    StudentRepository studentRepository;
    // --------------------------------

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        logger.debug("Attempting to load user by email (username): {}", email);

        // 1. Try finding an Admin first
        Admin admin = adminRepository.findByEmail(email).orElse(null);

        if (admin != null) {
            logger.debug("Admin user found for email: {}", email);
            return UserDetailsImpl.buildAdmin(admin);
        }

        // 2. If not admin, try finding a Student
        logger.debug("Admin not found, checking for student with email: {}", email);
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> {
                    // 3. If neither found, throw exception
                    logger.warn("User not found with email: {}", email);
                    return new UsernameNotFoundException("User Not Found with email: " + email);
                });

        // --- Check if student has a password set ---
        // You might decide only students with non-null passwords can log in
        if (student.getPassword() == null || student.getPassword().isEmpty()) {
            logger.warn("Student found with email {}, but has no password set. Login denied.", email);
            // Throw specific exception or the same one - depends on desired feedback
            throw new UsernameNotFoundException("Student account exists but is not configured for password login: " + email);
        }
        // -------------------------------------------

        logger.debug("Student user found for email: {}", email);
        // Build and return UserDetails for the student
        return UserDetailsImpl.buildStudent(student);
    }
}