package com.academix.server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.HashMap;

/**
 * SMS-based Multi-Factor Authentication Service
 * Supports integration with Twilio, AWS SNS, or other SMS providers
 */
@Service
public class SMSMFAService {

    private static final Logger logger = LoggerFactory.getLogger(SMSMFAService.class);
    
    @Autowired
    private EmailService emailService; // Fallback to email for demo
    
    // In production, store in Redis or database with TTL
    private final Map<String, SMSCode> pendingCodes = new HashMap<>();
    
    private static class SMSCode {
        String code;
        long expiry;
        int attempts;
        
        SMSCode(String code, long expiry) {
            this.code = code;
            this.expiry = expiry;
            this.attempts = 0;
        }
    }

    /**
     * Send SMS verification code
     * For demo: sends via email. In production: integrate with SMS provider
     */
    public boolean sendSMSCode(String phoneNumber, String userEmail) {
        try {
            // Generate 6-digit code
            String code = String.format("%06d", ThreadLocalRandom.current().nextInt(0, 1000000));
            
            // Store with 5-minute expiry
            long expiry = System.currentTimeMillis() + (5 * 60 * 1000);
            pendingCodes.put(phoneNumber, new SMSCode(code, expiry));
            
            // For demo: send via email (replace with actual SMS integration)
            String emailBody = String.format(
                "Your Academix verification code is: %s\n\n" +
                "This code will expire in 5 minutes.\n" +
                "If you didn't request this code, please ignore this message.",
                code
            );
            
            // Send via email for demo
            emailService.sendEmail(userEmail, "SMS Verification Code", emailBody);
            
            logger.info("SMS code sent to: {} (via email for demo)", phoneNumber);
            return true;
            
        } catch (Exception e) {
            logger.error("Failed to send SMS code to: {}", phoneNumber, e);
            return false;
        }
    }

    /**
     * Verify SMS code
     */
    public boolean verifySMSCode(String phoneNumber, String code) {
        try {
            SMSCode storedCode = pendingCodes.get(phoneNumber);
            
            if (storedCode == null) {
                logger.warn("No SMS code found for phone: {}", phoneNumber);
                return false;
            }
            
            // Check expiry
            if (System.currentTimeMillis() > storedCode.expiry) {
                pendingCodes.remove(phoneNumber);
                logger.warn("SMS code expired for phone: {}", phoneNumber);
                return false;
            }
            
            // Check attempts (prevent brute force)
            if (storedCode.attempts >= 3) {
                pendingCodes.remove(phoneNumber);
                logger.warn("Too many SMS verification attempts for phone: {}", phoneNumber);
                return false;
            }
            
            // Verify code
            if (storedCode.code.equals(code)) {
                pendingCodes.remove(phoneNumber);
                logger.info("SMS verification successful for phone: {}", phoneNumber);
                return true;
            } else {
                storedCode.attempts++;
                logger.warn("SMS verification failed for phone: {} (attempt {})", phoneNumber, storedCode.attempts);
                return false;
            }
            
        } catch (Exception e) {
            logger.error("SMS verification error for phone: {}", phoneNumber, e);
            return false;
        }
    }

    /**
     * Clean expired codes (call periodically)
     */
    public void cleanExpiredCodes() {
        long now = System.currentTimeMillis();
        pendingCodes.entrySet().removeIf(entry -> entry.getValue().expiry < now);
    }

    // TODO: Integrate with actual SMS providers
    
    /**
     * EXAMPLE: Twilio Integration
     */
    /*
    @Value("${twilio.account.sid}")
    private String twilioAccountSid;
    
    @Value("${twilio.auth.token}")
    private String twilioAuthToken;
    
    @Value("${twilio.phone.number}")
    private String twilioPhoneNumber;
    
    private boolean sendViaTwilio(String phoneNumber, String code) {
        try {
            Twilio.init(twilioAccountSid, twilioAuthToken);
            
            Message message = Message.creator(
                new PhoneNumber(phoneNumber),
                new PhoneNumber(twilioPhoneNumber),
                "Your Academix verification code is: " + code
            ).create();
            
            logger.info("SMS sent via Twilio, SID: {}", message.getSid());
            return true;
        } catch (Exception e) {
            logger.error("Failed to send SMS via Twilio", e);
            return false;
        }
    }
    */

    /**
     * EXAMPLE: AWS SNS Integration
     */
    /*
    @Autowired
    private AmazonSNS snsClient;
    
    private boolean sendViaSNS(String phoneNumber, String code) {
        try {
            PublishRequest request = new PublishRequest()
                .withPhoneNumber(phoneNumber)
                .withMessage("Your Academix verification code is: " + code);
            
            PublishResult result = snsClient.publish(request);
            logger.info("SMS sent via AWS SNS, MessageId: {}", result.getMessageId());
            return true;
        } catch (Exception e) {
            logger.error("Failed to send SMS via AWS SNS", e);
            return false;
        }
    }
    */
}