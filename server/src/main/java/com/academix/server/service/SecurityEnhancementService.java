package com.academix.server.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SecurityEnhancementService {

    private static final Logger logger = LoggerFactory.getLogger(SecurityEnhancementService.class);

    // Rate limiting tracking
    private final Map<String, RateLimitInfo> rateLimitMap = new ConcurrentHashMap<>();
    
    // Account lockout tracking
    private final Map<String, AccountLockoutInfo> lockoutMap = new ConcurrentHashMap<>();
    
    // Security event tracking
    private final Map<String, SecurityEvent> securityEvents = new ConcurrentHashMap<>();

    // Configuration constants
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCKOUT_DURATION_MINUTES = 30;
    private static final int RATE_LIMIT_REQUESTS_PER_MINUTE = 10;
    private static final int RATE_LIMIT_WINDOW_MINUTES = 1;

    /**
     * Password strength validation
     */
    public PasswordValidationResult validatePasswordStrength(String password) {
        PasswordValidationResult result = new PasswordValidationResult();
        
        if (password == null || password.length() < 8) {
            result.addError("Password must be at least 8 characters long");
        }
        
        if (!Pattern.compile("[A-Z]").matcher(password).find()) {
            result.addError("Password must contain at least one uppercase letter");
        }
        
        if (!Pattern.compile("[a-z]").matcher(password).find()) {
            result.addError("Password must contain at least one lowercase letter");
        }
        
        if (!Pattern.compile("[0-9]").matcher(password).find()) {
            result.addError("Password must contain at least one number");
        }
        
        if (!Pattern.compile("[!@#$%^&*(),.?\":{}|<>]").matcher(password).find()) {
            result.addError("Password must contain at least one special character");
        }
        
        // Check for common weak passwords
        if (isCommonPassword(password)) {
            result.addError("Password is too common. Please choose a stronger password");
        }
        
        return result;
    }

    private boolean isCommonPassword(String password) {
        String[] commonPasswords = {
            "password", "password123", "123456", "123456789", "qwerty",
            "abc123", "password1", "admin", "letmein", "welcome"
        };
        
        String lowerPassword = password.toLowerCase();
        for (String common : commonPasswords) {
            if (lowerPassword.contains(common)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Rate limiting check
     */
    public boolean isRateLimited(String identifier, String action) {
        String key = identifier + ":" + action;
        RateLimitInfo info = rateLimitMap.computeIfAbsent(key, k -> new RateLimitInfo());
        
        LocalDateTime now = LocalDateTime.now();
        
        // Clean old requests
        info.removeOldRequests(now.minus(RATE_LIMIT_WINDOW_MINUTES, ChronoUnit.MINUTES));
        
        // Check if rate limited
        if (info.getRequestCount() >= RATE_LIMIT_REQUESTS_PER_MINUTE) {
            logger.warn("Rate limit exceeded for identifier: {} and action: {}", identifier, action);
            recordSecurityEvent(identifier, "RATE_LIMIT_EXCEEDED", action);
            return true;
        }
        
        // Add current request
        info.addRequest(now);
        return false;
    }

    /**
     * Account lockout management
     */
    public boolean isAccountLocked(String email) {
        AccountLockoutInfo lockout = lockoutMap.get(email);
        if (lockout == null || !lockout.isLocked()) {
            return false;
        }
        
        // Check if lockout period has expired
        if (lockout.isLockoutExpired()) {
            lockoutMap.remove(email);
            logger.info("Account lockout expired for email: {}", email);
            return false;
        }
        
        return true;
    }

    public void recordFailedLoginAttempt(String email) {
        AccountLockoutInfo lockout = lockoutMap.computeIfAbsent(email, k -> new AccountLockoutInfo());
        lockout.incrementFailedAttempts();
        
        if (lockout.getFailedAttempts() >= MAX_LOGIN_ATTEMPTS) {
            lockout.lockAccount(LOCKOUT_DURATION_MINUTES);
            logger.warn("Account locked due to {} failed login attempts for email: {}", 
                       MAX_LOGIN_ATTEMPTS, email);
            recordSecurityEvent(email, "ACCOUNT_LOCKED", "Failed login attempts: " + lockout.getFailedAttempts());
        } else {
            logger.warn("Failed login attempt {} of {} for email: {}", 
                       lockout.getFailedAttempts(), MAX_LOGIN_ATTEMPTS, email);
            recordSecurityEvent(email, "FAILED_LOGIN", "Attempt: " + lockout.getFailedAttempts());
        }
    }

    public void recordSuccessfulLogin(String email) {
        // Clear failed attempts on successful login
        lockoutMap.remove(email);
        recordSecurityEvent(email, "SUCCESSFUL_LOGIN", null);
    }

    /**
     * Security event recording
     */
    public void recordSecurityEvent(String identifier, String eventType, String details) {
        String key = identifier + ":" + System.currentTimeMillis();
        SecurityEvent event = new SecurityEvent(identifier, eventType, details, LocalDateTime.now());
        securityEvents.put(key, event);
        
        logger.info("Security event recorded - Type: {}, Identifier: {}, Details: {}", 
                   eventType, identifier, details);
        
        // Clean old events (keep last 1000)
        if (securityEvents.size() > 1000) {
            // In production, implement proper cleanup strategy
            cleanupOldSecurityEvents();
        }
    }

    private void cleanupOldSecurityEvents() {
        LocalDateTime cutoff = LocalDateTime.now().minus(24, ChronoUnit.HOURS);
        securityEvents.entrySet().removeIf(entry -> 
            entry.getValue().getTimestamp().isBefore(cutoff));
    }

    /**
     * Get security statistics
     */
    public SecurityStats getSecurityStats() {
        SecurityStats stats = new SecurityStats();
        
        // Count locked accounts
        long lockedAccounts = lockoutMap.values().stream()
            .mapToLong(info -> info.isLocked() ? 1 : 0)
            .sum();
        stats.setLockedAccounts((int) lockedAccounts);
        
        // Count recent security events
        LocalDateTime last24Hours = LocalDateTime.now().minus(24, ChronoUnit.HOURS);
        Map<String, Integer> eventCounts = new ConcurrentHashMap<>();
        
        securityEvents.values().stream()
            .filter(event -> event.getTimestamp().isAfter(last24Hours))
            .forEach(event -> eventCounts.merge(event.getEventType(), 1, Integer::sum));
        
        stats.setRecentEventCounts(eventCounts);
        stats.setTotalActiveRateLimits(rateLimitMap.size());
        
        return stats;
    }

    // Helper classes
    public static class PasswordValidationResult {
        private boolean valid = true;
        private final java.util.List<String> errors = new java.util.ArrayList<>();

        public void addError(String error) {
            this.valid = false;
            this.errors.add(error);
        }

        public boolean isValid() { return valid; }
        public java.util.List<String> getErrors() { return errors; }
    }

    public static class RateLimitInfo {
        private final java.util.List<LocalDateTime> requests = new java.util.ArrayList<>();

        public void addRequest(LocalDateTime timestamp) {
            requests.add(timestamp);
        }

        public void removeOldRequests(LocalDateTime cutoff) {
            requests.removeIf(timestamp -> timestamp.isBefore(cutoff));
        }

        public int getRequestCount() {
            return requests.size();
        }
    }

    public static class AccountLockoutInfo {
        private int failedAttempts = 0;
        private LocalDateTime lockedUntil;

        public void incrementFailedAttempts() {
            this.failedAttempts++;
        }

        public void lockAccount(int durationMinutes) {
            this.lockedUntil = LocalDateTime.now().plus(durationMinutes, ChronoUnit.MINUTES);
        }

        public boolean isLocked() {
            return lockedUntil != null && LocalDateTime.now().isBefore(lockedUntil);
        }

        public boolean isLockoutExpired() {
            return lockedUntil != null && LocalDateTime.now().isAfter(lockedUntil);
        }

        public int getFailedAttempts() { return failedAttempts; }
        public LocalDateTime getLockedUntil() { return lockedUntil; }
    }

    public static class SecurityEvent {
        private final String identifier;
        private final String eventType;
        private final String details;
        private final LocalDateTime timestamp;

        public SecurityEvent(String identifier, String eventType, String details, LocalDateTime timestamp) {
            this.identifier = identifier;
            this.eventType = eventType;
            this.details = details;
            this.timestamp = timestamp;
        }

        public String getIdentifier() { return identifier; }
        public String getEventType() { return eventType; }
        public String getDetails() { return details; }
        public LocalDateTime getTimestamp() { return timestamp; }
    }

    public static class SecurityStats {
        private int lockedAccounts;
        private int totalActiveRateLimits;
        private Map<String, Integer> recentEventCounts;

        public int getLockedAccounts() { return lockedAccounts; }
        public void setLockedAccounts(int lockedAccounts) { this.lockedAccounts = lockedAccounts; }
        public int getTotalActiveRateLimits() { return totalActiveRateLimits; }
        public void setTotalActiveRateLimits(int totalActiveRateLimits) { this.totalActiveRateLimits = totalActiveRateLimits; }
        public Map<String, Integer> getRecentEventCounts() { return recentEventCounts; }
        public void setRecentEventCounts(Map<String, Integer> recentEventCounts) { this.recentEventCounts = recentEventCounts; }
    }
}