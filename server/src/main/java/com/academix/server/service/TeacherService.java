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

import com.academix.server.model.Teacher;
import com.academix.server.repository.TeacherRepository;

@Service
@Transactional
public class TeacherService {

    private static final Logger logger = LoggerFactory.getLogger(TeacherService.class);

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    /**
     * Create a new teacher
     */
    public Teacher createTeacher(Teacher teacher) {
        // Validate unique constraints
        if (teacherRepository.existsByEmail(teacher.getEmail())) {
            throw new RuntimeException("Email already exists: " + teacher.getEmail());
        }

        if (teacher.getRegistrationNumber() != null && !teacher.getRegistrationNumber().trim().isEmpty() &&
            teacherRepository.existsByRegistrationNumber(teacher.getRegistrationNumber())) {
            throw new RuntimeException("Registration number already exists: " + teacher.getRegistrationNumber());
        }

        // Generate teacher ID
        String generatedTeacherId = generateTeacherId(teacher.getDepartment());
        int attempts = 0;
        while (teacherRepository.existsByTeacherId(generatedTeacherId) && attempts < 10) {
            generatedTeacherId = generateTeacherId(teacher.getDepartment());
            attempts++;
        }
        teacher.setTeacherId(generatedTeacherId);

        // Generate secure password
        String generatedPassword = emailService.generateSecurePassword(10);
        teacher.setPassword(generatedPassword);

        // Hash the password
        userService.prepareUserForSaving(teacher);

        // Set default values
        if (teacher.getIsActive() == null) {
            teacher.setIsActive(true);
        }
        if (teacher.getIsDeleted() == null) {
            teacher.setIsDeleted(false);
        }
        if (teacher.getEmailVerified() == null) {
            teacher.setEmailVerified(false);
        }
        if (teacher.getEmploymentStatus() == null) {
            teacher.setEmploymentStatus(Teacher.EmploymentStatus.ACTIVE);
        }
        if (teacher.getDateJoined() == null) {
            teacher.setDateJoined(LocalDate.now());
        }
        if (teacher.getIsClassTeacher() == null) {
            teacher.setIsClassTeacher(false);
        }
        if (teacher.getIsDepartmentHead() == null) {
            teacher.setIsDepartmentHead(false);
        }

        // Generate verification token
        userService.generateEmailVerificationToken(teacher);

        // Save teacher
        Teacher savedTeacher = teacherRepository.save(teacher);

        logger.info("Teacher registered - Email: {}, TeacherId: {}, Department: {}",
            teacher.getEmail(), teacher.getTeacherId(), teacher.getDepartment());

        // Send registration email
        try {
            emailService.sendUserCredentialsEmail(
                teacher.getEmail(),
                teacher.getFullName(),
                generatedPassword
            );
        } catch (Exception e) {
            logger.warn("Email sending failed but registration successful: {}", e.getMessage());
        }

        return savedTeacher;
    }

    /**
     * Get all teachers
     */
    @Transactional(readOnly = true)
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    /**
     * Get active teachers
     */
    @Transactional(readOnly = true)
    public List<Teacher> getActiveTeachers() {
        return teacherRepository.findByIsActiveTrue();
    }

    /**
     * Get teacher by ID
     */
    @Transactional(readOnly = true)
    public Optional<Teacher> getTeacherById(Long id) {
        return teacherRepository.findById(id);
    }

    /**
     * Get teacher by teacherId
     */
    @Transactional(readOnly = true)
    public Optional<Teacher> getByTeacherId(String teacherId) {
        return teacherRepository.findByTeacherId(teacherId);
    }

    /**
     * Get teacher by email
     */
    @Transactional(readOnly = true)
    public Optional<Teacher> getByEmail(String email) {
        return teacherRepository.findByEmail(email);
    }

    /**
     * Update teacher
     */
    public Teacher updateTeacher(Long id, Teacher teacherDetails) {
        Teacher teacher = teacherRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + id));

        // Update basic info
        if (teacherDetails.getFirstName() != null) {
            teacher.setFirstName(teacherDetails.getFirstName());
        }
        if (teacherDetails.getLastName() != null) {
            teacher.setLastName(teacherDetails.getLastName());
        }
        if (teacherDetails.getOtherNames() != null) {
            teacher.setOtherNames(teacherDetails.getOtherNames());
        }
        if (teacherDetails.getPhoneNumber() != null) {
            teacher.setPhoneNumber(teacherDetails.getPhoneNumber());
        }
        if (teacherDetails.getGender() != null) {
            teacher.setGender(teacherDetails.getGender());
        }
        if (teacherDetails.getDateOfBirth() != null) {
            teacher.setDateOfBirth(teacherDetails.getDateOfBirth());
        }

        // Update employment info
        if (teacherDetails.getDepartment() != null) {
            teacher.setDepartment(teacherDetails.getDepartment());
        }
        if (teacherDetails.getPrimarySubject() != null) {
            teacher.setPrimarySubject(teacherDetails.getPrimarySubject());
        }
        if (teacherDetails.getEmploymentType() != null) {
            teacher.setEmploymentType(teacherDetails.getEmploymentType());
        }
        if (teacherDetails.getEmploymentStatus() != null) {
            teacher.setEmploymentStatus(teacherDetails.getEmploymentStatus());
        }
        if (teacherDetails.getQualifications() != null) {
            teacher.setQualifications(teacherDetails.getQualifications());
        }
        if (teacherDetails.getSpecialization() != null) {
            teacher.setSpecialization(teacherDetails.getSpecialization());
        }
        if (teacherDetails.getYearsOfExperience() != null) {
            teacher.setYearsOfExperience(teacherDetails.getYearsOfExperience());
        }

        // Update class teacher info
        if (teacherDetails.getIsClassTeacher() != null) {
            teacher.setIsClassTeacher(teacherDetails.getIsClassTeacher());
        }
        if (teacherDetails.getClassResponsibility() != null) {
            teacher.setClassResponsibility(teacherDetails.getClassResponsibility());
        }
        if (teacherDetails.getIsDepartmentHead() != null) {
            teacher.setIsDepartmentHead(teacherDetails.getIsDepartmentHead());
        }

        // Update subjects and classes if provided
        if (teacherDetails.getSubjects() != null && !teacherDetails.getSubjects().isEmpty()) {
            teacher.setSubjects(teacherDetails.getSubjects());
        }
        if (teacherDetails.getAssignedClasses() != null && !teacherDetails.getAssignedClasses().isEmpty()) {
            teacher.setAssignedClasses(teacherDetails.getAssignedClasses());
        }

        // Update address info
        if (teacherDetails.getDistrict() != null) {
            teacher.setDistrict(teacherDetails.getDistrict());
        }
        if (teacherDetails.getCounty() != null) {
            teacher.setCounty(teacherDetails.getCounty());
        }
        if (teacherDetails.getSubCounty() != null) {
            teacher.setSubCounty(teacherDetails.getSubCounty());
        }
        if (teacherDetails.getParish() != null) {
            teacher.setParish(teacherDetails.getParish());
        }
        if (teacherDetails.getVillage() != null) {
            teacher.setVillage(teacherDetails.getVillage());
        }

        // Update bank details
        if (teacherDetails.getBankName() != null) {
            teacher.setBankName(teacherDetails.getBankName());
        }
        if (teacherDetails.getBankAccountNumber() != null) {
            teacher.setBankAccountNumber(teacherDetails.getBankAccountNumber());
        }
        if (teacherDetails.getSalaryGrade() != null) {
            teacher.setSalaryGrade(teacherDetails.getSalaryGrade());
        }

        // Update emergency contact
        if (teacherDetails.getEmergencyContactName() != null) {
            teacher.setEmergencyContactName(teacherDetails.getEmergencyContactName());
        }
        if (teacherDetails.getEmergencyContactPhone() != null) {
            teacher.setEmergencyContactPhone(teacherDetails.getEmergencyContactPhone());
        }
        if (teacherDetails.getEmergencyContactRelationship() != null) {
            teacher.setEmergencyContactRelationship(teacherDetails.getEmergencyContactRelationship());
        }

        // Update registration number if different
        if (teacherDetails.getRegistrationNumber() != null &&
            !teacherDetails.getRegistrationNumber().equals(teacher.getRegistrationNumber())) {
            if (teacherRepository.existsByRegistrationNumber(teacherDetails.getRegistrationNumber())) {
                throw new RuntimeException("Registration number already exists: " + teacherDetails.getRegistrationNumber());
            }
            teacher.setRegistrationNumber(teacherDetails.getRegistrationNumber());
        }

        logger.info("Teacher updated - ID: {}, TeacherId: {}", id, teacher.getTeacherId());
        return teacherRepository.save(teacher);
    }

    /**
     * Delete teacher (soft delete)
     */
    public void deleteTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + id));

        teacher.markAsDeleted();
        teacher.setEmploymentStatus(Teacher.EmploymentStatus.TERMINATED);
        teacherRepository.save(teacher);
        logger.info("Teacher soft-deleted - ID: {}, TeacherId: {}", id, teacher.getTeacherId());
    }

    /**
     * Hard delete teacher
     */
    public void hardDeleteTeacher(Long id) {
        if (!teacherRepository.existsById(id)) {
            throw new RuntimeException("Teacher not found with id: " + id);
        }
        teacherRepository.deleteById(id);
        logger.info("Teacher permanently deleted - ID: {}", id);
    }

    /**
     * Search teachers
     */
    @Transactional(readOnly = true)
    public List<Teacher> searchTeachers(String searchTerm) {
        return teacherRepository.searchTeachers(searchTerm);
    }

    /**
     * Advanced search with filters
     */
    @Transactional(readOnly = true)
    public List<Teacher> searchWithFilters(String department, Teacher.EmploymentType employmentType,
                                           Teacher.EmploymentStatus employmentStatus,
                                           Boolean isClassTeacher, Boolean isActive) {
        return teacherRepository.findByFilters(department, employmentType, employmentStatus, isClassTeacher, isActive);
    }

    /**
     * Get teachers by department
     */
    @Transactional(readOnly = true)
    public List<Teacher> getTeachersByDepartment(String department) {
        return teacherRepository.findByDepartment(department);
    }

    /**
     * Get teachers by subject
     */
    @Transactional(readOnly = true)
    public List<Teacher> getTeachersBySubject(String subject) {
        return teacherRepository.findBySubject(subject);
    }

    /**
     * Get teachers assigned to a class
     */
    @Transactional(readOnly = true)
    public List<Teacher> getTeachersByClass(String className) {
        return teacherRepository.findByAssignedClass(className);
    }

    /**
     * Get teacher's subjects
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getTeacherSubjects(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
            .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + teacherId));

        Map<String, Object> result = new HashMap<>();
        result.put("teacherId", teacher.getTeacherId());
        result.put("teacherName", teacher.getFullName());
        result.put("primarySubject", teacher.getPrimarySubject());
        result.put("subjects", teacher.getSubjects());
        result.put("department", teacher.getDepartment());

        return result;
    }

    /**
     * Get teacher's classes
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getTeacherClasses(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
            .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + teacherId));

        Map<String, Object> result = new HashMap<>();
        result.put("teacherId", teacher.getTeacherId());
        result.put("teacherName", teacher.getFullName());
        result.put("isClassTeacher", teacher.getIsClassTeacher());
        result.put("classResponsibility", teacher.getClassResponsibility());
        result.put("assignedClasses", teacher.getAssignedClasses());

        return result;
    }

    /**
     * Upload marks (placeholder - to be implemented with Marks entity)
     */
    public Map<String, Object> uploadMarks(Long teacherId, Map<String, Object> marksData) {
        Teacher teacher = teacherRepository.findById(teacherId)
            .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + teacherId));

        Map<String, Object> result = new HashMap<>();
        result.put("teacherId", teacher.getTeacherId());
        result.put("teacherName", teacher.getFullName());
        result.put("message", "Marks upload module not yet implemented");
        result.put("receivedData", marksData);
        result.put("timestamp", LocalDateTime.now());

        logger.info("Marks upload attempted by teacher: {}", teacher.getTeacherId());
        return result;
    }

    /**
     * Get teacher attendance (placeholder - to be implemented with Attendance entity)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getTeacherAttendance(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
            .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + teacherId));

        Map<String, Object> attendance = new HashMap<>();
        attendance.put("teacherId", teacher.getTeacherId());
        attendance.put("teacherName", teacher.getFullName());
        attendance.put("department", teacher.getDepartment());
        attendance.put("message", "Attendance module not yet implemented");
        attendance.put("totalDays", 0);
        attendance.put("presentDays", 0);
        attendance.put("absentDays", 0);
        attendance.put("leaveDays", 0);
        attendance.put("attendancePercentage", 0.0);
        attendance.put("records", List.of());

        return attendance;
    }

    /**
     * Get teacher reports (placeholder - to be implemented)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getTeacherReports(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
            .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + teacherId));

        Map<String, Object> reports = new HashMap<>();
        reports.put("teacherId", teacher.getTeacherId());
        reports.put("teacherName", teacher.getFullName());
        reports.put("department", teacher.getDepartment());
        reports.put("assignedClasses", teacher.getAssignedClasses());
        reports.put("subjects", teacher.getSubjects());
        reports.put("message", "Reports module not yet implemented");
        reports.put("marksSubmitted", 0);
        reports.put("pendingSubmissions", 0);
        reports.put("reports", List.of());

        return reports;
    }

    /**
     * Assign subject to teacher
     */
    public Teacher assignSubject(Long teacherId, String subject) {
        Teacher teacher = teacherRepository.findById(teacherId)
            .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + teacherId));

        teacher.addSubject(subject);
        logger.info("Subject {} assigned to teacher {}", subject, teacher.getTeacherId());
        return teacherRepository.save(teacher);
    }

    /**
     * Remove subject from teacher
     */
    public Teacher removeSubject(Long teacherId, String subject) {
        Teacher teacher = teacherRepository.findById(teacherId)
            .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + teacherId));

        teacher.removeSubject(subject);
        logger.info("Subject {} removed from teacher {}", subject, teacher.getTeacherId());
        return teacherRepository.save(teacher);
    }

    /**
     * Assign class to teacher
     */
    public Teacher assignClass(Long teacherId, String className) {
        Teacher teacher = teacherRepository.findById(teacherId)
            .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + teacherId));

        teacher.addClass(className);
        logger.info("Class {} assigned to teacher {}", className, teacher.getTeacherId());
        return teacherRepository.save(teacher);
    }

    /**
     * Remove class from teacher
     */
    public Teacher removeClass(Long teacherId, String className) {
        Teacher teacher = teacherRepository.findById(teacherId)
            .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + teacherId));

        teacher.removeClass(className);
        logger.info("Class {} removed from teacher {}", className, teacher.getTeacherId());
        return teacherRepository.save(teacher);
    }

    /**
     * Get teacher statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getTeacherStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTeachers", teacherRepository.count());
        stats.put("activeTeachers", teacherRepository.countByIsActiveTrue());
        stats.put("permanentTeachers", teacherRepository.countByEmploymentType(Teacher.EmploymentType.PERMANENT));
        stats.put("contractTeachers", teacherRepository.countByEmploymentType(Teacher.EmploymentType.CONTRACT));
        stats.put("partTimeTeachers", teacherRepository.countByEmploymentType(Teacher.EmploymentType.PART_TIME));
        stats.put("classTeachers", teacherRepository.findByIsClassTeacherTrue().size());
        stats.put("departmentHeads", teacherRepository.findByIsDepartmentHeadTrue().size());
        return stats;
    }

    // Helper method to generate teacher ID
    private String generateTeacherId(String department) {
        String year = String.valueOf(LocalDateTime.now().getYear());
        String deptCode = "TCH";

        if (department != null && !department.isEmpty()) {
            // Take first 3 letters of department
            deptCode = department.length() >= 3
                ? department.substring(0, 3).toUpperCase()
                : department.toUpperCase();
        }

        long count = teacherRepository.count() + 1;
        int randomNum = (int) (Math.random() * 100);

        return deptCode + year + String.format("%03d%02d", count, randomNum);
    }
}
