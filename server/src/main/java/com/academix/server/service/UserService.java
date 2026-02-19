package com.academix.server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.academix.server.model.User;
import java.time.LocalDateTime;
import java.util.UUID;

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
     * Find a user by email (placeholder - will be implemented with repository layer)
     * @param email The user's email
     * @return User if found, null otherwise
     */
    public User findByEmail(String email) {
        // This is a placeholder method. In production, this would use a repository
        // For now, return null to comply with interface
        return null;
    }
    
    /**
     * Save a user (placeholder - will be implemented with repository layer)
     * @param user The user to save
     * @return The saved user
     */
    public User save(User user) {
        // This is a placeholder method. In production, this would use a repository
        // For now, return the user as-is to comply with interface
        return user;
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

    /**
     * Generate password reset token for user
     * @param user The user to generate token for
     * @return The generated reset token
     */
    public String generatePasswordResetToken(User user) {
        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordExpiry(LocalDateTime.now().plusMinutes(15)); // 15 minutes validity
        return token;
    }

    /**
     * Generate email verification token for user
     * @param user The user to generate token for
     * @return The generated verification token
     */
    public String generateEmailVerificationToken(User user) {
        String token = UUID.randomUUID().toString();
        user.setEmailVerificationToken(token);
        user.setEmailVerificationExpiry(LocalDateTime.now().plusHours(24)); // 24 hours validity
        return token;
    }

    /**
     * Validate password reset token
     * @param user The user
     * @param token The token to validate
     * @return true if token is valid, false otherwise
     */
    public boolean isPasswordResetTokenValid(User user, String token) {
        return user.getResetPasswordToken() != null &&
               user.getResetPasswordToken().equals(token) &&
               user.getResetPasswordExpiry() != null &&
               user.getResetPasswordExpiry().isAfter(LocalDateTime.now());
    }

    /**
     * Validate email verification token
     * @param user The user
     * @param token The token to validate
     * @return true if token is valid, false otherwise
     */
    public boolean isEmailVerificationTokenValid(User user, String token) {
        return user.getEmailVerificationToken() != null &&
               user.getEmailVerificationToken().equals(token) &&
               user.getEmailVerificationExpiry() != null &&
               user.getEmailVerificationExpiry().isAfter(LocalDateTime.now());
    }

    /**
     * Clear password reset token
     * @param user The user
     */
    public void clearPasswordResetToken(User user) {
        user.setResetPasswordToken(null);
        user.setResetPasswordExpiry(null);
    }

    /**
     * Clear email verification token and mark email as verified
     * @param user The user
     */
    public void verifyEmail(User user) {
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiry(null);
        user.setEmailVerified(true);
    }

    /**
     * Check if user account is ready for login
     * @param user The user
     * @return true if account is active and email is verified, false otherwise
     */
    public boolean isAccountReady(User user) {
        return user.getIsActive() && !user.getIsDeleted() && user.getEmailVerified();
    }
}