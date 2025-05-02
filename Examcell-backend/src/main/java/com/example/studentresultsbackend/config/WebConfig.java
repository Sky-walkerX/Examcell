package com.example.studentresultsbackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    // Inject allowed origins from application.properties for flexibility
    // Example in application.properties: app.cors.allowed-origins=http://localhost:3000,https://your-deployed-frontend.com
    @Value("${app.cors.allowed-origins:http://localhost:3000}") // Default to localhost:3000
    private String[] allowedOrigins;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**") // Apply CORS rules to all paths under /api/
                        .allowedOrigins(allowedOrigins) // Use origins from properties
                        // Allow specific HTTP methods used by your frontend
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
                        // Allow all headers (common practice, or list specific required headers)
                        .allowedHeaders("*")
                        // Allow credentials (cookies, authorization headers) - important for JWT Bearer tokens
                        .allowCredentials(true)
                        // Set max age for preflight request cache (in seconds)
                        .maxAge(3600); // 1 hour
            }
        };
    }
}