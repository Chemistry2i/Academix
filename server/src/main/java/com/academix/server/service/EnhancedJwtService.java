package com.academix.server.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

@Service
public class EnhancedJwtService {

    private static final Logger logger = LoggerFactory.getLogger(EnhancedJwtService.class);

    @Value("${jwt.secret:academix-secret-key-that-is-at-least-256-bits-long-for-security}")
    private String secret;

    @Value("${jwt.expiration:900000}") // 15 minutes in milliseconds
    private Long jwtExpiration;

    @Value("${jwt.refresh.expiration:86400000}") // 24 hours in milliseconds  
    private Long refreshExpiration;

    // Token blacklist - In production, use Redis or database
    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();
    
    // Track token usage for security monitoring
    private final Map<String, TokenUsageInfo> tokenUsageMap = new ConcurrentHashMap<>();

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(String username, String role, Long userId) {
        return generateToken(username, role, userId, jwtExpiration);
    }

    public String generateRefreshToken(String username) {
        return generateToken(username, null, null, refreshExpiration);
    }

    /**
     * Generate temporary token for MFA flow
     */
    public String generateTempToken(String username, int expirationMinutes) {
        long tempExpiration = expirationMinutes * 60 * 1000L; // Convert minutes to milliseconds
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("tokenType", "temp_mfa");
        extraClaims.put("iat", System.currentTimeMillis());
        extraClaims.put("jti", java.util.UUID.randomUUID().toString());
        
        String token = Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + tempExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();

        // Track token creation
        trackTokenUsage(token, "TEMP_TOKEN_CREATED");
        logger.info("Temporary MFA token generated for user: {}", username);
        
        return token;
    }

    /**
     * Validate temporary token for MFA flow
     */
    public boolean isValidTempToken(String token, String username) {
        try {
            if (isTokenBlacklisted(token)) {
                logger.warn("Attempt to use blacklisted temp token for user: {}", username);
                return false;
            }

            if (!isValidTokenType(token, "temp_mfa")) {
                logger.warn("Invalid token type for MFA verification: {}", username);
                return false;
            }

            final String tokenUsername = extractUsername(token);
            boolean isValid = (tokenUsername.equals(username)) && !isTokenExpired(token);
            
            trackTokenUsage(token, isValid ? "TEMP_TOKEN_VALIDATED" : "TEMP_TOKEN_VALIDATION_FAILED");
            
            return isValid;
        } catch (Exception e) {
            logger.error("Temp token validation failed for user: {}", username, e);
            return false;
        }
    }

    private String generateToken(String username, String role, Long userId, long expiration) {
        Map<String, Object> extraClaims = new HashMap<>();
        if (role != null) extraClaims.put("role", role);
        if (userId != null) extraClaims.put("userId", userId);
        
        // Add additional security claims
        extraClaims.put("tokenType", role != null ? "access" : "refresh");
        extraClaims.put("iat", System.currentTimeMillis());
        extraClaims.put("jti", java.util.UUID.randomUUID().toString()); // JWT ID for tracking
        
        String token = Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();

        // Track token creation
        trackTokenUsage(token, "CREATED");
        
        return token;
    }

    public boolean isTokenValid(String token, String username) {
        try {
            // Check if token is blacklisted
            if (isTokenBlacklisted(token)) {
                logger.warn("Attempt to use blacklisted token for user: {}", username);
                return false;
            }

            final String tokenUsername = extractUsername(token);
            boolean isValid = (tokenUsername.equals(username)) && !isTokenExpired(token);
            
            // Track token validation
            trackTokenUsage(token, isValid ? "VALIDATED" : "VALIDATION_FAILED");
            
            return isValid;
        } catch (Exception e) {
            logger.error("Token validation failed for user: {}", username, e);
            trackTokenUsage(token, "VALIDATION_ERROR");
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (Exception e) {
            logger.debug("Token expiration check failed", e);
            return true;
        }
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            logger.debug("Failed to extract claims from token", e);
            throw e;
        }
    }

    private SecretKey getSignInKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public Long getJwtExpiration() {
        return jwtExpiration;
    }

    public Long getRefreshExpiration() {
        return refreshExpiration;
    }

    // Enhanced Security Methods

    /**
     * Blacklist a token (for logout, compromise, etc.)
     */
    public void blacklistToken(String token) {
        try {
            String jti = extractClaim(token, claims -> claims.get("jti", String.class));
            blacklistedTokens.add(jti);
            trackTokenUsage(token, "BLACKLISTED");
            logger.info("Token blacklisted successfully");
        } catch (Exception e) {
            logger.error("Failed to blacklist token", e);
        }
    }

    /**
     * Check if token is blacklisted
     */
    public boolean isTokenBlacklisted(String token) {
        try {
            String jti = extractClaim(token, claims -> claims.get("jti", String.class));
            return blacklistedTokens.contains(jti);
        } catch (Exception e) {
            logger.debug("Failed to check blacklist status", e);
            return true; // Assume blacklisted if can't verify
        }
    }

    /**
     * Validate token type (access vs refresh)
     */
    public boolean isValidTokenType(String token, String expectedType) {
        try {
            String tokenType = extractClaim(token, claims -> claims.get("tokenType", String.class));
            return expectedType.equals(tokenType);
        } catch (Exception e) {
            logger.debug("Failed to validate token type", e);
            return false;
        }
    }

    /**
     * Get token remaining validity in seconds
     */
    public long getTokenRemainingValidity(String token) {
        try {
            Date expiration = extractExpiration(token);
            long remaining = expiration.getTime() - System.currentTimeMillis();
            return Math.max(0, remaining / 1000);
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Check if token needs refresh (less than 5 minutes remaining)
     */
    public boolean needsRefresh(String token) {
        return getTokenRemainingValidity(token) < 300; // 5 minutes
    }

    /**
     * Track token usage for security monitoring
     */
    private void trackTokenUsage(String token, String action) {
        try {
            String jti = extractClaim(token, claims -> claims.get("jti", String.class));
            TokenUsageInfo info = tokenUsageMap.computeIfAbsent(jti, k -> new TokenUsageInfo());
            info.addEvent(action);
            
            // Clean up old entries (keep last 1000 tokens)
            if (tokenUsageMap.size() > 1000) {
                // In production, implement proper cleanup strategy
                logger.debug("Token usage map cleanup needed");
            }
        } catch (Exception e) {
            logger.debug("Failed to track token usage", e);
        }
    }

    /**
     * Get token usage statistics (for monitoring)
     */
    public TokenUsageStats getTokenUsageStats() {
        TokenUsageStats stats = new TokenUsageStats();
        stats.setActiveTokens(tokenUsageMap.size());
        stats.setBlacklistedTokens(blacklistedTokens.size());
        
        // Count events by type
        tokenUsageMap.values().forEach(info -> {
            info.getEvents().forEach((action, count) -> {
                stats.incrementEventCount(action, count);
            });
        });
        
        return stats;
    }

    // Inner classes for monitoring
    public static class TokenUsageInfo {
        private final Map<String, Integer> events = new HashMap<>();
        private long firstUsed = System.currentTimeMillis();
        private long lastUsed = System.currentTimeMillis();

        public void addEvent(String action) {
            events.merge(action, 1, Integer::sum);
            lastUsed = System.currentTimeMillis();
        }

        public Map<String, Integer> getEvents() { return events; }
        public long getFirstUsed() { return firstUsed; }
        public long getLastUsed() { return lastUsed; }
    }

    public static class TokenUsageStats {
        private int activeTokens;
        private int blacklistedTokens;
        private final Map<String, Integer> eventCounts = new HashMap<>();

        public void incrementEventCount(String event, int count) {
            eventCounts.merge(event, count, Integer::sum);
        }

        // Getters and setters
        public int getActiveTokens() { return activeTokens; }
        public void setActiveTokens(int activeTokens) { this.activeTokens = activeTokens; }
        public int getBlacklistedTokens() { return blacklistedTokens; }
        public void setBlacklistedTokens(int blacklistedTokens) { this.blacklistedTokens = blacklistedTokens; }
        public Map<String, Integer> getEventCounts() { return eventCounts; }
    }
}