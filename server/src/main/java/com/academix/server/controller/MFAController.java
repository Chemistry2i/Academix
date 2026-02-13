package com.academix.server.controller;

import com.academix.server.service.MFAService;
import com.academix.server.dto.MFARequestDTOs;
import com.academix.server.dto.MFAResponseDTOs;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Multi-Factor Authentication Controller
 * Handles all MFA-related endpoints
 */
@RestController
@RequestMapping("/api/mfa")
@CrossOrigin(origins = "*")
public class MFAController {

    private static final Logger logger = LoggerFactory.getLogger(MFAController.class);

    @Autowired
    private MFAService mfaService;

    /**
     * Get MFA status for user
     */
    @GetMapping("/status")
    public ResponseEntity<MFAResponseDTOs.MFAStatusResponse> getMFAStatus(@RequestParam String email) {
        try {
            Map<String, Object> status = mfaService.getMFAStatus(email);
            MFAResponseDTOs.MFAStatusResponse response = new MFAResponseDTOs.MFAStatusResponse(
                "MFA status retrieved successfully", true, status
            );
            
            logger.info("MFA status retrieved for user: {}", email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to retrieve MFA status for user: {}", email, e);
            MFAResponseDTOs.MFAStatusResponse response = new MFAResponseDTOs.MFAStatusResponse();
            response.setMessage("Failed to retrieve MFA status");
            response.setSuccess(false);
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Setup TOTP (Time-based One-Time Password)
     * Returns QR code and secret for authenticator app setup
     */
    @PostMapping("/setup/totp")
    public ResponseEntity<MFAResponseDTOs.TOTPSetupResponse> setupTOTP(
            @Valid @RequestBody MFARequestDTOs.SetupTOTPRequest request) {
        try {
            Map<String, Object> totpData = mfaService.setupTOTP(request.getEmail());
            
            MFAResponseDTOs.TOTPSetupResponse response = new MFAResponseDTOs.TOTPSetupResponse(
                "TOTP setup initiated. Scan QR code with your authenticator app",
                true,
                (String) totpData.get("secret"),
                (String) totpData.get("qrCodeUrl"),
                (String) totpData.get("manualEntryKey")
            );
            
            logger.info("TOTP setup initiated for user: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("TOTP setup failed for user: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(
                new MFAResponseDTOs.TOTPSetupResponse("Failed to setup TOTP: " + e.getMessage(), false, null, null, null)
            );
        }
    }

    /**
     * Verify TOTP setup and enable MFA
     */
    @PostMapping("/verify/totp")
    public ResponseEntity<MFAResponseDTOs.MFAResponse> verifyTOTP(
            @Valid @RequestBody MFARequestDTOs.VerifyTOTPRequest request) {
        try {
            int code = Integer.parseInt(request.getCode());
            boolean success = mfaService.verifyAndEnableTOTP(request.getEmail(), code);
            
            if (success) {
                logger.info("TOTP verification successful and MFA enabled for user: {}", request.getEmail());
                return ResponseEntity.ok(new MFAResponseDTOs.MFAResponse(
                    "TOTP verification successful. Multi-factor authentication is now enabled.", true
                ));
            } else {
                logger.warn("TOTP verification failed for user: {}", request.getEmail());
                return ResponseEntity.badRequest().body(new MFAResponseDTOs.MFAResponse(
                    "Invalid TOTP code. Please try again.", false
                ));
            }
        } catch (NumberFormatException e) {
            logger.error("Invalid TOTP code format for user: {}", request.getEmail());
            return ResponseEntity.badRequest().body(new MFAResponseDTOs.MFAResponse(
                "TOTP code must be a 6-digit number", false
            ));
        } catch (Exception e) {
            logger.error("TOTP verification error for user: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(new MFAResponseDTOs.MFAResponse(
                "TOTP verification failed: " + e.getMessage(), false
            ));
        }
    }

    /**
     * Setup SMS-based MFA
     */
    @PostMapping("/setup/sms")
    public ResponseEntity<MFAResponseDTOs.MFAResponse> setupSMS(
            @Valid @RequestBody MFARequestDTOs.SetupSMSRequest request) {
        try {
            boolean success = mfaService.setupSMS(request.getEmail(), request.getPhoneNumber());
            
            if (success) {
                logger.info("SMS MFA setup initiated for user: {}", request.getEmail());
                return ResponseEntity.ok(new MFAResponseDTOs.MFAResponse(
                    "SMS verification code sent. Please verify the code to enable SMS MFA.", true
                ));
            } else {
                logger.error("Failed to send SMS verification for user: {}", request.getEmail());
                return ResponseEntity.badRequest().body(new MFAResponseDTOs.MFAResponse(
                    "Failed to send SMS verification code", false
                ));
            }
        } catch (Exception e) {
            logger.error("SMS MFA setup failed for user: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(new MFAResponseDTOs.MFAResponse(
                "SMS MFA setup failed: " + e.getMessage(), false
            ));
        }
    }

    /**
     * Verify SMS setup and enable SMS MFA
     */
    @PostMapping("/verify/sms")
    public ResponseEntity<MFAResponseDTOs.MFAResponse> verifySMS(
            @Valid @RequestBody MFARequestDTOs.VerifyMFARequest request) {
        try {
            boolean success = mfaService.verifyAndEnableSMS(request.getEmail(), request.getCode());
            
            if (success) {
                logger.info("SMS MFA verification successful and enabled for user: {}", request.getEmail());
                return ResponseEntity.ok(new MFAResponseDTOs.MFAResponse(
                    "SMS verification successful. SMS-based MFA is now enabled.", true
                ));
            } else {
                logger.warn("SMS MFA verification failed for user: {}", request.getEmail());
                return ResponseEntity.badRequest().body(new MFAResponseDTOs.MFAResponse(
                    "Invalid SMS verification code. Please try again.", false
                ));
            }
        } catch (Exception e) {
            logger.error("SMS MFA verification error for user: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(new MFAResponseDTOs.MFAResponse(
                "SMS MFA verification failed: " + e.getMessage(), false
            ));
        }
    }

    /**
     * Send MFA challenge (used during login)
     */
    @PostMapping("/challenge")
    public ResponseEntity<MFAResponseDTOs.MFAResponse> sendMFAChallenge(@RequestParam String email) {
        try {
            boolean success = mfaService.sendMFAChallenge(email);
            
            if (success) {
                logger.info("MFA challenge sent for user: {}", email);
                return ResponseEntity.ok(new MFAResponseDTOs.MFAResponse(
                    "MFA challenge sent successfully", true
                ));
            } else {
                logger.error("Failed to send MFA challenge for user: {}", email);
                return ResponseEntity.badRequest().body(new MFAResponseDTOs.MFAResponse(
                    "Failed to send MFA challenge", false
                ));
            }
        } catch (Exception e) {
            logger.error("MFA challenge error for user: {}", email, e);
            return ResponseEntity.badRequest().body(new MFAResponseDTOs.MFAResponse(
                "MFA challenge failed: " + e.getMessage(), false
            ));
        }
    }

    /**
     * Verify MFA code (general verification endpoint)
     */
    @PostMapping("/verify")
    public ResponseEntity<MFAResponseDTOs.MFAResponse> verifyMFACode(
            @Valid @RequestBody MFARequestDTOs.VerifyMFARequest request) {
        try {
            MFAService.MFAMethod method = null;
            if (request.getMethod() != null) {
                method = MFAService.MFAMethod.valueOf(request.getMethod().toUpperCase());
            }
            
            boolean success = mfaService.verifyMFACode(request.getEmail(), request.getCode(), method);
            
            if (success) {
                logger.info("MFA verification successful for user: {}", request.getEmail());
                return ResponseEntity.ok(new MFAResponseDTOs.MFAResponse(
                    "MFA verification successful", true
                ));
            } else {
                logger.warn("MFA verification failed for user: {}", request.getEmail());
                return ResponseEntity.badRequest().body(new MFAResponseDTOs.MFAResponse(
                    "Invalid verification code. Please try again.", false
                ));
            }
        } catch (IllegalArgumentException e) {
            logger.error("Invalid MFA method for user: {}", request.getEmail());
            return ResponseEntity.badRequest().body(new MFAResponseDTOs.MFAResponse(
                "Invalid MFA method specified", false
            ));
        } catch (Exception e) {
            logger.error("MFA verification error for user: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(new MFAResponseDTOs.MFAResponse(
                "MFA verification failed: " + e.getMessage(), false
            ));
        }
    }

    /**
     * Get backup codes for emergency access
     */
    @PostMapping("/backup-codes")
    public ResponseEntity<MFAResponseDTOs.BackupCodesResponse> getBackupCodes(
            @Valid @RequestBody MFARequestDTOs.BackupCodesRequest request) {
        try {
            // TODO: Verify password before providing backup codes
            
            // For now, generate new backup codes
            // In production, you might want to regenerate only on request
            Map<String, Object> status = mfaService.getMFAStatus(request.getEmail());
            
            if (!(Boolean) status.get("mfaEnabled")) {
                return ResponseEntity.badRequest().body(new MFAResponseDTOs.BackupCodesResponse(
                    "MFA is not enabled for this account", false, null
                ));
            }

            // TODO: Generate/retrieve backup codes
            String[] backupCodes = {
                "1234-5678", "2345-6789", "3456-7890", "4567-8901",
                "5678-9012", "6789-0123", "7890-1234", "8901-2345"
            };
            
            logger.info("Backup codes provided for user: {}", request.getEmail());
            return ResponseEntity.ok(new MFAResponseDTOs.BackupCodesResponse(
                "Backup codes generated successfully. Store these codes safely!", true, backupCodes
            ));
        } catch (Exception e) {
            logger.error("Failed to provide backup codes for user: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(new MFAResponseDTOs.BackupCodesResponse(
                "Failed to generate backup codes: " + e.getMessage(), false, null
            ));
        }
    }

    /**
     * Disable MFA for user
     */
    @PostMapping("/disable")
    public ResponseEntity<MFAResponseDTOs.MFAResponse> disableMFA(
            @Valid @RequestBody MFARequestDTOs.DisableMFARequest request) {
        try {
            // TODO: Verify current password before disabling
            // TODO: Verify MFA code before disabling
            
            boolean success = mfaService.disableMFA(request.getEmail(), request.getPassword());
            
            if (success) {
                logger.info("MFA disabled for user: {}", request.getEmail());
                return ResponseEntity.ok(new MFAResponseDTOs.MFAResponse(
                    "Multi-factor authentication has been disabled", true
                ));
            } else {
                logger.error("Failed to disable MFA for user: {}", request.getEmail());
                return ResponseEntity.badRequest().body(new MFAResponseDTOs.MFAResponse(
                    "Failed to disable MFA", false
                ));
            }
        } catch (Exception e) {
            logger.error("MFA disable error for user: {}", request.getEmail(), e);
            return ResponseEntity.badRequest().body(new MFAResponseDTOs.MFAResponse(
                "Failed to disable MFA: " + e.getMessage(), false
            ));
        }
    }
}