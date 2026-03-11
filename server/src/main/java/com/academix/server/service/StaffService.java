package com.academix.server.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.academix.server.model.Staff;
import com.academix.server.repository.StaffRepository;

@Service
@Transactional
public class StaffService {

    private static final Logger logger = LoggerFactory.getLogger(StaffService.class);

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    /**
     * Create a new staff member
     */
    public Staff createStaff(Staff staff) {
        // Validate unique constraints
        if (staffRepository.existsByEmail(staff.getEmail())) {
            throw new RuntimeException("Email already exists: " + staff.getEmail());
        }

        // Generate staff ID
        String generatedStaffId = generateStaffId(staff.getDepartment());
        int attempts = 0;
        while (staffRepository.existsByStaffId(generatedStaffId) && attempts < 10) {
            generatedStaffId = generateStaffId(staff.getDepartment());
            attempts++;
        }
        staff.setStaffId(generatedStaffId);

        // Generate secure password
        String generatedPassword = emailService.generateSecurePassword(10);
        staff.setPassword(generatedPassword);

        // Hash the password
        userService.prepareUserForSaving(staff);

        // Set default values
        if (staff.getJoinDate() == null) {
            staff.setJoinDate(LocalDate.now());
        }
        if (staff.getStatus() == null) {
            staff.setStatus(Staff.StaffStatus.ACTIVE);
        }

        // Generate verification token
        userService.generateEmailVerificationToken(staff);

        // Save staff
        Staff savedStaff = staffRepository.save(staff);

        logger.info("Staff registered - Email: {}, StaffId: {}, Department: {}, Position: {}",
            staff.getEmail(), staff.getStaffId(), staff.getDepartment(), staff.getPosition());

        // Send registration email
        try {
            emailService.sendStaffRegistrationEmail(staff, generatedPassword);
        } catch (Exception e) {
            logger.error("Failed to send registration email to staff: {}", staff.getEmail(), e);
        }

        return savedStaff;
    }

    /**
     * Update an existing staff member
     */
    public Staff updateStaff(Long id, Staff staffDetails) {
        Optional<Staff> optionalStaff = staffRepository.findById(id);
        if (!optionalStaff.isPresent()) {
            throw new RuntimeException("Staff not found with id: " + id);
        }

        Staff staff = optionalStaff.get();

        // Check for email uniqueness if email is being changed
        if (!staff.getEmail().equals(staffDetails.getEmail()) && 
            staffRepository.existsByEmail(staffDetails.getEmail())) {
            throw new RuntimeException("Email already exists: " + staffDetails.getEmail());
        }

        // Update fields
        staff.setFirstName(staffDetails.getFirstName());
        staff.setLastName(staffDetails.getLastName());
        staff.setOtherNames(staffDetails.getOtherNames());
        staff.setEmail(staffDetails.getEmail());
        staff.setPhoneNumber(staffDetails.getPhoneNumber());
        staff.setGender(staffDetails.getGender());
        staff.setDateOfBirth(staffDetails.getDateOfBirth());
        staff.setNationality(staffDetails.getNationality());
        staff.setDepartment(staffDetails.getDepartment());
        staff.setPosition(staffDetails.getPosition());
        staff.setStatus(staffDetails.getStatus());
        staff.setSalary(staffDetails.getSalary());
        staff.setEmergencyContactName(staffDetails.getEmergencyContactName());
        staff.setEmergencyContactNumber(staffDetails.getEmergencyContactNumber());
        staff.setAddress(staffDetails.getAddress());
        staff.setContractType(staffDetails.getContractType());
        staff.setQualification(staffDetails.getQualification());
        staff.setExperience(staffDetails.getExperience());

        return staffRepository.save(staff);
    }

    /**
     * Get all staff members
     */
    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }

    /**
     * Get staff by ID
     */
    public Staff getStaffById(Long id) {
        return staffRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Staff not found with id: " + id));
    }

    /**
     * Get staff by staff ID
     */
    public Staff getStaffByStaffId(String staffId) {
        return staffRepository.findByStaffId(staffId)
            .orElseThrow(() -> new RuntimeException("Staff not found with staffId: " + staffId));
    }

    /**
     * Get staff by email
     */
    public Staff getStaffByEmail(String email) {
        return staffRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Staff not found with email: " + email));
    }

    /**
     * Get staff by department
     */
    public List<Staff> getStaffByDepartment(String department) {
        return staffRepository.findByDepartment(department);
    }

    /**
     * Get staff by status
     */
    public List<Staff> getStaffByStatus(Staff.StaffStatus status) {
        return staffRepository.findByStatus(status);
    }

    /**
     * Search staff
     */
    public List<Staff> searchStaff(String searchTerm) {
        return staffRepository.searchStaff(searchTerm);
    }

    /**
     * Get distinct departments
     */
    public List<String> getDistinctDepartments() {
        return staffRepository.findDistinctDepartments();
    }

    /**
     * Delete staff member
     */
    public void deleteStaff(Long id) {
        if (!staffRepository.existsById(id)) {
            throw new RuntimeException("Staff not found with id: " + id);
        }
        staffRepository.deleteById(id);
        logger.info("Staff deleted with id: {}", id);
    }

    /**
     * Get staff statistics
     */
    public Map<String, Object> getStaffStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        List<Staff> allStaff = staffRepository.findAll();
        long totalStaff = allStaff.size();
        long activeStaff = staffRepository.countByStatus(Staff.StaffStatus.ACTIVE);
        long onLeave = staffRepository.countByStatus(Staff.StaffStatus.ON_LEAVE);
        
        List<String> departments = staffRepository.findDistinctDepartments();
        long totalDepartments = departments.size();

        stats.put("totalStaff", totalStaff);
        stats.put("activeStaff", activeStaff);
        stats.put("onLeave", onLeave);
        stats.put("departments", totalDepartments);
        stats.put("inactiveStaff", totalStaff - activeStaff - onLeave);

        // Department breakdown
        Map<String, Long> departmentCounts = new HashMap<>();
        for (String department : departments) {
            departmentCounts.put(department, staffRepository.countByDepartment(department));
        }
        stats.put("departmentCounts", departmentCounts);

        return stats;
    }

    /**
     * Generate staff ID
     */
    private String generateStaffId(String department) {
        // Extract department code (first 3 letters, uppercase)
        String deptCode = department != null && department.length() >= 3 ? 
            department.substring(0, 3).toUpperCase() : "STF";
        
        // Get current year
        int currentYear = LocalDate.now().getYear();
        
        // Generate a sequence number based on current count
        long count = staffRepository.count() + 1;
        
        return deptCode + currentYear + String.format("%03d", count);
    }

    /**
     * Update staff status
     */
    public Staff updateStaffStatus(Long id, Staff.StaffStatus status) {
        Staff staff = getStaffById(id);
        staff.setStatus(status);
        return staffRepository.save(staff);
    }

    /**
     * Get staff by contract type
     */
    public List<Staff> getStaffByContractType(Staff.ContractType contractType) {
        return staffRepository.findByContractType(contractType);
    }

    /**
     * Get staff by experience range
     */
    public List<Staff> getStaffByExperienceRange(Integer minExperience, Integer maxExperience) {
        return staffRepository.findByExperienceBetween(minExperience, maxExperience);
    }
}