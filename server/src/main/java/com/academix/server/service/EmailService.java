package com.academix.server.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@academix.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String toEmail, String resetToken, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Password Reset Request - Academix");
            
            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
            
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "We received a request to reset your password for your Academix account.\n\n" +
                "To reset your password, please click on the following link:\n" +
                "%s\n\n" +
                "This link will expire in 15 minutes for security purposes.\n\n" +
                "If you did not request this password reset, please ignore this email. " +
                "Your password will remain unchanged.\n\n" +
                "For security reasons, please do not share this link with anyone.\n\n" +
                "Best regards,\n" +
                "The Academix Team",
                fullName, resetLink
            );
            
            message.setText(emailBody);
            
            try {
                mailSender.send(message);
                logger.info("Password reset email sent successfully to: {}", toEmail);
            } catch (Exception mailException) {
                // Log email content for development instead of throwing exception
                logger.warn("SMTP sending failed - Password reset email content for {}: \nSubject: {}\nBody: {}", 
                    toEmail, message.getSubject(), emailBody);
                logger.warn("Reset token for testing (copy this): {}", resetToken);
                logger.error("Email sending failed: {}", mailException.getMessage());
                // Don't re-throw - just log the issue
            }
            
        } catch (Exception e) {
            logger.error("Password reset email service error for {}: {}", toEmail, e.getMessage());
            logger.warn("Password reset token for manual use: {}", resetToken);
            // Don't throw exception - log error and continue
        }
    }

    public void sendEmailVerificationEmail(String toEmail, String verificationToken, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Email Verification - Academix");
            
            String verificationLink = frontendUrl + "/verify-email?token=" + verificationToken;
            
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "Welcome to Academix! Please verify your email address to complete your registration.\n\n" +
                "To verify your email, please click on the following link:\n" +
                "%s\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "If you did not create an account with Academix, please ignore this email.\n\n" +
                "Best regards,\n" +
                "The Academix Team",
                fullName, verificationLink
            );
            
            message.setText(emailBody);
            
            try {
                mailSender.send(message);
                logger.info("Email verification email sent successfully to: {}", toEmail);
            } catch (Exception mailException) {
                // Log email content for development instead of breaking registration
                logger.warn("SMTP sending failed - Email verification content for {}: \nSubject: {}\nBody: {}", 
                    toEmail, message.getSubject(), emailBody);
                logger.warn("Verification token for testing (copy this): {}", verificationToken);
                logger.error("Email sending failed but registration continues: {}", mailException.getMessage());
                // Don't throw exception - allow registration to continue
            }
            
        } catch (Exception e) {
            // Log error but don't throw - allow registration to continue
            logger.error("Email service error for {}, but registration will continue: {}", toEmail, e.getMessage());
            logger.warn("Verification token for manual use: {}", verificationToken);
        }
    }

    public void sendWelcomeEmail(String toEmail, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to Academix!");
            
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "Welcome to Academix School Management System!\n\n" +
                "Your account has been successfully created and verified. You can now log in to access all features.\n\n" +
                "Login URL: %s/login\n\n" +
                "If you have any questions or need assistance, please don't hesitate to contact our support team.\n\n" +
                "Best regards,\n" +
                "The Academix Team",
                fullName, frontendUrl
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            
            logger.info("Welcome email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send welcome email to: {}", toEmail, e);
            // We are not throwing exception for welcome email failure
        }
    }
}