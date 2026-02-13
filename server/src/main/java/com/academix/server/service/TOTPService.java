package com.academix.server.service;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * TOTP (Time-based One-Time Password) Service for Multi-Factor Authentication
 * Supports Google Authenticator, Microsoft Authenticator, Authy, etc.
 */
@Service
public class TOTPService {

    private static final Logger logger = LoggerFactory.getLogger(TOTPService.class);
    private final GoogleAuthenticator googleAuthenticator;
    
    @Value("${app.name:Academix}")
    private String appName;
    
    // In production, store in database
    private final Map<String, String> userSecrets = new HashMap<>();

    public TOTPService() {
        this.googleAuthenticator = new GoogleAuthenticator();
    }

    /**
     * Generate a new secret key for a user
     */
    public String generateSecret(String userEmail) {
        try {
            GoogleAuthenticatorKey key = googleAuthenticator.createCredentials();
            String secret = key.getKey();
            
            // Store secret (in production: save to database)
            userSecrets.put(userEmail, secret);
            
            logger.info("TOTP secret generated for user: {}", userEmail);
            return secret;
        } catch (Exception e) {
            logger.error("Failed to generate TOTP secret for user: {}", userEmail, e);
            throw new RuntimeException("Failed to generate TOTP secret");
        }
    }

    /**
     * Generate QR code URL for setting up authenticator app
     */
    public String generateQRCodeUrl(String userEmail, String secret) {
        try {
            // Generate a URL in the format: otpauth://totp/Academix:user@example.com?secret=SECRET&issuer=Academix
            String encodedEmail = java.net.URLEncoder.encode(userEmail, "UTF-8");
            String encodedIssuer = java.net.URLEncoder.encode(appName, "UTF-8");
            
            return String.format(
                "otpauth://totp/%s:%s?secret=%s&issuer=%s",
                encodedIssuer,
                encodedEmail,
                secret,
                encodedIssuer
            );
        } catch (Exception e) {
            logger.error("Failed to generate QR code URL for user: {}", userEmail, e);
            throw new RuntimeException("Failed to generate QR code");
        }
    }

    /**
     * Validate TOTP code
     */
    public boolean validateCode(String userEmail, int code) {
        try {
            String secret = userSecrets.get(userEmail);
            if (secret == null) {
                logger.warn("No TOTP secret found for user: {}", userEmail);
                return false;
            }

            boolean isValid = googleAuthenticator.authorize(secret, code);
            
            if (isValid) {
                logger.info("TOTP validation successful for user: {}", userEmail);
            } else {
                logger.warn("TOTP validation failed for user: {}", userEmail);
            }
            
            return isValid;
        } catch (Exception e) {
            logger.error("TOTP validation error for user: {}", userEmail, e);
            return false;
        }
    }

    /**
     * Check if user has TOTP enabled
     */
    public boolean isTOTPEnabled(String userEmail) {
        return userSecrets.containsKey(userEmail);
    }

    /**
     * Disable TOTP for user
     */
    public void disableTOTP(String userEmail) {
        userSecrets.remove(userEmail);
        logger.info("TOTP disabled for user: {}", userEmail);
    }

    /**
     * Generate backup codes for emergency access
     */
    public String[] generateBackupCodes(String userEmail) {
        String[] backupCodes = new String[8];
        
        for (int i = 0; i < 8; i++) {
            backupCodes[i] = String.format("%04d-%04d", 
                (int)(Math.random() * 10000), 
                (int)(Math.random() * 10000));
        }
        
        // In production: store hashed backup codes in database
        logger.info("Backup codes generated for user: {}", userEmail);
        return backupCodes;
    }
}