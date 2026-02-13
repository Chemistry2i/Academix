package com.academix.server.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints - Authentication related
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                
                // Database console for development
                .requestMatchers("/h2-console/**").permitAll()
                
                // Health check and actuator endpoints
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                
                // Static resources and essential paths
                .requestMatchers("/", "/index.html", "/home").permitAll()
                .requestMatchers("/static/**", "/css/**", "/js/**", "/images/**", "/fonts/**").permitAll()
                .requestMatchers("/favicon.ico", "/robots.txt").permitAll()
                
                // Test and documentation pages (remove in production)
                .requestMatchers("/auth-test.html", "/test/**").permitAll()
                
                // Error pages
                .requestMatchers("/error", "/error/**").permitAll()
                
                // Allow all requests for development (comment out for production)
                .anyRequest().permitAll()
                
                // For production, use this instead:
                // .anyRequest().authenticated()
            )
            // Allow H2 console frames
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()));
            
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Password encoder bean using BCrypt algorithm
     * BCrypt is considered one of the most secure hashing algorithms
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Strength of 12 (good balance of security vs performance)
    }
}