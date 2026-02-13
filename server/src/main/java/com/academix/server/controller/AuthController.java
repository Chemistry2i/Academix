package com.academix.server.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.academix.server.dto.AuthDto.ApiResponse;
import com.academix.server.dto.AuthDto.AuthResponse;
import com.academix.server.dto.AuthDto.ChangePasswordRequest;
import com.academix.server.dto.AuthDto.ForgotPasswordRequest;
import com.academix.server.dto.AuthDto.LoginRequest;
import com.academix.server.dto.AuthDto.RefreshTokenRequest;
import com.academix.server.dto.AuthDto.RegisterRequest;
import com.academix.server.dto.AuthDto.ResendTokenRequest;
import com.academix.server.dto.AuthDto.ResetPasswordRequest;
import com.academix.server.dto.AuthDto.VerifyEmailRequest;
import com.academix.server.dto.MFARequestDTOs.MFAChallengeRequest;
import com.academix.server.service.AuthService;
import com.academix.server.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private AuthService authService;
    
    @Autowired 
    private UserService userService;
    
    /**
     * User Registration
     * Creates a new user account and sends email verification
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.registerUser(request);
            logger.info("Registration successful for email: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Registration failed for email: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(new AuthResponse(e.getMessage()));
        }
    }
    
    /**
     * User Login - Universal login for all user types (students, staff, admin)
     * Automatically detects user type and provides appropriate response
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.unifiedLogin(request);
            logger.info("Universal login successful for email: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Universal login failed for email: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(new AuthResponse(e.getMessage()));
        }
    }

    /**
     * Unified Login - Works for all user types (students, staff, admin)
     * Use this endpoint for all login attempts instead of separate endpoints
     */
    @PostMapping("/unified-login")
    public ResponseEntity<AuthResponse> unifiedLogin(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.unifiedLogin(request);
            logger.info("Unified login successful for email: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Unified login failed for email: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(new AuthResponse(e.getMessage()));
        }
    }

    /**
     * Forgot Password
     * Sends password reset email to user
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            AuthResponse response = authService.forgotPassword(request);
            logger.info("Forgot password request processed for email: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Forgot password failed for email: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(new AuthResponse(e.getMessage()));
        }
    }

    /**
     * Reset Password
     * Resets user password using reset token
     */
    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            AuthResponse response = authService.resetPassword(request);
            logger.info("Password reset successful");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Password reset failed", e);
            return ResponseEntity.badRequest().body(new AuthResponse(e.getMessage()));
        }
    }

    /**
     * Verify Email
     * Verifies user email using verification token
     */
    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        try {
            AuthResponse response = authService.verifyEmail(request);
            logger.info("Email verification successful");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Email verification failed", e);
            return ResponseEntity.badRequest().body(new AuthResponse(e.getMessage()));
        }
    }

    /**
     * Resend Token
     * Resends verification or reset token
     */
    @PostMapping("/resend-token")
    public ResponseEntity<AuthResponse> resendToken(@Valid @RequestBody ResendTokenRequest request) {
        try {
            AuthResponse response = authService.resendToken(request);
            logger.info("Token resend processed for email: {} and type: {}", request.getEmail(), request.getTokenType());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Token resend failed for email: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(new AuthResponse(e.getMessage()));
        }
    }

    /**
     * Change Password
     * Changes password for authenticated user
     * TODO: Add JWT authentication requirement
     */
    @PutMapping("/change-password")
    public ResponseEntity<AuthResponse> changePassword(
            @RequestParam String userEmail, 
            @Valid @RequestBody ChangePasswordRequest request) {
        try {
            AuthResponse response = authService.changePassword(userEmail, request);
            logger.info("Password change successful for user: {}", userEmail);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Password change failed for user: {}", userEmail, e);
            return ResponseEntity.badRequest().body(new AuthResponse(e.getMessage()));
        }
    }

    /**
     * Refresh Token
     * Refreshes access token using refresh token
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            AuthResponse response = authService.refreshToken(request);
            logger.info("Token refresh successful");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Token refresh failed", e);
            return ResponseEntity.badRequest().body(new AuthResponse(e.getMessage()));
        }
    }

    /**
     * Get Current User Info
     * Returns current user information
     * TODO: Implement with JWT authentication
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getCurrentUser(@RequestParam String userEmail) {
        try {
            // This is a placeholder - implement with JWT token extraction
            ApiResponse response = new ApiResponse("Feature not implemented yet", false);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Get current user failed", e);
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage(), false));
        }
    }
    
    /**
     * Get all registered users - FOR TESTING ONLY
     * Remove this endpoint in production
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse> getAllUsers() {
        try {
            var users = authService.getAllUsers();
            return ResponseEntity.ok(new ApiResponse("Users retrieved successfully", true, users));
        } catch (Exception e) {
            logger.error("Get all users failed", e);
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage(), false));
        }
    }

    /**
     * Debug endpoint to get user details including verification tokens - FOR TESTING ONLY
     */
    @GetMapping("/debug/user/{email}")
    public ResponseEntity<ApiResponse> getDebugUserInfo(@PathVariable String email) {
        try {
            var userDetails = authService.getDebugUserInfo(email);
            return ResponseEntity.ok(new ApiResponse("User debug info retrieved", true, userDetails));
        } catch (Exception e) {
            logger.error("Debug user info failed", e);
            return ResponseEntity.badRequest().body(new ApiResponse("User not found", false));
        }
    }

    /**
     * Complete MFA Login
     * Verifies MFA code and completes authentication
     */
    @PostMapping("/mfa/verify")
    public ResponseEntity<AuthResponse> completeMFALogin(@Valid @RequestBody MFAChallengeRequest request) {
        try {
            AuthResponse response = authService.completeMFALogin(
                request.getTempToken(), 
                request.getCode(),
                request.getMethod()
            );
            logger.info("MFA login completed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("MFA login completion failed", e);
            return ResponseEntity.badRequest().body(new AuthResponse(e.getMessage()));
        }
    }

    /**
     * Logout
     * TODO: Implement token blacklisting for true logout
     */
    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout() {
        try {
            // For now, just return success - implement token blacklisting in production
            logger.info("User logout processed");
            return ResponseEntity.ok(new AuthResponse("Logout successful"));
        } catch (Exception e) {
            logger.error("Logout failed", e);
            return ResponseEntity.badRequest().body(new AuthResponse("Logout failed"));
        }
    }

    /**
     * Health Check Endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse> healthCheck() {
        return ResponseEntity.ok(new ApiResponse("Auth service is running", true));
    }
}