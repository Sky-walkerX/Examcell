package com.example.studentresultsbackend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService; // Use interface here
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component; // Register as component if not using @Bean in config
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// @Component // Can be registered as component or via @Bean in SecurityConfig
public class AuthTokenFilter extends OncePerRequestFilter {

    @Autowired // Inject dependencies
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsService userDetailsService; // Inject the interface, Spring provides UserDetailsServiceImpl

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        logger.trace("AuthTokenFilter processing request for URI: {}", requestURI);

        try {
            // 1. Parse JWT from the request header
            String jwt = jwtUtils.parseJwt(request);

            // 2. Check if JWT exists and is valid
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                // 3. Extract username (email) from token
                String username = jwtUtils.getUserNameFromJwtToken(jwt);
                logger.trace("Valid JWT found for user: {}", username);

                // 4. Load UserDetails from database using the username (email)
                // Note: This potentially hits the DB on every authenticated request. Consider caching strategies for high traffic.
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // 5. Create an Authentication token (UsernamePasswordAuthenticationToken is common)
                // We use userDetails as the principal, null for credentials (already validated by JWT),
                // and the authorities loaded from UserDetails.
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null, // Credentials not needed post-JWT validation
                                userDetails.getAuthorities());

                // 6. Set additional details (like IP address, session ID - useful for logging/auditing)
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 7. Set the Authentication object in the SecurityContextHolder.
                // This makes the user officially "authenticated" for this request thread.
                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.trace("User {} authenticated successfully via JWT.", username);

            } else {
                // Optional: Log if JWT parsing/validation failed for debugging, but be careful not to log tokens
                if (jwt != null) {
                    logger.trace("Invalid JWT token received for URI: {}", requestURI);
                } else {
                    logger.trace("No JWT token found in Authorization header for URI: {}", requestURI);
                }
            }
        } catch (Exception e) {
            // Catch any unexpected errors during the process
            logger.error("Cannot set user authentication for URI {}: {}", requestURI, e.getMessage(), e);
            // Ensure context is cleared if an error occurs during authentication setting
            // SecurityContextHolder.clearContext(); // Optional: depends on desired behavior
        }

        // 8. Continue the filter chain, allowing the request to proceed to the next filter or the controller
        filterChain.doFilter(request, response);
    }
}