package com.example.studentresultsbackend.config;

import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
// Import specific serializers/deserializers if needed
// import com.fasterxml.jackson.datatype.jsr310.ser.InstantSerializer;
// import java.time.format.DateTimeFormatter;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jsonCustomizer() {
        return builder -> {
            // Register the JavaTimeModule to handle Java 8 Date/Time types
            builder.modules(new JavaTimeModule());
            // Ensure Timestamps are written as ISO-8601 strings instead of numeric arrays
            builder.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

            // By default, Instant is serialized to ISO-8601 UTC format (e.g., "2024-03-15T10:30:45.123Z")
            // which is generally what you want for frontend compatibility.
            // No need for custom serializers unless you require a very specific non-standard format.
            /* Example of forcing a specific format (usually not needed):
            DateTimeFormatter formatter = DateTimeFormatter.ISO_INSTANT;
            builder.serializers(new InstantSerializer(InstantSerializer.INSTANCE, false, formatter));
            */
        };
    }
}