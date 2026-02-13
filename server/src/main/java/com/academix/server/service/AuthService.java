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

    @Autowired
    private MFAService mfaService; // Add MFA service

    // In-memory storage for testing (replace with repository in production)
    private final Map<String, User> userStorage = new HashMap<>();
    private Long userIdCounter = 1L;
    
    // Reference to student storage for unified login (temporary solution until unified database)
    private static Map<String, Student> studentStorage = new HashMap<>();
    
    // Method to set student storage reference (called from StudentController)
    public static void setStudentStorage(Map<String, Student> storage) {
        studentStorage = storage;
    }

    /**
     * Register a new user with enhanced security checks
     */
    public AuthResponse registerUser(RegisterRequest request) {
        try {
            // Rate limiting check
            if (securityService.isRateLimited(request.getEmail(), "REGISTER")) {
                throw new RuntimeException("Too many registration attempts. Please try again later.");
            }

            // Check if email already exists
            if (userStorage.values().stream().anyMatch(u -> u.getEmail().equals(request.getEmail()))) {
                securityService.recordSecurityEvent(request.getEmail(), "DUPLICATE_REGISTRATION", null);
                throw new RuntimeException("Email already exists");
            }

            // Generate secure password for the user
            String generatedPassword = emailService.generateSecurePassword(10);

            // Create new student (or appropriate user type)
            Student student = new Student();
            student.setId(userIdCounter++);
            student.setFirstName(request.getFirstName());
            student.setOtherNames(request.getOtherNames());
            student.setLastName(request.getLastName());
            student.setEmail(request.getEmail());
            student.setPassword(generatedPassword);
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
            
            // Also send credentials email for immediate login capability
            try {
                emailService.sendUserCredentialsEmail(student.getEmail(), student.getFullName(), generatedPassword);
            } catch (Exception credentialsError) {
                logger.warn("Credentials email failed but registration continues: {}", credentialsError.getMessage());
            }

            securityService.recordSecurityEvent(student.getEmail(), "USER_REGISTERED", "Role: " + getUserRole(student));
            logger.info("User registered successfully: {}", student.getEmail());

            return new AuthResponse("Registration successful! Your login credentials have been sent to your email. Please also verify your email for full account activation.");

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

            // Check if MFA is enabled for the user
            if (mfaService.isMFAEnabled(user.getEmail())) {
                // Generate temporary token for MFA flow
                String tempToken = jwtService.generateTempToken(user.getEmail(), 10); // 10 minute expiry
                
                // Send MFA challenge
                boolean challengeSent = mfaService.sendMFAChallenge(user.getEmail());
                
                if (challengeSent) {
                    securityService.recordSecurityEvent(user.getEmail(), "MFA_CHALLENGE_SENT", null);
                    logger.info("MFA challenge sent for user: {}", user.getEmail());
                    
                    return new AuthResponse(
                        "MFA verification required",
                        null, // No access token yet
                        null, // No refresh token yet  
                        0L,   // No expiration yet
                        null, // No user info yet
                        true, // requiresMFA flag
                        tempToken // Temporary token for MFA verification
                    );
                } else {
                    throw new RuntimeException("Failed to send MFA challenge. Please try again.");
                }
            }

            // No MFA required - proceed with normal login
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
     * Unified login that checks both user storage and student storage
     * This allows all user types (students, staff, admin) to login through one endpoint
     */
    public AuthResponse unifiedLogin(LoginRequest request) {
        try {
            // Rate limiting check
            if (securityService.isRateLimited(request.getEmail(), "LOGIN")) {
                throw new RuntimeException("Too many login attempts. Please try again later.");
            }

            // Account lockout check 
            if (securityService.isAccountLocked(request.getEmail())) {
                throw new RuntimeException("Account is temporarily locked due to multiple failed login attempts. Please try again later.");
            }

            User foundUser = null;
            String userType = "UNKNOWN";

            // First, check regular user storage (AuthService)
            foundUser = userStorage.get(request.getEmail());
            if (foundUser != null) {
                userType = "USER";
            } else {
                // If not found in user storage, check student storage
                Student student = studentStorage.get(request.getEmail());
                if (student != null) {
                    foundUser = student; // Student extends User
                    userType = "STUDENT";
                }
            }

            // If user not found in either storage
            if (foundUser == null) {
                securityService.recordFailedLoginAttempt(request.getEmail());
                throw new RuntimeException("Invalid email or password");
            }

            // Verify password
            if (!userService.verifyPassword(request.getPassword(), foundUser.getPassword())) {
                securityService.recordFailedLoginAttempt(request.getEmail());
                throw new RuntimeException("Invalid email or password");
            }

            // Check if email is verified BEFORE allowing login
            if (!foundUser.getEmailVerified()) {
                securityService.recordSecurityEvent(request.getEmail(), "LOGIN_BLOCKED_UNVERIFIED_EMAIL", "UserType: " + userType);
                throw new RuntimeException("Please verify your email before logging in. Check your email inbox for the verification link.");
            }

            // Check if account is active
            if (!foundUser.getIsActive()) {
                throw new RuntimeException("Account is disabled. Please contact support");
            }

            // Record successful login
            securityService.recordSuccessfulLogin(request.getEmail());

            // Generate JWT tokens
            String accessToken = jwtService.generateToken(foundUser.getEmail(), getUserRole(foundUser), foundUser.getId());
            String refreshToken = jwtService.generateRefreshToken(foundUser.getEmail());

            // Create user info with role-specific details
            UserInfo userInfo;
            if ("STUDENT".equals(userType)) {
                Student student = (Student) foundUser;
                userInfo = new UserInfo(
                    student.getId(),
                    student.getEmail(),
                    student.getFullName(),
                    "STUDENT",
                    foundUser.getEmailVerified() != null ? foundUser.getEmailVerified() : true,
                    foundUser.getIsActive()
                );
                // Add student-specific info
                userInfo.setStudentId(student.getStudentId());
                userInfo.setCurrentClass(student.getCurrentClass());
                userInfo.setStream(student.getStream());
            } else {
                userInfo = new UserInfo(
                    foundUser.getId(),
                    foundUser.getEmail(),
                    foundUser.getFullName(),
                    getUserRole(foundUser),
                    foundUser.getEmailVerified() != null ? foundUser.getEmailVerified() : true,
                    foundUser.getIsActive()
                );
            }

            securityService.recordSecurityEvent(foundUser.getEmail(), "UNIFIED_LOGIN_SUCCESS", 
                "UserType: " + userType + ", Role: " + getUserRole(foundUser));
            logger.info("Unified login successful for {}: {} ({})", userType, foundUser.getEmail(), getUserRole(foundUser));

            return new AuthResponse(
                "Login successful - " + userType,
                accessToken,
                refreshToken,
                jwtService.getJwtExpiration(),
                userInfo
            );

        } catch (Exception e) {
            securityService.recordSecurityEvent(request.getEmail(), "UNIFIED_LOGIN_FAILED", e.getMessage());
            logger.error("Unified login failed for email: {}", request.getEmail(), e);
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
     * Verify email address - Works for all user types (students and general users)
     */
    public AuthResponse verifyEmail(VerifyEmailRequest request) {
        try {
            User foundUser = null;
            String userType = "UNKNOWN";

            // First, search in regular user storage (AuthService)
            foundUser = userStorage.values().stream()
                .filter(u -> userService.isEmailVerificationTokenValid(u, request.getToken()))
                .findFirst()
                .orElse(null);
                
            if (foundUser != null) {
                userType = "USER";
            } else {
                // If not found in user storage, search in student storage
                foundUser = studentStorage.values().stream()
                    .filter(s -> userService.isEmailVerificationTokenValid(s, request.getToken()))
                    .findFirst()
                    .orElse(null);
                    
                if (foundUser != null) {
                    userType = "STUDENT";
                }
            }
            
            // If user not found in either storage
            if (foundUser == null) {
                securityService.recordSecurityEvent("UNKNOWN", "EMAIL_VERIFICATION_FAILED", "Invalid token: " + request.getToken());
                throw new RuntimeException("Invalid or expired verification token");
            }

            // Verify email
            userService.verifyEmail(foundUser);

            // Send welcome email
            emailService.sendWelcomeEmail(foundUser.getEmail(), foundUser.getFullName());

            securityService.recordSecurityEvent(foundUser.getEmail(), "EMAIL_VERIFIED", "UserType: " + userType);
            logger.info("Email verified successfully for {} user: {}", userType, foundUser.getEmail());

            return new AuthResponse("Email verified successfully! Welcome to Academix. You can now login with your credentials.");

        } catch (Exception e) {
            securityService.recordSecurityEvent("UNKNOWN", "EMAIL_VERIFICATION_FAILED", e.getMessage());
            logger.error("Email verification failed", e);
            throw new RuntimeException(e.getMessage());
        }
    }

    /**
     * Resend verification or reset token with rate limiting - Works for all user types
     */
    public AuthResponse resendToken(ResendTokenRequest request) {
        try {
            // Rate limiting for token resend
            if (securityService.isRateLimited(request.getEmail(), "RESEND_TOKEN")) {
                throw new RuntimeException("Too many token resend attempts. Please try again later.");
            }

            User foundUser = null;
            String userType = "UNKNOWN";

            // First, check regular user storage (AuthService)
            foundUser = userStorage.get(request.getEmail());
            if (foundUser != null) {
                userType = "USER";
            } else {
                // If not found in user storage, check student storage
                foundUser = studentStorage.get(request.getEmail());
                if (foundUser != null) {
                    userType = "STUDENT";
                }
            }

            if (foundUser == null) {
                securityService.recordSecurityEvent(request.getEmail(), "RESEND_TOKEN_UNKNOWN_EMAIL", request.getTokenType());
                return new AuthResponse("If the email exists in our system, the token will be resent.");
            }

            if ("verification".equals(request.getTokenType())) {
                if (foundUser.getEmailVerified()) {
                    throw new RuntimeException("Email is already verified");
                }

                String verificationToken = userService.generateEmailVerificationToken(foundUser);
                emailService.sendEmailVerificationEmail(foundUser.getEmail(), verificationToken, foundUser.getFullName());
                securityService.recordSecurityEvent(foundUser.getEmail(), "VERIFICATION_TOKEN_RESENT", "UserType: " + userType);
                
                return new AuthResponse("Verification email has been resent to " + foundUser.getEmail() + ". Please check your inbox and click the verification link.");

            } else if ("reset".equals(request.getTokenType())) {
                String resetToken = userService.generatePasswordResetToken(foundUser);
                emailService.sendPasswordResetEmail(foundUser.getEmail(), resetToken, foundUser.getFullName());
                securityService.recordSecurityEvent(foundUser.getEmail(), "RESET_TOKEN_RESENT", "UserType: " + userType);
                
                return new AuthResponse("Password reset link has been resent to " + foundUser.getEmail() + ". Please check your inbox.");

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
     * Get all users including students (for testing only)
     */
    public Map<String, Object> getAllUsers() {
        Map<String, Object> response = new HashMap<>();
        
        // Get general users
        var generalUsers = userStorage.values().stream()
            .map(user -> {
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", user.getId());
                userData.put("email", user.getEmail());
                userData.put("fullName", user.getFullName());
                userData.put("emailVerified", user.getEmailVerified());
                userData.put("isActive", user.getIsActive());
                userData.put("role", getUserRole(user));
                userData.put("userType", "USER");
                userData.put("emailVerificationToken", user.getEmailVerificationToken());
                userData.put("emailVerificationExpiry", user.getEmailVerificationExpiry());
                return userData;
            }).toList();
            
        // Get students
        var students = studentStorage.values().stream()
            .map(student -> {
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", student.getId());
                userData.put("email", student.getEmail());
                userData.put("fullName", student.getFullName());
                userData.put("emailVerified", student.getEmailVerified());
                userData.put("isActive", student.getIsActive());
                userData.put("role", "STUDENT");
                userData.put("userType", "STUDENT");
                userData.put("studentId", student.getStudentId());
                userData.put("currentClass", student.getCurrentClass());
                userData.put("emailVerificationToken", student.getEmailVerificationToken());
                userData.put("emailVerificationExpiry", student.getEmailVerificationExpiry());
                return userData;
            }).toList();
            
        response.put("totalGeneralUsers", userStorage.size());
        response.put("totalStudents", studentStorage.size());
        response.put("totalUsers", userStorage.size() + studentStorage.size());
        response.put("users", generalUsers);
        response.put("students", students);
        
        return response;
    }

    /**
     * Debug method to get user details including tokens - FOR TESTING ONLY
     * Searches both user and student storages
     */
    public Map<String, Object> getDebugUserInfo(String email) {
        User foundUser = null;
        String userType = "UNKNOWN";

        // First, check regular user storage
        foundUser = userStorage.get(email);
        if (foundUser != null) {
            userType = "USER";
        } else {
            // If not found in user storage, check student storage
            foundUser = studentStorage.get(email);
            if (foundUser != null) {
                userType = "STUDENT";
            }
        }

        if (foundUser == null) {
            throw new RuntimeException("User not found in either user or student storage");
        }

        Map<String, Object> debugInfo = new HashMap<>();
        debugInfo.put("id", foundUser.getId());
        debugInfo.put("email", foundUser.getEmail());
        debugInfo.put("fullName", foundUser.getFullName());
        debugInfo.put("emailVerified", foundUser.getEmailVerified());
        debugInfo.put("isActive", foundUser.getIsActive());
        debugInfo.put("role", getUserRole(foundUser));
        debugInfo.put("userType", userType);
        debugInfo.put("emailVerificationToken", foundUser.getEmailVerificationToken());
        debugInfo.put("emailVerificationExpiry", foundUser.getEmailVerificationExpiry());
        debugInfo.put("resetPasswordToken", foundUser.getResetPasswordToken());
        debugInfo.put("resetPasswordExpiry", foundUser.getResetPasswordExpiry());
        debugInfo.put("createdAt", foundUser.getCreatedAt());

        // Add student-specific info if it's a student
        if ("STUDENT".equals(userType)) {
            Student student = (Student) foundUser;
            debugInfo.put("studentId", student.getStudentId());
            debugInfo.put("currentClass", student.getCurrentClass());
            debugInfo.put("stream", student.getStream());
        }

        return debugInfo;
    }

    /**
     * Complete MFA login with verification code
     */
    public AuthResponse completeMFALogin(String tempToken, String mfaCode, String method) {
        try {
            // Validate the temporary token
            String email = jwtService.extractUsername(tempToken);
            
            if (!jwtService.isValidTempToken(tempToken, email)) {
                throw new RuntimeException("Invalid or expired temporary token. Please login again.");
            }

            // Find user
            User user = userStorage.get(email);
            if (user == null) {
                throw new RuntimeException("User not found");
            }

            // Verify MFA code
            MFAService.MFAMethod mfaMethod = null;
            if (method != null) {
                try {
                    mfaMethod = MFAService.MFAMethod.valueOf(method.toUpperCase());
                } catch (IllegalArgumentException e) {
                    throw new RuntimeException("Invalid MFA method specified");
                }
            }

            boolean mfaValid = mfaService.verifyMFACode(email, mfaCode, mfaMethod);
            
            if (!mfaValid) {
                securityService.recordSecurityEvent(email, "MFA_VERIFICATION_FAILED", "Method: " + method);
                throw new RuntimeException("Invalid MFA verification code");
            }

            // MFA verification successful - blacklist the temp token
            jwtService.blacklistToken(tempToken);

            // Generate actual access and refresh tokens
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

            securityService.recordSecurityEvent(email, "MFA_LOGIN_SUCCESS", "Method: " + method + ", Role: " + getUserRole(user));
            logger.info("MFA login completed successfully for user: {}", email);

            return new AuthResponse(
                "MFA verification successful. Login completed.",
                accessToken,
                refreshToken,
                jwtService.getJwtExpiration(),
                userInfo
            );

        } catch (Exception e) {
            logger.error("MFA login completion failed", e);
            throw new RuntimeException(e.getMessage());
        }
    }
}