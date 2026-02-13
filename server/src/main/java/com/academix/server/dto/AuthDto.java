package com.academix.server.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDto {

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "First name is required")
        @Size(min = 1, max = 50, message = "First name must be between 1 and 50 characters")
        private String firstName;

        @Size(max = 50, message = "Other names must not exceed 50 characters")
        private String otherNames;

        @NotBlank(message = "Last name is required")
        @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters")
        private String lastName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        // Password will be auto-generated - no validation needed
        private String password;

        @NotBlank(message = "Role is required")
        private String role;

        // Additional fields can be added as needed
        private String phoneNumber;
        private String district;
        private String gender;
        private String dateOfBirth;
    }

    @Data
    public static class ForgotPasswordRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
    }

    @Data
    public static class ResetPasswordRequest {
        @NotBlank(message = "Reset token is required")
        private String token;

        @NotBlank(message = "New password is required")
        @Size(min = 8, message = "Password must be at least 8 characters long")
        private String newPassword;
    }

    @Data
    public static class ChangePasswordRequest {
        @NotBlank(message = "Current password is required")
        private String currentPassword;

        @NotBlank(message = "New password is required")
        @Size(min = 8, message = "Password must be at least 8 characters long")
        private String newPassword;
    }

    @Data
    public static class VerifyEmailRequest {
        @NotBlank(message = "Verification token is required")
        private String token;
    }

    @Data
    public static class ResendTokenRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Token type is required")
        private String tokenType; // "verification" or "reset"
    }

    @Data
    public static class RefreshTokenRequest {
        @NotBlank(message = "Refresh token is required")
        private String refreshToken;
    }

    @Data
    public static class AuthResponse {
        private String message;
        private String accessToken;
        private String refreshToken;
        private Long expiresIn;
        private UserInfo user;
        private Boolean requiresMFA;
        private String tempToken;

        public AuthResponse(String message) {
            this.message = message;
        }

        public AuthResponse(String message, String accessToken, String refreshToken, Long expiresIn, UserInfo user) {
            this.message = message;
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.expiresIn = expiresIn;
            this.user = user;
            this.requiresMFA = false;
        }

        // MFA constructor
        public AuthResponse(String message, String accessToken, String refreshToken, Long expiresIn, UserInfo user, Boolean requiresMFA, String tempToken) {
            this.message = message;
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.expiresIn = expiresIn;
            this.user = user;
            this.requiresMFA = requiresMFA;
            this.tempToken = tempToken;
        }

        // Getters and setters
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getAccessToken() { return accessToken; }
        public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

        public Long getExpiresIn() { return expiresIn; }
        public void setExpiresIn(Long expiresIn) { this.expiresIn = expiresIn; }

        public UserInfo getUser() { return user; }
        public void setUser(UserInfo user) { this.user = user; }

        public Boolean getRequiresMFA() { return requiresMFA; }
        public void setRequiresMFA(Boolean requiresMFA) { this.requiresMFA = requiresMFA; }

        public String getTempToken() { return tempToken; }
        public void setTempToken(String tempToken) { this.tempToken = tempToken; }
    }

    @Data
    public static class UserInfo {
        private Long id;
        private String email;
        private String fullName;
        private String role;
        private Boolean emailVerified;
        private Boolean isActive;
        
        // Student-specific fields (null for non-student users)
        private String studentId;
        private String currentClass;
        private String stream;

        public UserInfo(Long id, String email, String fullName, String role, Boolean emailVerified, Boolean isActive) {
            this.id = id;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
            this.emailVerified = emailVerified;
            this.isActive = isActive;
        }
    }

    @Data
    public static class ApiResponse {
        private String message;
        private boolean success;
        private Object data;

        public ApiResponse(String message, boolean success) {
            this.message = message;
            this.success = success;
        }

        public ApiResponse(String message, boolean success, Object data) {
            this.message = message;
            this.success = success;
            this.data = data;
        }
    }
}