package com.academix.server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Multi-Factor Authentication Service
 * Coordinates different MFA methods: TOTP, SMS, Email
 */
@Service
public class MFAService {

    private static final Logger logger = LoggerFactory.getLogger(MFAService.class);

    @Autowired
    private TOTPService totpService;

    @Autowired
    private SMSMFAService smsMFAService;

    @Autowired
    private EmailService emailService;

    // In production, store in database
    private final Map<String, UserMFAConfig> userMFAConfigs = new HashMap<>();
    private final Map<String, String> pendingEmailCodes = new HashMap<>();

    public enum MFAMethod {
        TOTP,      // Authenticator apps (Google Authenticator, etc.)
        SMS,       // SMS text messages
        EMAIL,     // Email-based codes
        BACKUP     // Backup recovery codes
    }

    public static class UserMFAConfig {
        private String userEmail;
        private MFAMethod primaryMethod;
        private MFAMethod fallbackMethod;
        private boolean mfaEnabled;
        private String phoneNumber;
        private String totpSecret;
        private String[] backupCodes;

        // Constructors, getters, setters
        public UserMFAConfig() {}

        public UserMFAConfig(String userEmail) {
            this.userEmail = userEmail;
            this.mfaEnabled = false;
        }

        // Getters and setters
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        
        public MFAMethod getPrimaryMethod() { return primaryMethod; }
        public void setPrimaryMethod(MFAMethod primaryMethod) { this.primaryMethod = primaryMethod; }
        
        public MFAMethod getFallbackMethod() { return fallbackMethod; }
        public void setFallbackMethod(MFAMethod fallbackMethod) { this.fallbackMethod = fallbackMethod; }
        
        public boolean isMfaEnabled() { return mfaEnabled; }
        public void setMfaEnabled(boolean mfaEnabled) { this.mfaEnabled = mfaEnabled; }
        
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        
        public String getTotpSecret() { return totpSecret; }
        public void setTotpSecret(String totpSecret) { this.totpSecret = totpSecret; }
        
        public String[] getBackupCodes() { return backupCodes; }
        public void setBackupCodes(String[] backupCodes) { this.backupCodes = backupCodes; }
    }

    /**
     * Check if user has MFA enabled
     */
    public boolean isMFAEnabled(String userEmail) {
        UserMFAConfig config = userMFAConfigs.get(userEmail);
        return config != null && config.isMfaEnabled();
    }

    /**
     * Get user's MFA configuration
     */
    public UserMFAConfig getMFAConfig(String userEmail) {
        return userMFAConfigs.getOrDefault(userEmail, new UserMFAConfig(userEmail));
    }

    /**
     * Setup TOTP for user
     */
    public Map<String, Object> setupTOTP(String userEmail) {
        try {
            UserMFAConfig config = getMFAConfig(userEmail);
            
            // Generate TOTP secret
            String secret = totpService.generateSecret(userEmail);
            String qrCodeUrl = totpService.generateQRCodeUrl(userEmail, secret);
            
            // Update config (but don't enable MFA until verified)
            config.setTotpSecret(secret);
            userMFAConfigs.put(userEmail, config);
            
            logger.info("TOTP setup initiated for user: {}", userEmail);
            
            return Map.of(
                "secret", secret,
                "qrCodeUrl", qrCodeUrl,
                "manualEntryKey", secret.replaceAll("(.{4})", "$1 ").trim()
            );
        } catch (Exception e) {
            logger.error("TOTP setup failed for user: {}", userEmail, e);
            throw new RuntimeException("Failed to setup TOTP");
        }
    }

    /**
     * Verify and enable TOTP
     */
    public boolean verifyAndEnableTOTP(String userEmail, int code) {
        try {
            if (totpService.validateCode(userEmail, code)) {
                UserMFAConfig config = getMFAConfig(userEmail);
                config.setPrimaryMethod(MFAMethod.TOTP);
                config.setMfaEnabled(true);
                
                // Generate backup codes
                config.setBackupCodes(totpService.generateBackupCodes(userEmail));
                
                userMFAConfigs.put(userEmail, config);
                
                logger.info("TOTP enabled for user: {}", userEmail);
                return true;
            }
            return false;
        } catch (Exception e) {
            logger.error("TOTP verification failed for user: {}", userEmail, e);
            return false;
        }
    }

    /**
     * Setup SMS MFA for user
     */
    public boolean setupSMS(String userEmail, String phoneNumber) {
        try {
            UserMFAConfig config = getMFAConfig(userEmail);
            config.setPhoneNumber(phoneNumber);
            userMFAConfigs.put(userEmail, config);
            
            // Send verification code
            boolean sent = smsMFAService.sendSMSCode(phoneNumber, userEmail);
            
            if (sent) {
                logger.info("SMS MFA setup initiated for user: {}", userEmail);
            }
            
            return sent;
        } catch (Exception e) {
            logger.error("SMS MFA setup failed for user: {}", userEmail, e);
            return false;
        }
    }

    /**
     * Verify and enable SMS MFA
     */
    public boolean verifyAndEnableSMS(String userEmail, String code) {
        try {
            UserMFAConfig config = getMFAConfig(userEmail);
            
            if (config.getPhoneNumber() != null && 
                smsMFAService.verifySMSCode(config.getPhoneNumber(), code)) {
                
                config.setPrimaryMethod(MFAMethod.SMS);
                config.setMfaEnabled(true);
                userMFAConfigs.put(userEmail, config);
                
                logger.info("SMS MFA enabled for user: {}", userEmail);
                return true;
            }
            return false;
        } catch (Exception e) {
            logger.error("SMS MFA verification failed for user: {}", userEmail, e);
            return false;
        }
    }

    /**
     * Send MFA challenge based on user's primary method
     */
    public boolean sendMFAChallenge(String userEmail) {
        try {
            UserMFAConfig config = getMFAConfig(userEmail);
            
            if (!config.isMfaEnabled()) {
                return false; // MFA not enabled
            }

            switch (config.getPrimaryMethod()) {
                case TOTP:
                    // No need to send anything for TOTP
                    return true;
                    
                case SMS:
                    return smsMFAService.sendSMSCode(config.getPhoneNumber(), userEmail);
                    
                case EMAIL:
                    return sendEmailCode(userEmail);
                    
                default:
                    logger.warn("Unknown MFA method for user: {}", userEmail);
                    return false;
            }
        } catch (Exception e) {
            logger.error("Failed to send MFA challenge for user: {}", userEmail, e);
            return false;
        }
    }

    /**
     * Verify MFA code
     */
    public boolean verifyMFACode(String userEmail, String code, MFAMethod method) {
        try {
            UserMFAConfig config = getMFAConfig(userEmail);
            
            if (!config.isMfaEnabled()) {
                return false;
            }

            switch (method != null ? method : config.getPrimaryMethod()) {
                case TOTP:
                    return totpService.validateCode(userEmail, Integer.parseInt(code));
                    
                case SMS:
                    return smsMFAService.verifySMSCode(config.getPhoneNumber(), code);
                    
                case EMAIL:
                    return verifyEmailCode(userEmail, code);
                    
                case BACKUP:
                    return verifyBackupCode(userEmail, code);
                    
                default:
                    return false;
            }
        } catch (Exception e) {
            logger.error("MFA verification failed for user: {}", userEmail, e);
            return false;
        }
    }

    /**
     * Send email-based MFA code
     */
    private boolean sendEmailCode(String userEmail) {
        try {
            String code = String.format("%06d", ThreadLocalRandom.current().nextInt(0, 1000000));
            pendingEmailCodes.put(userEmail, code);
            
            String emailBody = String.format(
                "Your Academix verification code is: %s\n\n" +
                "This code will expire in 5 minutes.\n" +
                "If you didn't request this code, please contact support immediately.",
                code
            );
            
            emailService.sendEmail(userEmail, "Academix Security Code", emailBody);
            logger.info("Email MFA code sent to: {}", userEmail);
            return true;
        } catch (Exception e) {
            logger.error("Failed to send email MFA code to: {}", userEmail, e);
            return false;
        }
    }

    /**
     * Verify email-based MFA code
     */
    private boolean verifyEmailCode(String userEmail, String code) {
        String storedCode = pendingEmailCodes.get(userEmail);
        if (storedCode != null && storedCode.equals(code)) {
            pendingEmailCodes.remove(userEmail);
            return true;
        }
        return false;
    }

    /**
     * Verify backup code
     */
    private boolean verifyBackupCode(String userEmail, String code) {
        UserMFAConfig config = getMFAConfig(userEmail);
        
        if (config.getBackupCodes() != null) {
            for (int i = 0; i < config.getBackupCodes().length; i++) {
                if (config.getBackupCodes()[i] != null && 
                    config.getBackupCodes()[i].equals(code)) {
                    // Mark backup code as used
                    config.getBackupCodes()[i] = null;
                    userMFAConfigs.put(userEmail, config);
                    logger.info("Backup code used for user: {}", userEmail);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Disable MFA for user
     */
    public boolean disableMFA(String userEmail, String password) {
        try {
            // TODO: Verify current password before disabling
            UserMFAConfig config = getMFAConfig(userEmail);
            config.setMfaEnabled(false);
            config.setPrimaryMethod(null);
            config.setFallbackMethod(null);
            config.setTotpSecret(null);
            config.setBackupCodes(null);
            config.setPhoneNumber(null);
            
            // Remove from TOTP service
            totpService.disableTOTP(userEmail);
            
            userMFAConfigs.put(userEmail, config);
            
            logger.info("MFA disabled for user: {}", userEmail);
            return true;
        } catch (Exception e) {
            logger.error("Failed to disable MFA for user: {}", userEmail, e);
            return false;
        }
    }

    /**
     * Get MFA status for user
     */
    public Map<String, Object> getMFAStatus(String userEmail) {
        UserMFAConfig config = getMFAConfig(userEmail);
        
        return Map.of(
            "mfaEnabled", config.isMfaEnabled(),
            "primaryMethod", config.getPrimaryMethod() != null ? config.getPrimaryMethod().name() : null,
            "fallbackMethod", config.getFallbackMethod() != null ? config.getFallbackMethod().name() : null,
            "hasPhoneNumber", config.getPhoneNumber() != null,
            "hasTOTP", config.getTotpSecret() != null,
            "hasBackupCodes", config.getBackupCodes() != null
        );
    }
}