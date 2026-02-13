package com.academix.server.service;

import java.security.SecureRandom;

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
    private static final SecureRandom random = new SecureRandom();
    private static final String PASSWORD_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@academix.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * Generate a secure random password
     */
    public String generateSecurePassword(int length) {
        StringBuilder password = new StringBuilder(length);
        
        // Ensure at least one of each character type
        // PASSWORD_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%" (60 chars total)
        // Uppercase: indices 0-22 (23 chars)
        // Lowercase: indices 23-46 (24 chars)  
        // Numbers: indices 47-54 (8 chars)
        // Special: indices 55-59 (5 chars)
        
        password.append(PASSWORD_CHARS.charAt(random.nextInt(23))); // Uppercase
        password.append(PASSWORD_CHARS.charAt(23 + random.nextInt(24))); // Lowercase  
        password.append(PASSWORD_CHARS.charAt(47 + random.nextInt(8))); // Number
        password.append(PASSWORD_CHARS.charAt(55 + random.nextInt(5))); // Special char
        
        // Fill remaining length with random characters
        for (int i = 4; i < length; i++) {
            password.append(PASSWORD_CHARS.charAt(random.nextInt(PASSWORD_CHARS.length())));
        }
        
        // Shuffle the password to avoid predictable patterns
        return shuffleString(password.toString());
    }
    
    private String shuffleString(String string) {
        char[] chars = string.toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int randomIndex = random.nextInt(i + 1);
            char temp = chars[i];
            chars[i] = chars[randomIndex];
            chars[randomIndex] = temp;
        }
        return new String(chars);
    }
    
    /**
     * Send password reset email
     */
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

    /**
     * Send student registration welcome email with academic details and login credentials
     */
    public void sendStudentRegistrationEmail(String toEmail, String fullName, String studentId, String currentClass, String stream, String generatedPassword) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to Academix - Your Student Account Details");
            
            String academicDetails = "";
            if (currentClass != null && !currentClass.trim().isEmpty()) {
                academicDetails += "Class: " + currentClass + "\\n";
            }
            if (stream != null && !stream.trim().isEmpty()) {
                academicDetails += "Stream: " + stream + "\\n";
            }
            
            String emailBody = String.format(
                "Dear %s,\\n\\n" +
                "Welcome to Academix School Management System!\\n\\n" +
                "Your student account has been successfully created. Here are your account details:\\n\\n" +
                "\ud83c\udd94 Student ID: %s\\n" +
                "\ud83d\udce7 Email: %s\\n" +
                "\ud83d\udd10 Temporary Password: %s\\n" +
                "%s\\n" +
                "\ud83d\udcf1 Student Portal: %s/login\\n\\n" +
                "IMPORTANT SECURITY INSTRUCTIONS:\\n" +
                "1. Login using your email and the temporary password above\\n" +
                "2. Change your password immediately after first login for security\\n" +
                "3. Keep your login credentials secure and private\\n" +
                "4. Never share your password with anyone\\n\\n" +
                "You can change your password anytime from your student portal.\\n\\n" +
                "For any questions or support, please contact our student services.\\n\\n" +
                "Welcome to the Academix family!\\n\\n" +
                "Best regards,\\n" +
                "The Academix Administrative Team",
                fullName, studentId, toEmail, generatedPassword, academicDetails, frontendUrl
            );
            
            message.setText(emailBody);
            
            try {
                mailSender.send(message);
                logger.info("Student credentials email sent successfully to: {} (Student ID: {})", toEmail, studentId);
            } catch (Exception mailException) {
                // Log email content for development instead of breaking registration
                logger.warn("SMTP sending failed - Student credentials for {}: \\nEmail: {}\\nStudent ID: {}\\nPassword: {}\\nClass: {}", 
                    toEmail, toEmail, studentId, generatedPassword, currentClass);
                logger.error("Student credentials email sending failed but registration continues: {}", mailException.getMessage());
                // Don't throw exception - allow registration to continue
            }
            
        } catch (Exception e) {
            // Log error but don't throw - allow registration to continue
            logger.error("Student credentials email service error for {}, but registration will continue: {}", toEmail, e.getMessage());
            logger.warn("Student login details for manual communication - Email: {}, Student ID: {}, Password: {}", toEmail, studentId, generatedPassword);
        }
    }
    
    /**
     * Send user credentials email for general user registration (non-student)
     */
    public void sendUserCredentialsEmail(String toEmail, String fullName, String generatedPassword) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Academix Account - Your Login Credentials");
            
            String emailBody = String.format(
                "Dear %s,\\n\\n" +
                "Welcome to Academix School Management System!\\n\\n" +
                "Your account has been successfully created. Here are your login credentials:\\n\\n" +
                "\ud83d\udce7 Email: %s\\n" +
                "\ud83d\udd10 Password: %s\\n" +
                "\ud83d\udcf1 Login URL: %s/login\\n\\n" +
                "IMPORTANT SECURITY INSTRUCTIONS:\\n" +
                "1. Login using the credentials above\\n" +
                "2. Change your password immediately after first login\\n" +
                "3. Keep your login credentials secure and private\\n" +
                "4. Never share your password with anyone\\n\\n" +
                "You can change your password anytime after logging in.\\n\\n" +
                "For any questions or support, please contact our support team.\\n\\n" +
                "Best regards,\\n" +
                "The Academix Team",
                fullName, toEmail, generatedPassword, frontendUrl
            );
            
            message.setText(emailBody);
            
            try {
                mailSender.send(message);
                logger.info("User credentials email sent successfully to: {}", toEmail);
            } catch (Exception mailException) {
                // Log email content for development instead of breaking registration
                logger.warn("SMTP sending failed - User credentials for {}: \\nEmail: {}\\nPassword: {}", 
                    toEmail, toEmail, generatedPassword);
                logger.error("User credentials email sending failed but registration continues: {}", mailException.getMessage());
                // Don't throw exception - allow registration to continue
            }
            
        } catch (Exception e) {
            logger.error("Failed to send user credentials email to: {}", toEmail, e);
            logger.warn("User credentials for manual communication - Email: {}, Password: {}", toEmail, generatedPassword);
        }
    }
    
    /**
     * Generic method to send simple email - for MFA and other purposes
     */
    public void sendEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            
            mailSender.send(message);
            logger.info("Email sent successfully to: {}", toEmail);
            
        } catch (Exception e) {
            logger.error("Failed to send email to: {}", toEmail, e);
            // Log the email content for debugging in development
            logger.warn("Email content that failed to send - Subject: {}, Body: {}", subject, body);
        }
    }
}