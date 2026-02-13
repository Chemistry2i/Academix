package com.academix.server.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTOs for Multi-Factor Authentication
 */
public class MFARequestDTOs {

    /**
     * Setup TOTP request
     */
    public static class SetupTOTPRequest {
        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        private String email;

        // Constructors
        public SetupTOTPRequest() {}
        public SetupTOTPRequest(String email) { this.email = email; }

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    /**
     * Verify TOTP request
     */
    public static class VerifyTOTPRequest {
        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "TOTP code is required")
        @Size(min = 6, max = 6, message = "TOTP code must be 6 digits")
        private String code;

        // Constructors
        public VerifyTOTPRequest() {}
        public VerifyTOTPRequest(String email, String code) {
            this.email = email;
            this.code = code;
        }

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
    }

    /**
     * Setup SMS MFA request
     */
    public static class SetupSMSRequest {
        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Phone number is required")
        @Size(min = 10, max = 15, message = "Phone number must be between 10-15 digits")
        private String phoneNumber;

        // Constructors
        public SetupSMSRequest() {}
        public SetupSMSRequest(String email, String phoneNumber) {
            this.email = email;
            this.phoneNumber = phoneNumber;
        }

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    }

    /**
     * Verify SMS/Email MFA code request
     */
    public static class VerifyMFARequest {
        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Verification code is required")
        @Size(min = 4, max = 8, message = "Code must be between 4-8 characters")
        private String code;

        private String method; // "SMS", "EMAIL", "TOTP", "BACKUP"

        // Constructors
        public VerifyMFARequest() {}
        public VerifyMFARequest(String email, String code) {
            this.email = email;
            this.code = code;
        }
        public VerifyMFARequest(String email, String code, String method) {
            this.email = email;
            this.code = code;
            this.method = method;
        }

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        
        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
    }

    /**
     * MFA Challenge request (for login flow)
     */
    public static class MFAChallengeRequest {
        @NotBlank(message = "Temporary token is required")
        private String tempToken;

        @NotBlank(message = "Verification code is required")
        private String code;

        private String method; // Optional method override

        // Constructors
        public MFAChallengeRequest() {}
        public MFAChallengeRequest(String tempToken, String code) {
            this.tempToken = tempToken;
            this.code = code;
        }

        // Getters and setters
        public String getTempToken() { return tempToken; }
        public void setTempToken(String tempToken) { this.tempToken = tempToken; }
        
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        
        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
    }

    /**
     * Disable MFA request
     */
    public static class DisableMFARequest {
        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Current password is required")
        private String password;

        @NotBlank(message = "Verification code is required")
        private String verificationCode;

        // Constructors
        public DisableMFARequest() {}
        public DisableMFARequest(String email, String password, String verificationCode) {
            this.email = email;
            this.password = password;
            this.verificationCode = verificationCode;
        }

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        
        public String getVerificationCode() { return verificationCode; }
        public void setVerificationCode(String verificationCode) { this.verificationCode = verificationCode; }
    }

    /**
     * Request backup codes
     */
    public static class BackupCodesRequest {
        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Current password is required")
        private String password;

        // Constructors
        public BackupCodesRequest() {}
        public BackupCodesRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}