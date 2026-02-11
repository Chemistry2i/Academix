package com.academix.server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.academix.server.model.User;

@Service
public class UserService {
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Hash a plain text password using BCrypt
     * @param plainPassword The plain text password
     * @return The hashed password
     */
    public String hashPassword(String plainPassword) {
        if (plainPassword == null || plainPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be null or empty");
        }
        return passwordEncoder.encode(plainPassword);
    }
    
    /**
     * Verify if a plain text password matches the hashed password
     * @param plainPassword The plain text password
     * @param hashedPassword The stored hashed password
     * @return true if passwords match, false otherwise
     */
    public boolean verifyPassword(String plainPassword, String hashedPassword) {
        if (plainPassword == null || hashedPassword == null) {
            return false;
        }
        return passwordEncoder.matches(plainPassword, hashedPassword);
    }
    
    /**
     * Prepare a user for saving by hashing their password
     * This method should be called before saving a user to the database
     * @param user The user object with plain text password
     */
    public void prepareUserForSaving(User user) {
        if (user.getPassword() != null && !isPasswordAlreadyHashed(user.getPassword())) {
            String hashedPassword = hashPassword(user.getPassword());
            user.setPassword(hashedPassword);
        }
    }
    
    /**
     * Check if a password is already hashed (starts with $2a$, $2b$, or $2y$ for BCrypt)
     * @param password The password to check
     * @return true if already hashed, false otherwise
     */
    private boolean isPasswordAlreadyHashed(String password) {
        return password != null && 
               (password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$"));
    }
    
    /**
     * Update user password with proper hashing
     * @param user The user to update
     * @param newPlainPassword The new plain text password
     */
    public void updatePassword(User user, String newPlainPassword) {
        String hashedPassword = hashPassword(newPlainPassword);
        user.setPassword(hashedPassword);
    }
}