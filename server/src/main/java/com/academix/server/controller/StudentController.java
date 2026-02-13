package com.academix.server.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.academix.server.model.Student;
import com.academix.server.service.EmailService;
import com.academix.server.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private EmailService emailService;
    
    // In-memory storage for testing (replace with database in production)
    private Map<String, Student> studentStorage = new HashMap<>();
    private Long studentIdCounter = 1L;
    
    /**
     * Student Registration with enhanced academic information
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerStudent(@Valid @RequestBody Student student) {
        try {
            // Check if email already exists
            if (studentStorage.values().stream().anyMatch(s -> s.getEmail().equals(student.getEmail()))) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email already exists!"));
            }
            
            // Check if LINN already exists (if provided)
            if (student.getLinn() != null && !student.getLinn().trim().isEmpty() &&
                studentStorage.values().stream().anyMatch(s -> student.getLinn().equals(s.getLinn()))) {
                return ResponseEntity.badRequest().body(createErrorResponse("LINN already exists!"));
            }
            
            // Set system-generated ID
            student.setId(studentIdCounter++);
            
            // Generate student ID automatically (always generate, don't rely on client input)
            student.setStudentId(generateStudentId(student.getCurrentClass()));
            
            // Ensure uniqueness of generated student ID
            int attempts = 0;
            while (studentStorage.values().stream().anyMatch(s -> student.getStudentId().equals(s.getStudentId())) && attempts < 10) {
                student.setStudentId(generateStudentId(student.getCurrentClass()));
                attempts++;
            }
            
            // Generate secure password for the student
            String generatedPassword = emailService.generateSecurePassword(10);
            student.setPassword(generatedPassword);
            
            // Hash the password before saving
            userService.prepareUserForSaving(student);
            
            // Set default values
            if (student.getIsActive() == null) {
                student.setIsActive(true);
            }
            if (student.getIsDeleted() == null) {
                student.setIsDeleted(false);
            }
            
            // Generate email verification token
            String verificationToken = userService.generateEmailVerificationToken(student);
            
            // Store in memory for testing
            studentStorage.put(student.getEmail(), student);
            
            // Log credentials and verification token for development
            System.out.println("\n=== STUDENT REGISTRATION SUCCESS ===");
            System.out.println("Email: " + student.getEmail());
            System.out.println("Student ID: " + student.getStudentId());
            System.out.println("Generated Password: " + generatedPassword);
            System.out.println("Email Verification Token: " + verificationToken);
            System.out.println("Class: " + student.getCurrentClass());
            System.out.println("============================\n");
            
            // Send student registration email with credentials
            try {
                emailService.sendStudentRegistrationEmail(
                    student.getEmail(), 
                    student.getFullName(), 
                    student.getStudentId(),
                    student.getCurrentClass(),
                    student.getStream(),
                    generatedPassword
                );
            } catch (Exception emailError) {
                // Log email failure but don't break registration
                System.out.println("Email sending failed but registration successful: " + emailError.getMessage());
            }
            
            // Return success response with student info
            Map<String, Object> response = createSuccessResponse(
                "Student registered successfully! Login credentials have been sent to your email.",
                student
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                createErrorResponse("Registration failed: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get all registered students - FOR TESTING ONLY
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllStudents() {
        Map<String, Object> response = new HashMap<>();
        response.put("totalStudents", studentStorage.size());
        response.put("students", studentStorage.values().stream()
            .map(this::createStudentSummary)
            .toList());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get student by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable Long id) {
        Student student = studentStorage.values().stream()
            .filter(s -> s.getId().equals(id))
            .findFirst()
            .orElse(null);
            
        if (student == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(createStudentSummary(student));
    }
    
    /**
     * Search students by class
     */
    @GetMapping("/class/{className}")
    public ResponseEntity<?> getStudentsByClass(@PathVariable String className) {
        Map<String, Object> response = new HashMap<>();
        
        var studentsInClass = studentStorage.values().stream()
            .filter(s -> className.equalsIgnoreCase(s.getCurrentClass()))
            .map(this::createStudentSummary)
            .toList();
            
        response.put("className", className);
        response.put("totalStudents", studentsInClass.size());
        response.put("students", studentsInClass);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Update student academic information
     */
    @PutMapping("/{id}/academic")
    public ResponseEntity<?> updateAcademicInfo(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        try {
            Student student = studentStorage.values().stream()
                .filter(s -> s.getId().equals(id))
                .findFirst()
                .orElse(null);
                
            if (student == null) {
                return ResponseEntity.badRequest().body(createErrorResponse("Student not found!"));
            }
            
            // Update academic fields
            if (updates.containsKey("currentClass")) {
                student.setCurrentClass(updates.get("currentClass"));
            }
            if (updates.containsKey("stream")) {
                student.setStream(updates.get("stream"));
            }
            if (updates.containsKey("combination")) {
                student.setCombination(updates.get("combination"));
            }
            if (updates.containsKey("house")) {
                student.setHouse(updates.get("house"));
            }
            if (updates.containsKey("residenceStatus")) {
                try {
                    student.setResidenceStatus(Student.ResidenceStatus.valueOf(updates.get("residenceStatus")));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(
                        createErrorResponse("Invalid residence status. Must be DAY or BOARDING")
                    );
                }
            }
            
            Map<String, Object> response = createSuccessResponse(
                "Academic information updated successfully!",
                student
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                createErrorResponse("Update failed: " + e.getMessage())
            );
        }
    }
    
    // Helper Methods
    
    private String generateStudentId(String currentClass) {
        String year = String.valueOf(LocalDateTime.now().getYear());
        String classCode = "";
        
        if (currentClass != null) {
            if (currentClass.toLowerCase().contains("primary")) {
                classCode = "P";
                // Extract number from Primary X
                String classNum = currentClass.replaceAll("[^0-9]", "");
                if (!classNum.isEmpty()) {
                    classCode += classNum;
                }
            } else if (currentClass.toLowerCase().contains("senior")) {
                classCode = "S";
                // Extract number from Senior X
                String classNum = currentClass.replaceAll("[^0-9]", "");
                if (!classNum.isEmpty()) {
                    classCode += classNum;
                }
            } else {
                classCode = "STU";
            }
        } else {
            classCode = "STU";
        }
        
        // Generate sequential number based on current storage size + random component
        int sequentialNum = studentStorage.size() + 1;
        int randomNum = (int)(Math.random() * 100);
        
        return classCode + year + String.format("%02d%02d", sequentialNum, randomNum);
    }
    
    private Map<String, Object> createSuccessResponse(String message, Student student) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("userId", student.getId());
        response.put("email", student.getEmail());
        response.put("fullName", student.getFullName());
        response.put("studentId", student.getStudentId());
        response.put("linn", student.getLinn());
        response.put("currentClass", student.getCurrentClass());
        response.put("stream", student.getStream());
        response.put("residenceStatus", student.getResidenceStatus());
        response.put("house", student.getHouse());
        response.put("combination", student.getCombination());
        response.put("fullAddress", student.getFullAddress());
        response.put("passwordHashed", student.getPassword() != null && student.getPassword().startsWith("$2"));
        return response;
    }
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", true);
        response.put("message", message);
        response.put("timestamp", LocalDateTime.now());
        return response;
    }
    
    private Map<String, Object> createStudentSummary(Student student) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("id", student.getId());
        summary.put("studentId", student.getStudentId());
        summary.put("linn", student.getLinn());
        summary.put("email", student.getEmail());
        summary.put("fullName", student.getFullName());
        summary.put("currentClass", student.getCurrentClass());
        summary.put("stream", student.getStream());
        summary.put("residenceStatus", student.getResidenceStatus());
        summary.put("house", student.getHouse());
        summary.put("district", student.getDistrict());
        summary.put("isActive", student.getIsActive());
        return summary;
    }
}