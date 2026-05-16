package com.academix.server.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.academix.server.model.Staff;
import com.academix.server.repository.StaffRepository;
import com.academix.server.service.UserService;

/**
 * Emergency admin password reset endpoint
 * Use only for development/testing
 */
@Configuration
@RestController
@RequestMapping("/api/admin")
public class AdminPasswordReset {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminPasswordReset.class);
    
    @Autowired
    private StaffRepository staffRepository;
    
    @Autowired
    private UserService userService;
    
    /**
     * Emergency endpoint to reset admin password
     * POST /api/admin/reset-admin-password
     */
    @PostMapping("/reset-admin-password")
    public String resetAdminPassword() {
        try {
            // Find admin by email
            var adminOpt = staffRepository.findByEmail("admin@sms.com");
            
            if (!adminOpt.isPresent()) {
                logger.warn("Admin user not found");
                return "Admin user not found. Creating new admin...";
            }
            
            Staff admin = adminOpt.get();
            
            // Set raw password
            admin.setPassword("Admin@123");
            
            // Encode password using userService
            userService.prepareUserForSaving(admin);
            
            // Save to database
            staffRepository.save(admin);
            
            logger.info("✓ Admin password reset to: Admin@123");
            logger.info("✓ Staff ID: {}", admin.getStaffId());
            
            return "Admin password reset successfully to: Admin@123\n" +
                   "Email: admin@sms.com\n" +
                   "Staff ID: " + admin.getStaffId();
            
        } catch (Exception e) {
            logger.error("Error resetting admin password: {}", e.getMessage());
            return "Error: " + e.getMessage();
        }
    }
}
