// UserDetailsImpl.java
package com.example.studentresultsbackend.security;

import com.example.studentresultsbackend.entity.Admin;
import com.example.studentresultsbackend.entity.Student;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

public class UserDetailsImpl implements UserDetails {
    // ... (serialVersionUID, fields remain the same) ...
    private static final long serialVersionUID = 1L;
    private String id;
    private String email; // Used as the 'username'
    private String name;
    @JsonIgnore
    private String password; // Hashed password
    private String role; // Simple role name ("admin", "student")
    private Collection<? extends GrantedAuthority> authorities;

    private UserDetailsImpl(String id, String email, String name, String password, String role,
                            Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.password = password; // Store the password hash
        this.role = role;
        this.authorities = authorities;
    }

    // buildAdmin method remains the same
    public static UserDetailsImpl buildAdmin(Admin admin) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
        return new UserDetailsImpl(
                String.valueOf(admin.getId()),
                admin.getEmail(),
                admin.getName(),
                admin.getPassword(), // Pass HASHED password
                "admin",
                authorities);
    }

    // --- MODIFY buildStudent ---
    // Builder method for Student users
    public static UserDetailsImpl buildStudent(Student student) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_STUDENT"));
        return new UserDetailsImpl(
                student.getId(),
                student.getEmail(),
                student.getName(),
                student.getPassword(), // <<< Pass the HASHED password from the Student entity
                "student",
                authorities);
    }
    // ---------------------------


    // ... (getters and other UserDetails methods remain the same) ...
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getRole() { return role; }
    @Override
    public String getPassword() { return password; } // Returns HASHED password
    @Override
    public String getUsername() { return email; } // Use email as username
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
    @Override public boolean equals(Object o) { /* ... */ return Objects.equals(email, ((UserDetailsImpl) o).email); }
    @Override public int hashCode() { return Objects.hash(email); }

}