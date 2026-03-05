package com.academix.server.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.academix.server.model.Student;
import com.academix.server.service.StudentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    private static final Logger logger = LoggerFactory.getLogger(StudentController.class);

    @Autowired
    private StudentService studentService;

    // ==================== CRUD ENDPOINTS ====================

    /**
     * POST /api/students - Create a new student
     */
    @PostMapping
    public ResponseEntity<?> createStudent(@Valid @RequestBody Student student) {
        try {
            Student createdStudent = studentService.createStudent(student);
            Map<String, Object> response = createSuccessResponse(
                "Student created successfully! Login credentials have been sent to email.",
                createdStudent
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Failed to create student: {}", e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/students - Get all students
     */
    @GetMapping
    public ResponseEntity<?> getAllStudents(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        try {
            List<Student> students = activeOnly 
                ? studentService.getActiveStudents() 
                : studentService.getAllStudents();
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalStudents", students.size());
            response.put("students", students.stream().map(this::createStudentSummary).toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to get students: {}", e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/students/{id} - Get student by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable Long id) {
        try {
            return studentService.getStudentById(id)
                .map(student -> ResponseEntity.ok(createStudentDetail(student)))
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Failed to get student {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * PUT /api/students/{id} - Update student
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody Student studentDetails) {
        try {
            Student updatedStudent = studentService.updateStudent(id, studentDetails);
            Map<String, Object> response = createSuccessResponse("Student updated successfully!", updatedStudent);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Failed to update student {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * DELETE /api/students/{id} - Delete student (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "false") boolean permanent) {
        try {
            if (permanent) {
                studentService.hardDeleteStudent(id);
            } else {
                studentService.deleteStudent(id);
            }
            Map<String, Object> response = new HashMap<>();
            response.put("message", permanent ? "Student permanently deleted" : "Student deactivated successfully");
            response.put("id", id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Failed to delete student {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    // ==================== SEARCH ENDPOINTS ====================

    /**
     * GET /api/students/search - Search students with various filters
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchStudents(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String currentClass,
            @RequestParam(required = false) String stream,
            @RequestParam(required = false) String house,
            @RequestParam(required = false) String residenceStatus,
            @RequestParam(required = false) Boolean isActive) {
        try {
            List<Student> students;
            
            // If simple search term provided, use text search
            if (q != null && !q.trim().isEmpty()) {
                students = studentService.searchStudents(q.trim());
            } else {
                // Use filter-based search
                Student.ResidenceStatus status = null;
                if (residenceStatus != null) {
                    try {
                        status = Student.ResidenceStatus.valueOf(residenceStatus.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest().body(
                            createErrorResponse("Invalid residenceStatus. Must be DAY or BOARDING")
                        );
                    }
                }
                students = studentService.searchWithFilters(currentClass, stream, house, status, isActive);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalResults", students.size());
            response.put("students", students.stream().map(this::createStudentSummary).toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Search failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    // ==================== STUDENT-SPECIFIC DATA ENDPOINTS ====================

    /**
     * GET /api/students/{id}/results - Get student academic results
     */
    @GetMapping("/{id}/results")
    public ResponseEntity<?> getStudentResults(@PathVariable Long id) {
        try {
            Map<String, Object> results = studentService.getStudentResults(id);
            return ResponseEntity.ok(results);
        } catch (RuntimeException e) {
            logger.error("Failed to get results for student {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/students/{id}/fees - Get student fee information
     */
    @GetMapping("/{id}/fees")
    public ResponseEntity<?> getStudentFees(@PathVariable Long id) {
        try {
            Map<String, Object> fees = studentService.getStudentFees(id);
            return ResponseEntity.ok(fees);
        } catch (RuntimeException e) {
            logger.error("Failed to get fees for student {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/students/{id}/attendance - Get student attendance records
     */
    @GetMapping("/{id}/attendance")
    public ResponseEntity<?> getStudentAttendance(@PathVariable Long id) {
        try {
            Map<String, Object> attendance = studentService.getStudentAttendance(id);
            return ResponseEntity.ok(attendance);
        } catch (RuntimeException e) {
            logger.error("Failed to get attendance for student {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    // ==================== ADDITIONAL USEFUL ENDPOINTS ====================

    /**
     * GET /api/students/class/{className} - Get students by class
     */
    @GetMapping("/class/{className}")
    public ResponseEntity<?> getStudentsByClass(@PathVariable String className) {
        try {
            List<Student> students = studentService.getStudentsByClass(className);
            Map<String, Object> response = new HashMap<>();
            response.put("className", className);
            response.put("totalStudents", students.size());
            response.put("students", students.stream().map(this::createStudentSummary).toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to get students by class {}: {}", className, e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/students/house/{house} - Get students by house
     */
    @GetMapping("/house/{house}")
    public ResponseEntity<?> getStudentsByHouse(@PathVariable String house) {
        try {
            List<Student> students = studentService.getStudentsByHouse(house);
            Map<String, Object> response = new HashMap<>();
            response.put("house", house);
            response.put("totalStudents", students.size());
            response.put("students", students.stream().map(this::createStudentSummary).toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to get students by house {}: {}", house, e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * PUT /api/students/{id}/activate - Activate a student
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateStudent(@PathVariable Long id) {
        try {
            Student student = studentService.activateStudent(id);
            return ResponseEntity.ok(createSuccessResponse("Student activated successfully!", student));
        } catch (RuntimeException e) {
            logger.error("Failed to activate student {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * PUT /api/students/{id}/deactivate - Deactivate a student
     */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateStudent(@PathVariable Long id) {
        try {
            Student student = studentService.deactivateStudent(id);
            return ResponseEntity.ok(createSuccessResponse("Student deactivated successfully!", student));
        } catch (RuntimeException e) {
            logger.error("Failed to deactivate student {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/students/statistics - Get student statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getStudentStatistics() {
        try {
            Map<String, Object> stats = studentService.getStudentStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Failed to get statistics: {}", e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    // ==================== LEGACY ENDPOINT (kept for compatibility) ====================

    /**
     * POST /api/students/register - Legacy registration endpoint
     * @deprecated Use POST /api/students instead
     */
    @Deprecated
    @PostMapping("/register")
    public ResponseEntity<?> registerStudent(@Valid @RequestBody Student student) {
        return createStudent(student);
    }

    // ==================== HELPER METHODS ====================

    private Map<String, Object> createSuccessResponse(String message, Student student) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("student", createStudentDetail(student));
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
        summary.put("isActive", student.getIsActive());
        return summary;
    }

    private Map<String, Object> createStudentDetail(Student student) {
        Map<String, Object> detail = createStudentSummary(student);
        detail.put("firstName", student.getFirstName());
        detail.put("lastName", student.getLastName());
        detail.put("otherNames", student.getOtherNames());
        detail.put("gender", student.getGender());
        detail.put("dateOfBirth", student.getDateOfBirth());
        detail.put("phoneNumber", student.getPhoneNumber());
        detail.put("combination", student.getCombination());
        detail.put("district", student.getDistrict());
        detail.put("county", student.getCounty());
        detail.put("subCounty", student.getSubCounty());
        detail.put("parish", student.getParish());
        detail.put("village", student.getVillage());
        detail.put("fullAddress", student.getFullAddress());
        detail.put("emailVerified", student.getEmailVerified());
        detail.put("createdAt", student.getCreatedAt());
        detail.put("updatedAt", student.getUpdatedAt());
        return detail;
    }
}