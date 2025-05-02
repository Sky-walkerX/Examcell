package com.example.studentresultsbackend.security;

import com.example.studentresultsbackend.entity.Admin; // To potentially include more claims
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException; // Specific exception
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey; // Use SecretKey for modern JJWT
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private int jwtExpirationMs;

    // Use SecretKey for type safety with modern JJWT versions
    private SecretKey key() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Generates a token from an Authentication object (after successful login)
    public String generateJwtToken(Authentication authentication) {
        // Assumes the Principal is our UserDetailsImpl
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername()) // Subject is typically the unique identifier (email)
                .claim("id", userPrincipal.getId())      // Custom claim for user ID
                .claim("role", userPrincipal.getRole())  // Custom claim for user role
                // Add other claims if needed (e.g., name, specific permissions)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256) // Use the generated SecretKey
                .compact();
    }

    // Extracts the username (email) from the JWT token
    public String getUserNameFromJwtToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key()) // Use the same key for parsing
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject(); // Subject should be the email
    }

    // Validates the integrity and expiration of the JWT token
    public boolean validateJwtToken(String authToken) {
        if (!StringUtils.hasText(authToken)) {
            logger.warn("JWT token validation failed: Token string is empty or null.");
            return false;
        }
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key()) // Validate using the secret key
                    .build()
                    .parseClaimsJws(authToken); // This automatically checks expiration and signature
            return true;
        } catch (SignatureException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty or invalid: {}", e.getMessage());
        }
        // If any exception occurs, the token is invalid
        return false;
    }

    // Helper to parse the JWT from the Authorization header
    public String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        // Check if the header exists and starts with "Bearer "
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7); // Extract the token part
        }
        // Return null if header is missing or doesn't follow Bearer scheme
        return null;
    }
}