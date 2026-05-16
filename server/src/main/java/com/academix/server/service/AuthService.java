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
import com.academix.server.model.Staff;
import com.academix.server.model.Student;
import com.academix.server.model.Teacher;
import com.academix.server.model.User;
import com.academix.server.repository.StaffRepository;
import com.academix.server.repository.StudentRepository;
import com.academix.server.repository.TeacherRepository;
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
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StaffRepository staffRepository;

    /**
     * Register a new user with enhanced security checks
     */
    public AuthResponse registerUser(RegisterRequest request) {
        try {
            // Rate limiting check
            if (securityService.isRateLimited(request.getEmail(), "REGISTER")) {
                throw new RuntimeException("Too many registration attempts. Please try again later.");
            }

            // Check if email already exists in any repository
            if (studentRepository.findByEmail(request.getEmail()).isPresent() ||
                teacherRepository.findByEmail(request.getEmail()).isPresent() ||
                staffRepository.findByEmail(request.getEmail()).isPresent()) {
                securityService.recordSecurityEvent(request.getEmail(), "DUPLICATE_REGISTRATION", null);
                throw new RuntimeException("Email already exists");
            }

            // Generate secure password for the user
            String generatedPassword = emailService.generateSecurePassword(10);

            // Determine user type based on role and create appropriate entity
            User user = null;
            String role = request.getRole() != null ? request.getRole().toUpperCase() : "STUDENT";

            if ("TEACHER".equals(role)) {
                Teacher teacher = new Teacher();
                teacher.setFirstName(request.getFirstName());
                teacher.setOtherNames(request.getOtherNames());
                teacher.setLastName(request.getLastName());
                teacher.setEmail(request.getEmail());
                teacher.setPassword(generatedPassword);
                teacher.setPhoneNumber(request.getPhoneNumber());
                teacher.setDistrict(request.getDistrict());
                teacher.setGender(request.getGender());
                teacher.setCreatedAt(LocalDateTime.now());
                teacher.setUpdatedAt(LocalDateTime.now());
                teacher.setIsActive(true);
                teacher.setIsDeleted(false);
                teacher.setEmailVerified(false);
                
                userService.prepareUserForSaving(teacher);
                String verificationToken = userService.generateEmailVerificationToken(teacher);
                teacher = teacherRepository.save(teacher);
                
                // Generate unique teacher ID
                String teacherId = "TCH" + String.format("%06d", teacher.getId());
                teacher.setTeacherId(teacherId);
                teacher = teacherRepository.save(teacher);
                
                user = teacher;
                
                // Send emails
                emailService.sendEmailVerificationEmail(teacher.getEmail(), verificationToken, teacher.getFullName());
                try {
                    emailService.sendUserCredentialsEmail(teacher.getEmail(), teacher.getFullName(), generatedPassword);
                } catch (Exception credentialsError) {
                    logger.warn("Credentials email failed but registration continues: {}", credentialsError.getMessage());
                }
            } else if ("ADMIN".equals(role)) {
                Staff staff = new Staff();
                staff.setFirstName(request.getFirstName());
                staff.setOtherNames(request.getOtherNames());
                staff.setLastName(request.getLastName());
                staff.setEmail(request.getEmail());
                staff.setPassword(generatedPassword);
                staff.setPhoneNumber(request.getPhoneNumber());
                staff.setDistrict(request.getDistrict());
                staff.setGender(request.getGender());
                staff.setCreatedAt(LocalDateTime.now());
                staff.setUpdatedAt(LocalDateTime.now());
                staff.setIsActive(true);
                staff.setIsDeleted(false);
                staff.setEmailVerified(false);
                
                userService.prepareUserForSaving(staff);
                String verificationToken = userService.generateEmailVerificationToken(staff);
                staff = staffRepository.save(staff);
                
                // Generate unique staff ID
                String staffId = "STAFF" + String.format("%06d", staff.getId());
                staff.setStaffId(staffId);
                staff = staffRepository.save(staff);
                
                user = staff;
                
                // Send emails
                emailService.sendEmailVerificationEmail(staff.getEmail(), verificationToken, staff.getFullName());
                try {
                    emailService.sendUserCredentialsEmail(staff.getEmail(), staff.getFullName(), generatedPassword);
                } catch (Exception credentialsError) {
                    logger.warn("Credentials email failed but registration continues: {}", credentialsError.getMessage());
                }
            } else {
                // Default to STUDENT
                Student student = new Student();
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

                userService.prepareUserForSaving(student);
                String verificationToken = userService.generateEmailVerificationToken(student);
                student = studentRepository.save(student);

                // Generate unique student ID based on the auto-generated database ID
                String studentId = "STU" + String.format("%06d", student.getId());
                student.setStudentId(studentId);
                student = studentRepository.save(student);

                user = student;
                
                // Send verification email
                emailService.sendEmailVerificationEmail(student.getEmail(), verificationToken, student.getFullName());
                
                // Also send credentials email for immediate login capability
                try {
                    emailService.sendUserCredentialsEmail(student.getEmail(), student.getFullName(), generatedPassword);
                } catch (Exception credentialsError) {
                    logger.warn("Credentials email failed but registration continues: {}", credentialsError.getMessage());
                }
            }

            securityService.recordSecurityEvent(user.getEmail(), "USER_REGISTERED", "Role: " + getUserRole(user) + ", ID: " + getGeneratedId(user));
            logger.info("User registered successfully: {} with ID: {}", user.getEmail(), getGeneratedId(user));

            return new AuthResponse("Registration successful! Your login credentials have been sent to your email. Please also verify your email for full account activation.");

        } catch (Exception e) {
            securityService.recordSecurityEvent(request.getEmail(), "REGISTRATION_FAILED", e.getMessage());
            logger.error("Registration failed for email: {}", request.getEmail(), e);
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    /**
     * Authenticate user login with enhanced security
     * Supports both email and ID-based login (student ID, teacher ID)
     */
    public AuthResponse loginUser(LoginRequest request) {
        try {
            // Determine the identifier (use 'identifier' field, fallback to 'email' for backward compatibility)
            String loginIdentifier = request.getIdentifier() != null ? request.getIdentifier() : request.getEmail();
            
            if (loginIdentifier == null || loginIdentifier.trim().isEmpty()) {
                throw new RuntimeException("Email or ID is required");
            }

            // Rate limiting check
            if (securityService.isRateLimited(loginIdentifier, "LOGIN")) {
                throw new RuntimeException("Too many login attempts. Please try again later.");
            }

            // Account lockout check
            if (securityService.isAccountLocked(loginIdentifier)) {
                throw new RuntimeException("Account is temporarily locked due to multiple failed login attempts. Please try again later.");
            }

            // Find user by email or ID (student/teacher ID)
            User user = findUserByEmailOrId(loginIdentifier);
            if (user == null) {
                securityService.recordFailedLoginAttempt(loginIdentifier);
                throw new RuntimeException("Invalid email/ID or password");
            }

            // Verify password
            if (!userService.verifyPassword(request.getPassword(), user.getPassword())) {
                securityService.recordFailedLoginAttempt(loginIdentifier);
                throw new RuntimeException("Invalid email/ID or password");
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
            securityService.recordSuccessfulLogin(loginIdentifier);

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

            securityService.recordSecurityEvent(user.getEmail(), "LOGIN_SUCCESS", "Role: " + getUserRole(user) + " (via: " + (isEmail(loginIdentifier) ? "email" : "ID") + ")");
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
            User user = findUserByEmail(request.getEmail());
            if (user == null) {
                // Don't reveal if email exists or not for security
                securityService.recordSecurityEvent(request.getEmail(), "FORGOT_PASSWORD_UNKNOWN_EMAIL", null);
                return new AuthResponse("If the email exists in our system, a password reset link will be sent.");
            }

            // Generate password reset token
            String resetToken = userService.generatePasswordResetToken(user);

            // CRITICAL FIX: Save user to database with the generated token
            saveUserToDatabase(user);

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

            // Find user by reset token - search all repositories
            User user = null;
            
            // Search students
            java.util.Optional<Student> studentOpt = studentRepository.findAll().stream()
                .filter(u -> userService.isPasswordResetTokenValid(u, request.getToken()))
                .findFirst();
            if (studentOpt.isPresent()) {
                user = studentOpt.get();
            } else {
                // Search teachers
                java.util.Optional<Teacher> teacherOpt = teacherRepository.findAll().stream()
                    .filter(u -> userService.isPasswordResetTokenValid(u, request.getToken()))
                    .findFirst();
                if (teacherOpt.isPresent()) {
                    user = teacherOpt.get();
                } else {
                    // Search staff
                    java.util.Optional<Staff> staffOpt = staffRepository.findAll().stream()
                        .filter(u -> userService.isPasswordResetTokenValid(u, request.getToken()))
                        .findFirst();
                    if (staffOpt.isPresent()) {
                        user = staffOpt.get();
                    }
                }
            }
            
            if (user == null) {
                throw new RuntimeException("Invalid or expired reset token");
            }

            // Update password
            userService.updatePassword(user, request.getNewPassword());

            // Clear reset token
            userService.clearPasswordResetToken(user);

            // CRITICAL FIX: Save user to database with updated password and cleared token
            saveUserToDatabase(user);

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
            User user = findUserByEmail(username);

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
            // Find user by verification token - search all repositories
            User user = null;
            
            // Search students
            java.util.Optional<Student> studentOpt = studentRepository.findAll().stream()
                .filter(u -> userService.isEmailVerificationTokenValid(u, request.getToken()))
                .findFirst();
            if (studentOpt.isPresent()) {
                user = studentOpt.get();
            } else {
                // Search teachers
                java.util.Optional<Teacher> teacherOpt = teacherRepository.findAll().stream()
                    .filter(u -> userService.isEmailVerificationTokenValid(u, request.getToken()))
                    .findFirst();
                if (teacherOpt.isPresent()) {
                    user = teacherOpt.get();
                } else {
                    // Search staff
                    java.util.Optional<Staff> staffOpt = staffRepository.findAll().stream()
                        .filter(u -> userService.isEmailVerificationTokenValid(u, request.getToken()))
                        .findFirst();
                    if (staffOpt.isPresent()) {
                        user = staffOpt.get();
                    }
                }
            }
            
            if (user == null) {
                throw new RuntimeException("Invalid or expired verification token");
            }

            // Verify email
            userService.verifyEmail(user);
            
            // Save updated user to database
            saveUserToDatabase(user);

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
            User user = findUserByEmail(request.getEmail());
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
                
                // Save updated user to database
                if (user instanceof Student) {
                    studentRepository.save((Student) user);
                } else if (user instanceof Teacher) {
                    teacherRepository.save((Teacher) user);
                } else if (user instanceof Staff) {
                    staffRepository.save((Staff) user);
                }
                
                securityService.recordSecurityEvent(user.getEmail(), "VERIFICATION_TOKEN_RESENT", null);
                
                return new AuthResponse("Verification email has been resent.");

            } else if ("reset".equals(request.getTokenType())) {
                String resetToken = userService.generatePasswordResetToken(user);
                emailService.sendPasswordResetEmail(user.getEmail(), resetToken, user.getFullName());
                
                // Save updated user to database
                if (user instanceof Student) {
                    studentRepository.save((Student) user);
                } else if (user instanceof Teacher) {
                    teacherRepository.save((Teacher) user);
                } else if (user instanceof Staff) {
                    staffRepository.save((Staff) user);
                }
                
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
            User user = findUserByEmail(userEmail);
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
            
            // Save updated user to database
            saveUserToDatabase(user);

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
        if (user instanceof Teacher) {
            return "TEACHER";
        }
        if (user instanceof Staff) {
            return "ADMIN";
        }
        return "USER";
    }

    /**
     * Get the generated ID for a user (studentId, teacherId, staffId, etc.)
     */
    private String getGeneratedId(User user) {
        if (user instanceof Student) {
            return ((Student) user).getStudentId();
        }
        if (user instanceof Teacher) {
            return ((Teacher) user).getTeacherId();
        }
        if (user instanceof Staff) {
            return ((Staff) user).getStaffId();
        }
        return null;
    }

    /**
     * Find user by email across all repositories (database only)
     */
    private User findUserByEmail(String email) {
        // Check Student repository first
        var student = studentRepository.findByEmail(email);
        if (student.isPresent()) {
            return student.get();
        }
        
        // Check Teacher repository
        var teacher = teacherRepository.findByEmail(email);
        if (teacher.isPresent()) {
            return teacher.get();
        }
        
        // Check Staff repository
        var staff = staffRepository.findByEmail(email);
        if (staff.isPresent()) {
            return staff.get();
        }
        
        return null;
    }

    /**
     * Find user by student ID
     * Searches for a student with the given student ID
     */
    private User findUserByStudentId(String studentId) {
        var students = studentRepository.findAll();
        return students.stream()
            .filter(s -> s.getStudentId() != null && s.getStudentId().equalsIgnoreCase(studentId))
            .findFirst()
            .orElse(null);
    }

    /**
     * Find user by teacher ID
     * Searches for a teacher with the given teacher ID
     */
    private User findUserByTeacherId(String teacherId) {
        var teachers = teacherRepository.findAll();
        return teachers.stream()
            .filter(t -> t.getTeacherId() != null && t.getTeacherId().equalsIgnoreCase(teacherId))
            .findFirst()
            .orElse(null);
    }

    /**
     * Find user by staff ID
     * Searches for a staff member with the given staff ID
     */
    private User findUserByStaffId(String staffId) {
        var staffMembers = staffRepository.findAll();
        return staffMembers.stream()
            .filter(s -> s.getStaffId() != null && s.getStaffId().equalsIgnoreCase(staffId))
            .findFirst()
            .orElse(null);
    }

    /**
     * Find user by email or ID (student/teacher/staff ID)
     * Supports flexible login using email or student/teacher/staff ID
     */
    private User findUserByEmailOrId(String emailOrId) {
        // First check if it's an email
        User user = findUserByEmail(emailOrId);
        if (user != null) {
            return user;
        }

        // Try to find by student ID
        user = findUserByStudentId(emailOrId);
        if (user != null) {
            return user;
        }

        // Try to find by teacher ID
        user = findUserByTeacherId(emailOrId);
        if (user != null) {
            return user;
        }

        // Try to find by staff ID
        user = findUserByStaffId(emailOrId);
        if (user != null) {
            return user;
        }

        return null;
    }

    /**
     * Check if a string is an email format
     */
    private boolean isEmail(String identifier) {
        return identifier != null && identifier.contains("@");
    }

    /**
     * Save user to the appropriate database repository based on user type
     * @param user The user to save
     */
    private void saveUserToDatabase(User user) {
        if (user instanceof Student) {
            studentRepository.save((Student) user);
        } else if (user instanceof Teacher) {
            teacherRepository.save((Teacher) user);
        } else if (user instanceof Staff) {
            staffRepository.save((Staff) user);
        } else {
            throw new RuntimeException("Unknown user type: " + user.getClass().getName());
        }
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
        
        long totalUsers = studentRepository.count() + teacherRepository.count() + staffRepository.count();
        response.put("totalUsers", totalUsers);
        
        // Combine all users from repositories
        java.util.List<Map<String, Object>> allUsers = new java.util.ArrayList<>();
        
        studentRepository.findAll().forEach(u -> {
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", u.getId());
            userData.put("email", u.getEmail());
            userData.put("fullName", u.getFullName());
            userData.put("role", "STUDENT");
            userData.put("emailVerified", u.getEmailVerified());
            userData.put("isActive", u.getIsActive());
            allUsers.add(userData);
        });
        
        teacherRepository.findAll().forEach(u -> {
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", u.getId());
            userData.put("email", u.getEmail());
            userData.put("fullName", u.getFullName());
            userData.put("role", "TEACHER");
            userData.put("emailVerified", u.getEmailVerified());
            userData.put("isActive", u.getIsActive());
            allUsers.add(userData);
        });
        
        staffRepository.findAll().forEach(u -> {
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", u.getId());
            userData.put("email", u.getEmail());
            userData.put("fullName", u.getFullName());
            userData.put("role", "ADMIN");
            userData.put("emailVerified", u.getEmailVerified());
            userData.put("isActive", u.getIsActive());
            allUsers.add(userData);
        });
        
        response.put("users", allUsers);
        return response;
    }

    /**
     * Debug method to get user details including tokens - FOR TESTING ONLY
     */
    public Map<String, Object> getDebugUserInfo(String email) {
        User user = findUserByEmail(email);
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