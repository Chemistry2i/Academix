package com.academix.server.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.academix.server.model.SchoolClass;
import com.academix.server.model.Student;
import com.academix.server.model.Result;
import com.academix.server.repository.ResultRepository;
import com.academix.server.repository.SchoolClassRepository;
import com.academix.server.repository.StaffRepository;
import com.academix.server.repository.StudentRepository;
import com.academix.server.repository.TeacherRepository;

@Service
@Transactional
public class StudentService {

    private static final Logger logger = LoggerFactory.getLogger(StudentService.class);

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ResultRepository resultRepository;

    /**
     * Create a new student
     */
    public Student createStudent(Student student) {
        String normalizedEmail = student.getEmail() != null ? student.getEmail().trim() : null;
        if (normalizedEmail != null) {
            student.setEmail(normalizedEmail);
        }

        // Validate unique constraints
        if (normalizedEmail != null && !normalizedEmail.isEmpty() && isEmailAlreadyInUse(normalizedEmail)) {
            throw new RuntimeException("Email already exists: " + normalizedEmail);
        }
        
        if (student.getLinn() != null && !student.getLinn().trim().isEmpty() &&
            studentRepository.existsByLinn(student.getLinn())) {
            throw new RuntimeException("LINN already exists: " + student.getLinn());
        }

        // Sync schoolClass with currentClass BEFORE any validation
        // If schoolClass is provided, use it to set currentClass
        if (student.getSchoolClass() != null && student.getSchoolClass().getId() != null) {
            SchoolClass schoolClass = schoolClassRepository.findById(student.getSchoolClass().getId())
                .orElseThrow(() -> new RuntimeException("School class not found with id: " + student.getSchoolClass().getId()));
            student.setSchoolClassByEntity(schoolClass);
        }
        // If only currentClass string is provided, try to find and link the SchoolClass
        else if (student.getCurrentClass() != null && student.getSchoolClass() == null) {
            SchoolClass schoolClass = schoolClassRepository.findByName(student.getCurrentClass()).orElse(null);
            if (schoolClass != null) {
                student.setSchoolClassByEntity(schoolClass);
                logger.info("Linked student to SchoolClass entity for class: {}", student.getCurrentClass());
            }
            // If class doesn't exist, leave schoolClass as null but keep currentClass string for flexibility
        }

        // Generate student ID
        String generatedStudentId = generateStudentId(student.getCurrentClass());
        int attempts = 0;
        while (studentRepository.existsByStudentId(generatedStudentId) && attempts < 10) {
            generatedStudentId = generateStudentId(student.getCurrentClass());
            attempts++;
        }
        student.setStudentId(generatedStudentId);

        // Generate secure password
        String generatedPassword = emailService.generateSecurePassword(10);
        student.setPassword(generatedPassword);

        // Hash the password
        userService.prepareUserForSaving(student);

        // Set default values
        if (student.getIsActive() == null) {
            student.setIsActive(true);
        }
        if (student.getIsDeleted() == null) {
            student.setIsDeleted(false);
        }
        // Students are automatically verified during registration
        student.setEmailVerified(true);

        // Save student
        Student savedStudent;
        try {
            savedStudent = studentRepository.save(student);
        } catch (DataIntegrityViolationException e) {
            String detailedMessage = resolveUniqueConstraintMessage(e, student);
            throw new RuntimeException(detailedMessage, e);
        }

        // Log registration details
        logger.info("Student registered - Email: {}, StudentId: {}, Class: {}, SchoolClass: {}", 
            student.getEmail(), student.getStudentId(), student.getCurrentClass(),
            student.getSchoolClass() != null ? student.getSchoolClass().getName() : "null");

        // Send registration email
        try {
            emailService.sendStudentRegistrationEmail(
                student.getEmail(),
                student.getFullName(),
                student.getStudentId(),
                student.getCurrentClass(),
                student.getStream(),
                generatedPassword
            );
        } catch (Exception e) {
            logger.warn("Email sending failed but registration successful: {}", e.getMessage());
        }

        return savedStudent;
    }

    private boolean isEmailAlreadyInUse(String email) {
        return studentRepository.existsByEmail(email)
            || teacherRepository.existsByEmail(email)
            || staffRepository.existsByEmail(email);
    }

    private String resolveUniqueConstraintMessage(DataIntegrityViolationException exception, Student student) {
        Throwable mostSpecificCause = exception.getMostSpecificCause();
        String message = mostSpecificCause != null
            ? mostSpecificCause.getMessage()
            : exception.getMessage();

        if (message == null) {
            return "Duplicate value violates a unique constraint.";
        }

        String lowerMessage = message.toLowerCase();
        if (lowerMessage.contains("users(email") || lowerMessage.contains("email")) {
            return "Email already exists: " + student.getEmail();
        }
        if (lowerMessage.contains("linn")) {
            return "LINN already exists: " + student.getLinn();
        }
        if (lowerMessage.contains("student_id") || lowerMessage.contains("studentid")) {
            return "Student ID already exists. Please retry registration.";
        }
        if (lowerMessage.contains("nin")) {
            return "NIN already exists: " + student.getNin();
        }

        return "Duplicate value violates a unique constraint.";
    }

    /**
     * Get all students
     */
    @Transactional(readOnly = true)
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    /**
     * Get all active students
     */
    @Transactional(readOnly = true)
    public List<Student> getActiveStudents() {
        return studentRepository.findByIsActiveTrue();
    }

    /**
     * Get student by ID
     */
    @Transactional(readOnly = true)
    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    /**
     * Get student by studentId (e.g., "S12024001")
     */
    @Transactional(readOnly = true)
    public Optional<Student> getByStudentId(String studentId) {
        return studentRepository.findByStudentId(studentId);
    }

    /**
     * Get student by email
     */
    @Transactional(readOnly = true)
    public Optional<Student> getByEmail(String email) {
        return studentRepository.findByEmail(email);
    }

    /**
     * Update student
     */
    public Student updateStudent(Long id, Student studentDetails) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        // Update basic info
        if (studentDetails.getFirstName() != null) {
            student.setFirstName(studentDetails.getFirstName());
        }
        if (studentDetails.getLastName() != null) {
            student.setLastName(studentDetails.getLastName());
        }
        if (studentDetails.getOtherNames() != null) {
            student.setOtherNames(studentDetails.getOtherNames());
        }
        if (studentDetails.getPhoneNumber() != null) {
            student.setPhoneNumber(studentDetails.getPhoneNumber());
        }
        if (studentDetails.getGender() != null) {
            student.setGender(studentDetails.getGender());
        }
        if (studentDetails.getDateOfBirth() != null) {
            student.setDateOfBirth(studentDetails.getDateOfBirth());
        }

        // Update academic info - PROPERLY SYNC CLASS FIELDS
        // Preference: If schoolClass is provided in request, use that
        if (studentDetails.getSchoolClass() != null && studentDetails.getSchoolClass().getId() != null) {
            SchoolClass schoolClass = schoolClassRepository.findById(studentDetails.getSchoolClass().getId())
                .orElseThrow(() -> new RuntimeException("School class not found with id: " + studentDetails.getSchoolClass().getId()));
            student.setSchoolClassByEntity(schoolClass);
            logger.info("Student {} moved to class {} (via schoolClass relationship)", id, schoolClass.getName());
        }
        // Fallback: If only currentClass string is provided, try to find and sync
        else if (studentDetails.getCurrentClass() != null) {
            String className = studentDetails.getCurrentClass();
            SchoolClass schoolClass = schoolClassRepository.findByName(className).orElse(null);
            if (schoolClass != null) {
                student.setSchoolClassByEntity(schoolClass);
                logger.info("Student {} moved to class {} (via class name lookup)", id, className);
            } else {
                // If class doesn't exist, just update the string field for backward compatibility
                student.setCurrentClass(className);
                logger.warn("Class {} not found in SchoolClass entities, updated currentClass string only", className);
            }
        }

        if (studentDetails.getStream() != null) {
            student.setStream(studentDetails.getStream());
        }
        if (studentDetails.getCombination() != null) {
            student.setCombination(studentDetails.getCombination());
        }
        if (studentDetails.getHouse() != null) {
            student.setHouse(studentDetails.getHouse());
        }
        if (studentDetails.getResidenceStatus() != null) {
            student.setResidenceStatus(studentDetails.getResidenceStatus());
        }

        // Update address info
        if (studentDetails.getDistrict() != null) {
            student.setDistrict(studentDetails.getDistrict());
        }
        if (studentDetails.getCounty() != null) {
            student.setCounty(studentDetails.getCounty());
        }
        if (studentDetails.getSubCounty() != null) {
            student.setSubCounty(studentDetails.getSubCounty());
        }
        if (studentDetails.getParish() != null) {
            student.setParish(studentDetails.getParish());
        }
        if (studentDetails.getVillage() != null) {
            student.setVillage(studentDetails.getVillage());
        }

        // Update LINN if provided and different
        if (studentDetails.getLinn() != null && !studentDetails.getLinn().equals(student.getLinn())) {
            if (studentRepository.existsByLinn(studentDetails.getLinn())) {
                throw new RuntimeException("LINN already exists: " + studentDetails.getLinn());
            }
            student.setLinn(studentDetails.getLinn());
        }

        logger.info("Student updated - ID: {}, StudentId: {}", id, student.getStudentId());
        return studentRepository.save(student);
    }

    /**
     * Delete student (soft delete)
     */
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        
        student.markAsDeleted();
        studentRepository.save(student);
        logger.info("Student soft-deleted - ID: {}, StudentId: {}", id, student.getStudentId());
    }

    /**
     * Hard delete student (permanent)
     */
    public void hardDeleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Student not found with id: " + id);
        }
        studentRepository.deleteById(id);
        logger.info("Student permanently deleted - ID: {}", id);
    }

    /**
     * Search students
     */
    @Transactional(readOnly = true)
    public List<Student> searchStudents(String searchTerm) {
        return studentRepository.searchStudents(searchTerm);
    }

    /**
     * Advanced search with filters
     */
    @Transactional(readOnly = true)
    public List<Student> searchWithFilters(String currentClass, String stream, String house,
                                           Student.ResidenceStatus residenceStatus, Boolean isActive) {
        return studentRepository.findByFilters(currentClass, stream, house, residenceStatus, isActive);
    }

    /**
     * Get students by class
     */
    @Transactional(readOnly = true)
    public List<Student> getStudentsByClass(String currentClass) {
        return studentRepository.findByCurrentClass(currentClass);
    }

    /**
     * Get students by house
     */
    @Transactional(readOnly = true)
    public List<Student> getStudentsByHouse(String house) {
        return studentRepository.findByHouse(house);
    }

    /**
     * Get students by residence status
     */
    @Transactional(readOnly = true)
    public List<Student> getStudentsByResidenceStatus(Student.ResidenceStatus status) {
        return studentRepository.findByResidenceStatus(status);
    }

    /**
     * Get student results (placeholder - to be implemented with Results entity)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStudentResults(Long studentId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        Map<String, Object> results = new HashMap<>();
        results.put("studentId", student.getStudentId());
        results.put("studentName", student.getFullName());
        results.put("currentClass", student.getCurrentClass());
        
        try {
            // Fetch all results for this student from the Result entity
            List<Result> studentResults = resultRepository.findByStudentId(studentId);
            
            // Transform Result entities to maps for JSON response
            List<Map<String, Object>> formattedResults = studentResults.stream()
                .map(r -> {
                    Map<String, Object> resultMap = new HashMap<>();
                    resultMap.put("id", r.getId());
                    resultMap.put("subjectCode", r.getSubjectCode());
                    resultMap.put("subjectName", r.getSubjectName());
                    resultMap.put("marksObtained", r.getMarksObtained());
                    resultMap.put("maxMarks", r.getMaxMarks());
                    resultMap.put("percentage", r.getPercentage());
                    resultMap.put("grade", r.getGrade());
                    resultMap.put("gradePoints", r.getGradePoints());
                    resultMap.put("gradingScale", r.getGradingScale());
                    resultMap.put("term", r.getTerm());
                    resultMap.put("academicYear", r.getAcademicYear());
                    resultMap.put("className", r.getClassName());
                    resultMap.put("remarks", r.getRemarks());
                    resultMap.put("createdAt", r.getCreatedAt());
                    return resultMap;
                })
                .toList();
            
            results.put("results", formattedResults);
            results.put("totalResults", formattedResults.size());
            results.put("message", "Student results retrieved successfully");
        } catch (Exception e) {
            logger.warn("Error fetching student results: {}", e.getMessage());
            results.put("results", List.of());
            results.put("message", "Could not fetch results: " + e.getMessage());
        }
        
        return results;
    }

    /**
     * Get student fees (placeholder - to be implemented with Fees entity)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStudentFees(Long studentId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        Map<String, Object> fees = new HashMap<>();
        fees.put("studentId", student.getStudentId());
        fees.put("studentName", student.getFullName());
        fees.put("currentClass", student.getCurrentClass());
        fees.put("residenceStatus", student.getResidenceStatus());
        fees.put("message", "Fees module not yet implemented");
        fees.put("totalFees", 0);
        fees.put("paidAmount", 0);
        fees.put("balance", 0);
        fees.put("payments", List.of()); // Placeholder for actual payments
        
        return fees;
    }

    /**
     * Get student attendance (placeholder - to be implemented with Attendance entity)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStudentAttendance(Long studentId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        Map<String, Object> attendance = new HashMap<>();
        attendance.put("studentId", student.getStudentId());
        attendance.put("studentName", student.getFullName());
        attendance.put("currentClass", student.getCurrentClass());
        attendance.put("message", "Attendance module not yet implemented");
        attendance.put("totalDays", 0);
        attendance.put("presentDays", 0);
        attendance.put("absentDays", 0);
        attendance.put("attendancePercentage", 0.0);
        attendance.put("records", List.of()); // Placeholder for actual records
        
        return attendance;
    }

    /**
     * Activate student
     */
    public Student activateStudent(Long id) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        student.activate();
        return studentRepository.save(student);
    }

    /**
     * Deactivate student
     */
    public Student deactivateStudent(Long id) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        student.deactivate();
        return studentRepository.save(student);
    }

    /**
     * Get student statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStudentStatistics() {
        Map<String, Object> stats = new HashMap<>();
        long total = studentRepository.count();
        long active = studentRepository.countByIsActiveTrue();
        stats.put("totalStudents", total);
        stats.put("activeStudents", active);
        stats.put("inactiveStudents", total - active);
        stats.put("maleStudents", studentRepository.countByGender("MALE"));
        stats.put("femaleStudents", studentRepository.countByGender("FEMALE"));
        stats.put("boardingStudents", studentRepository.findByResidenceStatus(Student.ResidenceStatus.BOARDING).size());
        stats.put("dayStudents", studentRepository.findByResidenceStatus(Student.ResidenceStatus.DAY).size());
        return stats;
    }

    // ============ DATA MIGRATION - Link UnlinkedStudents to Classes ============

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void autoLinkStudentsOnStartup() {
        logger.info("Running automatic student-class linkage check...");
        List<Student> unlinkedStudents = studentRepository.findAll().stream()
                .filter(s -> s.getSchoolClass() == null && s.getCurrentClass() != null && !s.getCurrentClass().isBlank())
                .toList();

        if (unlinkedStudents.isEmpty()) {
            logger.info("All students are already properly linked to classes.");
            return;
        }

        int linked = 0;
        for (Student student : unlinkedStudents) {
            String originalName = student.getCurrentClass();
            // Map "Senior X" -> "SX" automatically (e.g., "Senior 1" -> "S1")
            String mappedName = originalName.replaceAll("(?i)^Senior\\s+", "S").trim();
            
            // Map "S3A" -> Try finding "S3A" directly, or finding "S3"
            
            Optional<SchoolClass> matchingClass = schoolClassRepository.findByName(mappedName);
            
            // If they created it as purely "S1", "S3", etc.
            if (matchingClass.isEmpty() && mappedName.length() >= 2) {
                // Try stripping trailing letters like in "S3A" -> "S3" if "S3A" doesn't exist
                String baseClass = mappedName.replaceAll("[A-Za-z]+$", "");
                if (!baseClass.equals(mappedName)) {
                    matchingClass = schoolClassRepository.findByName(baseClass);
                }
            }

            if (matchingClass.isPresent()) {
                student.setSchoolClassByEntity(matchingClass.get());
                studentRepository.save(student);
                linked++;
                logger.info("Auto-linked student {} from '{}' to class {} (ID: {})", 
                    student.getStudentId(), originalName, matchingClass.get().getName(), matchingClass.get().getId());
            } else {
                logger.warn("Could not find matching class for student {} (Class string: '{}')", 
                    student.getStudentId(), originalName);
            }
        }
        
        logger.info("Automatic linkage complete. Linked {}/{} students.", linked, unlinkedStudents.size());
    }

    /**
     * Migrate students: Link unlinked students to their SchoolClass entities
     * This handles cases where school_class_id is NULL but current_class has a value
     */
    @Transactional
    public Map<String, Object> migrateStudentsToLinks() {
        Map<String, Object> report = new HashMap<>();
        int totalStudents = 0;
        int linked = 0;
        int unmatched = 0;
        int nullClass = 0;
        List<Map<String, String>> unmatchedStudents = new java.util.ArrayList<>();

        // Get all students
        List<Student> allStudents = studentRepository.findAll();
        totalStudents = allStudents.size();

        for (Student student : allStudents) {
            // Case 1: Already linked - skip
            if (student.getSchoolClass() != null) {
                continue;
            }

            // Case 2: No class at all - null
            if (student.getCurrentClass() == null || student.getCurrentClass().isBlank()) {
                nullClass++;
                continue;
            }

            // Case 3: Try to find and link SchoolClass
            String currentClassName = student.getCurrentClass();
            Optional<SchoolClass> schoolClass = schoolClassRepository.findByName(currentClassName);

            if (schoolClass.isPresent()) {
                // Found a matching class - link it
                student.setSchoolClassByEntity(schoolClass.get());
                studentRepository.save(student);
                linked++;
                logger.info("Linked student {} to class {} (ID: {})", 
                    student.getStudentId(), currentClassName, schoolClass.get().getId());
            } else {
                // No matching class found
                unmatched++;
                Map<String, String> unmatchedInfo = new HashMap<>();
                unmatchedInfo.put("studentId", student.getStudentId());
                unmatchedInfo.put("studentName", student.getFullName());
                unmatchedInfo.put("currentClass", currentClassName);
                unmatchedStudents.add(unmatchedInfo);
                logger.warn("No matching class found for student {} with currentClass: {}", 
                    student.getStudentId(), currentClassName);
            }
        }

        // Build report
        report.put("success", true);
        report.put("message", "Student class migration completed");
        report.put("totalStudents", totalStudents);
        report.put("linked", linked);
        report.put("unmatched", unmatched);
        report.put("nullClass", nullClass);
        report.put("unmatchedStudents", unmatchedStudents);
        report.put("timestamp", LocalDateTime.now());

        return report;
    }

    /**
     * Link a single student to a specific class
     * Used when migrating unmatched students after new classes are created
     */
    public Student linkStudentToClass(Long studentId, Long schoolClassId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        SchoolClass schoolClass = schoolClassRepository.findById(schoolClassId)
            .orElseThrow(() -> new RuntimeException("School class not found with id: " + schoolClassId));

        // Use the syncing method to link properly
        student.setSchoolClassByEntity(schoolClass);
        Student saved = studentRepository.save(student);

        logger.info("Manually linked student {} to class {}", 
            student.getStudentId(), schoolClass.getName());

        return saved;
    }

    /**
     * Get list of students that need class assignment
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getUnlinkedStudentsReport() {
        Map<String, Object> report = new HashMap<>();
        List<Student> allStudents = studentRepository.findAll();

        List<Map<String, Object>> unlinked = new java.util.ArrayList<>();
        List<Map<String, Object>> linked = new java.util.ArrayList<>();

        for (Student student : allStudents) {
            Map<String, Object> info = new HashMap<>();
            info.put("id", student.getId());
            info.put("studentId", student.getStudentId());
            info.put("fullName", student.getFullName());
            info.put("currentClass", student.getCurrentClass());
            info.put("schoolClassId", student.getSchoolClass() != null ? student.getSchoolClass().getId() : null);

            if (student.getSchoolClass() == null) {
                unlinked.add(info);
            } else {
                info.put("schoolClassName", student.getSchoolClass().getName());
                linked.add(info);
            }
        }

        report.put("total", allStudents.size());
        report.put("linked", linked.size());
        report.put("unlinked", unlinked.size());
        report.put("linkedStudents", linked);
        report.put("unlinkedStudents", unlinked);

        return report;
    }

    // Helper method to generate student ID
    private String generateStudentId(String currentClass) {
        String year = String.valueOf(LocalDateTime.now().getYear());
        String classCode = "STU";

        if (currentClass != null) {
            if (currentClass.toLowerCase().contains("primary")) {
                classCode = "P";
                String classNum = currentClass.replaceAll("[^0-9]", "");
                if (!classNum.isEmpty()) {
                    classCode += classNum;
                }
            } else if (currentClass.toLowerCase().contains("senior")) {
                classCode = "S";
                String classNum = currentClass.replaceAll("[^0-9]", "");
                if (!classNum.isEmpty()) {
                    classCode += classNum;
                }
            }
        }

        long count = studentRepository.count() + 1;
        int randomNum = (int) (Math.random() * 100);

        return classCode + year + String.format("%03d%02d", count, randomNum);
    }
}
