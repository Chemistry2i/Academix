package com.academix.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    // This class is intentionally left empty to disable Spring Security's default configuration

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF protection for simplicity
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll()); // Allow all requests without authentication
        return http.build();
    }
}