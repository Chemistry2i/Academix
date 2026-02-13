package com.academix.server.dto;

import java.util.Map;

/**
 * Response DTOs for Multi-Factor Authentication
 */
public class MFAResponseDTOs {

    /**
     * Base MFA Response
     */
    public static class MFAResponse {
        private String message;
        private boolean success;
        private Object data;

        // Constructors
        public MFAResponse() {}
        public MFAResponse(String message, boolean success) {
            this.message = message;
            this.success = success;
        }
        public MFAResponse(String message, boolean success, Object data) {
            this.message = message;
            this.success = success;
            this.data = data;
        }

        // Getters and setters
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public Object getData() { return data; }
        public void setData(Object data) { this.data = data; }
    }

    /**
     * TOTP Setup Response
     */
    public static class TOTPSetupResponse {
        private String message;
        private boolean success;
        private String secret;
        private String qrCodeUrl;
        private String manualEntryKey;

        public TOTPSetupResponse() {}
        public TOTPSetupResponse(String message, boolean success, String secret, String qrCodeUrl, String manualEntryKey) {
            this.message = message;
            this.success = success;
            this.secret = secret;
            this.qrCodeUrl = qrCodeUrl;
            this.manualEntryKey = manualEntryKey;
        }

        // Getters and setters
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getSecret() { return secret; }
        public void setSecret(String secret) { this.secret = secret; }
        
        public String getQrCodeUrl() { return qrCodeUrl; }
        public void setQrCodeUrl(String qrCodeUrl) { this.qrCodeUrl = qrCodeUrl; }
        
        public String getManualEntryKey() { return manualEntryKey; }
        public void setManualEntryKey(String manualEntryKey) { this.manualEntryKey = manualEntryKey; }
    }

    /**
     * MFA Status Response
     */
    public static class MFAStatusResponse {
        private String message;
        private boolean success;
        private boolean mfaEnabled;
        private String primaryMethod;
        private String fallbackMethod;
        private boolean hasPhoneNumber;
        private boolean hasTOTP;
        private boolean hasBackupCodes;

        public MFAStatusResponse() {}
        public MFAStatusResponse(String message, boolean success, Map<String, Object> statusData) {
            this.message = message;
            this.success = success;
            if (statusData != null) {
                this.mfaEnabled = (Boolean) statusData.getOrDefault("mfaEnabled", false);
                this.primaryMethod = (String) statusData.get("primaryMethod");
                this.fallbackMethod = (String) statusData.get("fallbackMethod");
                this.hasPhoneNumber = (Boolean) statusData.getOrDefault("hasPhoneNumber", false);
                this.hasTOTP = (Boolean) statusData.getOrDefault("hasTOTP", false);
                this.hasBackupCodes = (Boolean) statusData.getOrDefault("hasBackupCodes", false);
            }
        }

        // Getters and setters
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public boolean isMfaEnabled() { return mfaEnabled; }
        public void setMfaEnabled(boolean mfaEnabled) { this.mfaEnabled = mfaEnabled; }
        
        public String getPrimaryMethod() { return primaryMethod; }
        public void setPrimaryMethod(String primaryMethod) { this.primaryMethod = primaryMethod; }
        
        public String getFallbackMethod() { return fallbackMethod; }
        public void setFallbackMethod(String fallbackMethod) { this.fallbackMethod = fallbackMethod; }
        
        public boolean isHasPhoneNumber() { return hasPhoneNumber; }
        public void setHasPhoneNumber(boolean hasPhoneNumber) { this.hasPhoneNumber = hasPhoneNumber; }
        
        public boolean isHasTOTP() { return hasTOTP; }
        public void setHasTOTP(boolean hasTOTP) { this.hasTOTP = hasTOTP; }
        
        public boolean isHasBackupCodes() { return hasBackupCodes; }
        public void setHasBackupCodes(boolean hasBackupCodes) { this.hasBackupCodes = hasBackupCodes; }
    }

    /**
     * Backup Codes Response
     */
    public static class BackupCodesResponse {
        private String message;
        private boolean success;
        private String[] backupCodes;

        public BackupCodesResponse() {}
        public BackupCodesResponse(String message, boolean success, String[] backupCodes) {
            this.message = message;
            this.success = success;
            this.backupCodes = backupCodes;
        }

        // Getters and setters
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String[] getBackupCodes() { return backupCodes; }
        public void setBackupCodes(String[] backupCodes) { this.backupCodes = backupCodes; }
    }

    /**
     * MFA Challenge Response (for login flow)
     */
    public static class MFAChallengeResponse {
        private String message;
        private boolean success;
        private boolean requiresMFA;
        private String tempToken;
        private String primaryMethod;
        private String[] availableMethods;

        public MFAChallengeResponse() {}
        public MFAChallengeResponse(String message, boolean success, boolean requiresMFA) {
            this.message = message;
            this.success = success;
            this.requiresMFA = requiresMFA;
        }

        // Getters and setters
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public boolean isRequiresMFA() { return requiresMFA; }
        public void setRequiresMFA(boolean requiresMFA) { this.requiresMFA = requiresMFA; }
        
        public String getTempToken() { return tempToken; }
        public void setTempToken(String tempToken) { this.tempToken = tempToken; }
        
        public String getPrimaryMethod() { return primaryMethod; }
        public void setPrimaryMethod(String primaryMethod) { this.primaryMethod = primaryMethod; }
        
        public String[] getAvailableMethods() { return availableMethods; }
        public void setAvailableMethods(String[] availableMethods) { this.availableMethods = availableMethods; }
    }
}