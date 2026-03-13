package com.academix.server.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.academix.server.model.Student;
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
    private UserService userService;

    @Autowired
    private EmailService emailService;

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
        if (student.getEmailVerified() == null) {
            student.setEmailVerified(false);
        }

        // Generate verification token
        userService.generateEmailVerificationToken(student);

        // Save student
        Student savedStudent;
        try {
            savedStudent = studentRepository.save(student);
        } catch (DataIntegrityViolationException e) {
            String detailedMessage = resolveUniqueConstraintMessage(e, student);
            throw new RuntimeException(detailedMessage, e);
        }

        // Log registration details
        logger.info("Student registered - Email: {}, StudentId: {}, Class: {}", 
            student.getEmail(), student.getStudentId(), student.getCurrentClass());

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

        // Update academic info
        if (studentDetails.getCurrentClass() != null) {
            student.setCurrentClass(studentDetails.getCurrentClass());
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
        results.put("message", "Results module not yet implemented");
        results.put("results", List.of()); // Placeholder for actual results
        
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
