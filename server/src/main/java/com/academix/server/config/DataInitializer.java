package com.academix.server.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.academix.server.model.Staff;
import com.academix.server.repository.StaffRepository;
import com.academix.server.service.UserService;

/**
 * Initialize database with admin user on application startup
 * Creates default admin user for system access
 */
@Configuration
public class DataInitializer {
    
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    
    @Bean
    CommandLineRunner initializeData(StaffRepository staffRepository, UserService userService) {
        return args -> {
            logger.info("=== Starting Database Initialization ===");
            
            try {
                // Check if admin already exists by email
                Iterable<Staff> allStaff = staffRepository.findAll();
                boolean adminExists = false;
                for (Staff staff : allStaff) {
                    if ("admin@sms.com".equals(staff.getEmail())) {
                        adminExists = true;
                        break;
                    }
                }
                
                if (adminExists) {
                    logger.info("✓ Admin user already exists");
                    return;
                }
                
                // Create and save admin user
                Staff admin = new Staff();
                admin.setEmail("admin@sms.com");
                admin.setFirstName("System");
                admin.setLastName("Administrator");
                admin.setDepartment("Administration");
                admin.setPosition("System Administrator");
                admin.setNin("CM123456789ASD");
                admin.setPhoneNumber("+256701234567");
                admin.setNationality("Ugandan");
                admin.setGender("MALE");
                admin.setDateOfBirth(java.time.LocalDate.of(1990, 1, 1));
                admin.setEmailVerified(true);  // Auto-verify email
                admin.setIsActive(true);
                admin.setIsDeleted(false);
                
                // Set raw password before encoding
                admin.setPassword("Admin@123");
                
                // Use userService to properly encode the password
                userService.prepareUserForSaving(admin);
                
                // Save to database first to get the auto-generated ID
                admin = staffRepository.save(admin);
                
                // Generate and set the staffId based on the database ID
                String staffId = "STAFF" + String.format("%06d", admin.getId());
                admin.setStaffId(staffId);
                
                // Save again with the staffId
                admin = staffRepository.save(admin);
                
                logger.info("✓ Admin user created successfully");
                logger.info("  Email: admin@sms.com");
                logger.info("  Password: Admin@123");
                logger.info("  Staff ID: {}", staffId);
                logger.info("  Email Verified: true");
                
                logger.info("=== Database Initialization Complete ===");
                
            } catch (Exception e) {
                logger.error("✗ Error initializing database: {}", e.getMessage());
                logger.debug("Full error:", e);
            }
        };
    }
}
