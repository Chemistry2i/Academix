package com.academix.server.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.academix.server.dto.AuthDto.AuthResponse;
import com.academix.server.dto.AuthDto.ChangePasswordRequest;
import com.academix.server.dto.AuthDto.ForgotPasswordRequest;
import com.academix.server.dto.AuthDto.LoginRequest;
import com.academix.server.dto.AuthDto.RefreshTokenRequest;
import com.academix.server.dto.AuthDto.RegisterRequest;
import com.academix.server.dto.AuthDto.ResendTokenRequest;
import com.academix.server.dto.AuthDto.ResetPasswordRequest;
import com.academix.server.dto.AuthDto.UserInfo;
import com.academix.server.dto.AuthDto.VerifyEmailRequest;
import com.academix.server.model.Student;
import com.academix.server.model.User;
import com.academix.server.service.SecurityEnhancementService.PasswordValidationResult;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserService userService;

    @Autowired
    private EnhancedJwtService jwtService; // Use enhanced JWT service

    @Autowired
    private EmailService emailService;

    @Autowired
    private SecurityEnhancementService securityService; // Add security service

    // In-memory storage for testing (replace with repository in production)
    private final Map<String, User> userStorage = new HashMap<>();
    private Long userIdCounter = 1L;

    /**
     * Register a new user with enhanced security checks
     */
    public AuthResponse registerUser(RegisterRequest request) {
        try {
            // Rate limiting check
            if (securityService.isRateLimited(request.getEmail(), "REGISTER")) {
                throw new RuntimeException("Too many registration attempts. Please try again later.");
            }

            // Enhanced password validation
            PasswordValidationResult passwordValidation = securityService.validatePasswordStrength(request.getPassword());
            if (!passwordValidation.isValid()) {
                throw new RuntimeException("Password does not meet security requirements: " + 
                    String.join(", ", passwordValidation.getErrors()));
            }

            // Check if email already exists
            if (userStorage.values().stream().anyMatch(u -> u.getEmail().equals(request.getEmail()))) {
                securityService.recordSecurityEvent(request.getEmail(), "DUPLICATE_REGISTRATION", null);
                throw new RuntimeException("Email already exists");
            }

            // Create new student (or appropriate user type)
            Student student = new Student();
            student.setId(userIdCounter++);
            student.setFirstName(request.getFirstName());
            student.setOtherNames(request.getOtherNames());
            student.setLastName(request.getLastName());
            student.setEmail(request.getEmail());
            student.setPassword(request.getPassword());
            student.setPhoneNumber(request.getPhoneNumber());
            student.setDistrict(request.getDistrict());
            student.setGender(request.getGender());
            student.setCreatedAt(LocalDateTime.now());
            student.setUpdatedAt(LocalDateTime.now());
            student.setIsActive(true);
            student.setIsDeleted(false);
            student.setEmailVerified(false);

            // Hash password
            userService.prepareUserForSaving(student);

            // Generate email verification token
            String verificationToken = userService.generateEmailVerificationToken(student);

            // Store user
            userStorage.put(student.getEmail(), student);

            // Send verification email
            emailService.sendEmailVerificationEmail(student.getEmail(), verificationToken, student.getFullName());

            securityService.recordSecurityEvent(student.getEmail(), "USER_REGISTERED", "Role: " + getUserRole(student));
            logger.info("User registered successfully: {}", student.getEmail());

            return new AuthResponse("Registration successful! Please check your email to verify your account.");

        } catch (Exception e) {
            securityService.recordSecurityEvent(request.getEmail(), "REGISTRATION_FAILED", e.getMessage());
            logger.error("Registration failed for email: {}", request.getEmail(), e);
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    /**
     * Authenticate user login with enhanced security
     */
    public AuthResponse loginUser(LoginRequest request) {
        try {
            // Rate limiting check
            if (securityService.isRateLimited(request.getEmail(), "LOGIN")) {
                throw new RuntimeException("Too many login attempts. Please try again later.");
            }

            // Account lockout check
            if (securityService.isAccountLocked(request.getEmail())) {
                throw new RuntimeException("Account is temporarily locked due to multiple failed login attempts. Please try again later.");
            }

            // Find user by email
            User user = userStorage.get(request.getEmail());
            if (user == null) {
                securityService.recordFailedLoginAttempt(request.getEmail());
                throw new RuntimeException("Invalid email or password");
            }

            // Verify password
            if (!userService.verifyPassword(request.getPassword(), user.getPassword())) {
                securityService.recordFailedLoginAttempt(request.getEmail());
                throw new RuntimeException("Invalid email or password");
            }

            // Check if account is ready (active and verified)
            if (!userService.isAccountReady(user)) {
                if (!user.getEmailVerified()) {
                    throw new RuntimeException("Please verify your email before logging in");
                }
                if (!user.getIsActive()) {
                    throw new RuntimeException("Account is disabled. Please contact support");
                }
            }

            // Record successful login
            securityService.recordSuccessfulLogin(request.getEmail());

            // Generate tokens with shorter access token expiry for security
            String accessToken = jwtService.generateToken(user.getEmail(), getUserRole(user), user.getId());
            String refreshToken = jwtService.generateRefreshToken(user.getEmail());

            // Create user info
            UserInfo userInfo = new UserInfo(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                getUserRole(user),
                user.getEmailVerified(),
                user.getIsActive()
            );

            securityService.recordSecurityEvent(user.getEmail(), "LOGIN_SUCCESS", "Role: " + getUserRole(user));
            logger.info("User logged in successfully: {}", user.getEmail());

            return new AuthResponse(
                "Login successful",
                accessToken,
                refreshToken,
                jwtService.getJwtExpiration(),
                userInfo
            );

        } catch (Exception e) {
            securityService.recordSecurityEvent(request.getEmail(), "LOGIN_FAILED", e.getMessage());
            logger.error("Login failed for email: {}", request.getEmail(), e);
            throw new RuntimeException(e.getMessage());
        }
    }

    /**
     * Handle forgot password request with rate limiting
     */
    public AuthResponse forgotPassword(ForgotPasswordRequest request) {
        try {
            // Rate limiting for forgot password requests
            if (securityService.isRateLimited(request.getEmail(), "FORGOT_PASSWORD")) {
                throw new RuntimeException("Too many password reset requests. Please try again later.");
            }

            // Find user by email
            User user = userStorage.get(request.getEmail());
            if (user == null) {
                // Don't reveal if email exists or not for security
                securityService.recordSecurityEvent(request.getEmail(), "FORGOT_PASSWORD_UNKNOWN_EMAIL", null);
                return new AuthResponse("If the email exists in our system, a password reset link will be sent.");
            }

            // Generate password reset token
            String resetToken = userService.generatePasswordResetToken(user);

            // Send password reset email
            emailService.sendPasswordResetEmail(user.getEmail(), resetToken, user.getFullName());

            securityService.recordSecurityEvent(user.getEmail(), "PASSWORD_RESET_REQUESTED", null);
            logger.info("Password reset email sent to: {}", user.getEmail());

            return new AuthResponse("Password reset link has been sent to your email address.");

        } catch (Exception e) {
            securityService.recordSecurityEvent(request.getEmail(), "FORGOT_PASSWORD_FAILED", e.getMessage());
            logger.error("Forgot password failed for email: {}", request.getEmail(), e);
            throw new RuntimeException("Failed to process password reset request");
        }
    }

    /**
     * Reset user password with enhanced validation
     */
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        try {
            // Validate new password strength
            PasswordValidationResult passwordValidation = securityService.validatePasswordStrength(request.getNewPassword());
            if (!passwordValidation.isValid()) {
                throw new RuntimeException("Password does not meet security requirements: " + 
                    String.join(", ", passwordValidation.getErrors()));
            }

            // Find user by reset token
            User user = userStorage.values().stream()
                .filter(u -> userService.isPasswordResetTokenValid(u, request.getToken()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

            // Update password
            userService.updatePassword(user, request.getNewPassword());

            // Clear reset token
            userService.clearPasswordResetToken(user);

            // Blacklist any existing tokens for this user (force re-login)
            // Note: In production, you'd need to track and blacklist user's active tokens

            securityService.recordSecurityEvent(user.getEmail(), "PASSWORD_RESET_SUCCESS", null);
            logger.info("Password reset successfully for user: {}", user.getEmail());

            return new AuthResponse("Password has been reset successfully. You can now log in with your new password.");

        } catch (Exception e) {
            securityService.recordSecurityEvent("UNKNOWN", "PASSWORD_RESET_FAILED", e.getMessage());
            logger.error("Password reset failed", e);
            throw new RuntimeException(e.getMessage());
        }
    }

    /**
     * Enhanced token refresh with security checks
     */
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        try {
            // Validate refresh token type
            if (!jwtService.isValidTokenType(request.getRefreshToken(), "refresh")) {
                throw new RuntimeException("Invalid token type");
            }

            String username = jwtService.extractUsername(request.getRefreshToken());
            User user = userStorage.get(username);

            if (user != null && jwtService.isTokenValid(request.getRefreshToken(), username)) {
                // Generate new access token
                String newAccessToken = jwtService.generateToken(user.getEmail(), getUserRole(user), user.getId());

                // Optionally rotate refresh token for enhanced security
                String newRefreshToken = jwtService.generateRefreshToken(user.getEmail());
                
                // Blacklist old refresh token
                jwtService.blacklistToken(request.getRefreshToken());

                securityService.recordSecurityEvent(user.getEmail(), "TOKEN_REFRESHED", null);

                return new AuthResponse(
                    "Token refreshed successfully",
                    newAccessToken,
                    newRefreshToken,
                    jwtService.getJwtExpiration(),
                    null
                );
            } else {
                throw new RuntimeException("Invalid refresh token");
            }

        } catch (Exception e) {
            securityService.recordSecurityEvent("UNKNOWN", "TOKEN_REFRESH_FAILED", e.getMessage());
            logger.error("Token refresh failed", e);
            throw new RuntimeException("Invalid refresh token");
        }
    }

    /**
     * Enhanced logout with token blacklisting
     */
    public AuthResponse logout(String accessToken, String refreshToken) {
        try {
            // Blacklist both tokens
            if (accessToken != null && !accessToken.isEmpty()) {
                jwtService.blacklistToken(accessToken);
            }
            if (refreshToken != null && !refreshToken.isEmpty()) {
                jwtService.blacklistToken(refreshToken);
            }

            String username = jwtService.extractUsername(accessToken);
            securityService.recordSecurityEvent(username, "USER_LOGOUT", null);
            logger.info("User logout processed for: {}", username);

            return new AuthResponse("Logout successful");

        } catch (Exception e) {
            logger.error("Logout failed", e);
            return new AuthResponse("Logout completed"); // Always return success for security
        }
    }

    /**
     * Verify email address
     */
    public AuthResponse verifyEmail(VerifyEmailRequest request) {
        try {
            // Find user by verification token
            User user = userStorage.values().stream()
                .filter(u -> userService.isEmailVerificationTokenValid(u, request.getToken()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invalid or expired verification token"));

            // Verify email
            userService.verifyEmail(user);

            // Send welcome email
            emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

            securityService.recordSecurityEvent(user.getEmail(), "EMAIL_VERIFIED", null);
            logger.info("Email verified successfully for user: {}", user.getEmail());

            return new AuthResponse("Email verified successfully! Welcome to Academix.");

        } catch (Exception e) {
            securityService.recordSecurityEvent("UNKNOWN", "EMAIL_VERIFICATION_FAILED", e.getMessage());
            logger.error("Email verification failed", e);
            throw new RuntimeException(e.getMessage());
        }
    }

    /**
     * Resend verification or reset token with rate limiting
     */
    public AuthResponse resendToken(ResendTokenRequest request) {
        try {
            // Rate limiting for token resend
            if (securityService.isRateLimited(request.getEmail(), "RESEND_TOKEN")) {
                throw new RuntimeException("Too many token resend attempts. Please try again later.");
            }

            // Find user by email
            User user = userStorage.get(request.getEmail());
            if (user == null) {
                securityService.recordSecurityEvent(request.getEmail(), "RESEND_TOKEN_UNKNOWN_EMAIL", request.getTokenType());
                return new AuthResponse("If the email exists in our system, the token will be resent.");
            }

            if ("verification".equals(request.getTokenType())) {
                if (user.getEmailVerified()) {
                    throw new RuntimeException("Email is already verified");
                }

                String verificationToken = userService.generateEmailVerificationToken(user);
                emailService.sendEmailVerificationEmail(user.getEmail(), verificationToken, user.getFullName());
                securityService.recordSecurityEvent(user.getEmail(), "VERIFICATION_TOKEN_RESENT", null);
                
                return new AuthResponse("Verification email has been resent.");

            } else if ("reset".equals(request.getTokenType())) {
                String resetToken = userService.generatePasswordResetToken(user);
                emailService.sendPasswordResetEmail(user.getEmail(), resetToken, user.getFullName());
                securityService.recordSecurityEvent(user.getEmail(), "RESET_TOKEN_RESENT", null);
                
                return new AuthResponse("Password reset link has been resent.");

            } else {
                throw new RuntimeException("Invalid token type");
            }

        } catch (Exception e) {
            securityService.recordSecurityEvent(request.getEmail(), "RESEND_TOKEN_FAILED", e.getMessage());
            logger.error("Resend token failed for email: {}", request.getEmail(), e);
            throw new RuntimeException(e.getMessage());
        }
    }

    /**
     * Change user password with enhanced security
     */
    public AuthResponse changePassword(String userEmail, ChangePasswordRequest request) {
        try {
            // Rate limiting for password changes
            if (securityService.isRateLimited(userEmail, "CHANGE_PASSWORD")) {
                throw new RuntimeException("Too many password change attempts. Please try again later.");
            }

            // Enhanced password validation
            PasswordValidationResult passwordValidation = securityService.validatePasswordStrength(request.getNewPassword());
            if (!passwordValidation.isValid()) {
                throw new RuntimeException("Password does not meet security requirements: " + 
                    String.join(", ", passwordValidation.getErrors()));
            }

            // Find user by email
            User user = userStorage.get(userEmail);
            if (user == null) {
                throw new RuntimeException("User not found");
            }

            // Verify current password
            if (!userService.verifyPassword(request.getCurrentPassword(), user.getPassword())) {
                securityService.recordSecurityEvent(userEmail, "PASSWORD_CHANGE_WRONG_CURRENT", null);
                throw new RuntimeException("Current password is incorrect");
            }

            // Update password
            userService.updatePassword(user, request.getNewPassword());

            // Blacklist existing tokens (force re-login for security)
            // Note: In production, track and blacklist user's active tokens

            securityService.recordSecurityEvent(user.getEmail(), "PASSWORD_CHANGED", null);
            logger.info("Password changed successfully for user: {}", user.getEmail());

            return new AuthResponse("Password changed successfully.");

        } catch (Exception e) {
            securityService.recordSecurityEvent(userEmail, "PASSWORD_CHANGE_FAILED", e.getMessage());
            logger.error("Password change failed for user: {}", userEmail, e);
            throw new RuntimeException(e.getMessage());
        }
    }

    /**
     * Get user role (implement based on your user model)
     */
    private String getUserRole(User user) {
        // For Student type, return "STUDENT"
        // You can enhance this based on your role structure
        if (user instanceof Student) {
            return "STUDENT";
        }
        return "USER";
    }

    /**
     * Get security statistics (for admin monitoring)
     */
    public Map<String, Object> getSecurityStats() {
        return Map.of(
            "securityStats", securityService.getSecurityStats(),
            "tokenStats", jwtService.getTokenUsageStats()
        );
    }

    /**
     * Get all users (for testing only)
     */
    public Map<String, Object> getAllUsers() {
        Map<String, Object> response = new HashMap<>();
        response.put("totalUsers", userStorage.size());
        response.put("users", userStorage.values().stream()
            .map(user -> {
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", user.getId());
                userData.put("email", user.getEmail());
                userData.put("fullName", user.getFullName());
                userData.put("emailVerified", user.getEmailVerified());
                userData.put("isActive", user.getIsActive());
                userData.put("role", getUserRole(user));
                return userData;
            }).toList());
        return response;
    }

    /**
     * Debug method to get user details including tokens - FOR TESTING ONLY
     */
    public Map<String, Object> getDebugUserInfo(String email) {
        User user = userStorage.get(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Map<String, Object> debugInfo = new HashMap<>();
        debugInfo.put("id", user.getId());
        debugInfo.put("email", user.getEmail());
        debugInfo.put("fullName", user.getFullName());
        debugInfo.put("emailVerified", user.getEmailVerified());
        debugInfo.put("isActive", user.getIsActive());
        debugInfo.put("role", getUserRole(user));
        debugInfo.put("emailVerificationToken", user.getEmailVerificationToken());
        debugInfo.put("emailVerificationExpiry", user.getEmailVerificationExpiry());
        debugInfo.put("resetPasswordToken", user.getResetPasswordToken());
        debugInfo.put("resetPasswordExpiry", user.getResetPasswordExpiry());
        debugInfo.put("createdAt", user.getCreatedAt());

        return debugInfo;
    }
}