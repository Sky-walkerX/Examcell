package com.example.studentresultsbackend.config;

// --- Ensure ALL these imports are present ---
import com.example.studentresultsbackend.security.AuthEntryPointJwt;
import com.example.studentresultsbackend.security.AuthTokenFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value; // Import Value
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
// Remove: import org.springframework.security.config.Customizer; // We'll define CORS explicitly now
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration; // Import CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource; // Import CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // Import UrlBasedCorsConfigurationSource

import java.util.Arrays; // Import Arrays
import java.util.List; // Import List
// --- End Imports ---

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    // Inject allowed origins from properties
    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String[] allowedOrigins;

    // --- Bean definitions for AuthTokenFilter, DaoAuthenticationProvider, etc. (Keep as before) ---
    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    // --- Define CORS Configuration Source Bean ---
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Use Arrays.asList for allowedOrigins read from properties
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        // Allow specific methods or use List.of("*") to allow all standard methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        // Allow specific headers or use List.of("*") to allow all
        configuration.setAllowedHeaders(List.of("*")); // Allows "Authorization", "Content-Type", etc.
        // Allow credentials (important for Authorization header)
        configuration.setAllowCredentials(true);
        // Set max age for preflight response cache
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this configuration to all paths under /api/
        source.registerCorsConfiguration("/api/**", configuration);
        System.out.println("--- Explicit CORS Configuration Source Bean Created ---"); // Log creation
        System.out.println("Allowed Origins in Bean: " + configuration.getAllowedOrigins());
        return source;
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // --- Apply CORS using the defined Bean ---
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // ------------------------------------------

                // Disable CSRF protection
                .csrf(AbstractHttpConfigurer::disable)
                // Configure exception handling (for 401 errors)
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                // Make session stateless
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Configure authorization rules
                .authorizeHttpRequests(auth -> auth
                        // We might not strictly need the explicit OPTIONS permit anymore
                        // because the cors() config above should handle preflights.
                        // Keep it for belt-and-suspenders or remove if cors() works alone.
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/login").permitAll()         // Allow login
                        .requestMatchers("/api/**").authenticated()             // Secure other API routes
                        .anyRequest().permitAll()                             // Allow anything else
                );

        // Set the custom authentication provider
        http.authenticationProvider(authenticationProvider());

        // Add the JWT token filter before the standard username/password filter
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}