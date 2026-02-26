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

import com.academix.server.model.Teacher;
import com.academix.server.service.TeacherService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = "*")
public class TeacherController {

    private static final Logger logger = LoggerFactory.getLogger(TeacherController.class);

    @Autowired
    private TeacherService teacherService;

    // ==================== CRUD ENDPOINTS ====================

    /**
     * POST /api/teachers - Create a new teacher
     */
    @PostMapping
    public ResponseEntity<?> createTeacher(@Valid @RequestBody Teacher teacher) {
        try {
            Teacher createdTeacher = teacherService.createTeacher(teacher);
            Map<String, Object> response = createSuccessResponse(
                "Teacher created successfully! Login credentials have been sent to email.",
                createdTeacher
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Failed to create teacher: {}", e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/teachers - Get all teachers
     */
    @GetMapping
    public ResponseEntity<?> getAllTeachers(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        try {
            List<Teacher> teachers = activeOnly
                ? teacherService.getActiveTeachers()
                : teacherService.getAllTeachers();

            Map<String, Object> response = new HashMap<>();
            response.put("totalTeachers", teachers.size());
            response.put("teachers", teachers.stream().map(this::createTeacherSummary).toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to get teachers: {}", e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/teachers/{id} - Get teacher by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTeacherById(@PathVariable Long id) {
        try {
            return teacherService.getTeacherById(id)
                .map(teacher -> ResponseEntity.ok(createTeacherDetail(teacher)))
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Failed to get teacher {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * PUT /api/teachers/{id} - Update teacher
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTeacher(@PathVariable Long id, @RequestBody Teacher teacherDetails) {
        try {
            Teacher updatedTeacher = teacherService.updateTeacher(id, teacherDetails);
            Map<String, Object> response = createSuccessResponse("Teacher updated successfully!", updatedTeacher);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Failed to update teacher {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * DELETE /api/teachers/{id} - Delete teacher (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTeacher(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "false") boolean permanent) {
        try {
            if (permanent) {
                teacherService.hardDeleteTeacher(id);
            } else {
                teacherService.deleteTeacher(id);
            }
            Map<String, Object> response = new HashMap<>();
            response.put("message", permanent ? "Teacher permanently deleted" : "Teacher deactivated successfully");
            response.put("id", id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Failed to delete teacher {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    // ==================== TEACHER-SPECIFIC ENDPOINTS ====================

    /**
     * GET /api/teachers/{id}/subjects - Get teacher's subjects
     */
    @GetMapping("/{id}/subjects")
    public ResponseEntity<?> getTeacherSubjects(@PathVariable Long id) {
        try {
            Map<String, Object> subjects = teacherService.getTeacherSubjects(id);
            return ResponseEntity.ok(subjects);
        } catch (RuntimeException e) {
            logger.error("Failed to get subjects for teacher {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/teachers/{id}/classes - Get teacher's classes
     */
    @GetMapping("/{id}/classes")
    public ResponseEntity<?> getTeacherClasses(@PathVariable Long id) {
        try {
            Map<String, Object> classes = teacherService.getTeacherClasses(id);
            return ResponseEntity.ok(classes);
        } catch (RuntimeException e) {
            logger.error("Failed to get classes for teacher {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * POST /api/teachers/{id}/upload-marks - Upload marks
     */
    @PostMapping("/{id}/upload-marks")
    public ResponseEntity<?> uploadMarks(@PathVariable Long id, @RequestBody Map<String, Object> marksData) {
        try {
            Map<String, Object> result = teacherService.uploadMarks(id, marksData);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            logger.error("Failed to upload marks for teacher {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/teachers/{id}/attendance - Get teacher attendance
     */
    @GetMapping("/{id}/attendance")
    public ResponseEntity<?> getTeacherAttendance(@PathVariable Long id) {
        try {
            Map<String, Object> attendance = teacherService.getTeacherAttendance(id);
            return ResponseEntity.ok(attendance);
        } catch (RuntimeException e) {
            logger.error("Failed to get attendance for teacher {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/teachers/{id}/reports - Get teacher reports
     */
    @GetMapping("/{id}/reports")
    public ResponseEntity<?> getTeacherReports(@PathVariable Long id) {
        try {
            Map<String, Object> reports = teacherService.getTeacherReports(id);
            return ResponseEntity.ok(reports);
        } catch (RuntimeException e) {
            logger.error("Failed to get reports for teacher {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    // ==================== SEARCH & FILTER ENDPOINTS ====================

    /**
     * GET /api/teachers/search - Search teachers
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchTeachers(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) String employmentStatus,
            @RequestParam(required = false) Boolean isClassTeacher,
            @RequestParam(required = false) Boolean isActive) {
        try {
            List<Teacher> teachers;

            if (q != null && !q.trim().isEmpty()) {
                teachers = teacherService.searchTeachers(q.trim());
            } else {
                Teacher.EmploymentType empType = null;
                Teacher.EmploymentStatus empStatus = null;

                if (employmentType != null) {
                    try {
                        empType = Teacher.EmploymentType.valueOf(employmentType.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest().body(
                            createErrorResponse("Invalid employmentType. Must be PERMANENT, CONTRACT, PART_TIME, INTERN, or VOLUNTEER")
                        );
                    }
                }
                if (employmentStatus != null) {
                    try {
                        empStatus = Teacher.EmploymentStatus.valueOf(employmentStatus.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest().body(
                            createErrorResponse("Invalid employmentStatus. Must be ACTIVE, ON_LEAVE, SUSPENDED, TERMINATED, RETIRED, or RESIGNED")
                        );
                    }
                }
                teachers = teacherService.searchWithFilters(department, empType, empStatus, isClassTeacher, isActive);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("totalResults", teachers.size());
            response.put("teachers", teachers.stream().map(this::createTeacherSummary).toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Search failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/teachers/department/{department} - Get teachers by department
     */
    @GetMapping("/department/{department}")
    public ResponseEntity<?> getTeachersByDepartment(@PathVariable String department) {
        try {
            List<Teacher> teachers = teacherService.getTeachersByDepartment(department);
            Map<String, Object> response = new HashMap<>();
            response.put("department", department);
            response.put("totalTeachers", teachers.size());
            response.put("teachers", teachers.stream().map(this::createTeacherSummary).toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to get teachers by department {}: {}", department, e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/teachers/subject/{subject} - Get teachers by subject
     */
    @GetMapping("/subject/{subject}")
    public ResponseEntity<?> getTeachersBySubject(@PathVariable String subject) {
        try {
            List<Teacher> teachers = teacherService.getTeachersBySubject(subject);
            Map<String, Object> response = new HashMap<>();
            response.put("subject", subject);
            response.put("totalTeachers", teachers.size());
            response.put("teachers", teachers.stream().map(this::createTeacherSummary).toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to get teachers by subject {}: {}", subject, e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    // ==================== ASSIGNMENT ENDPOINTS ====================

    /**
     * POST /api/teachers/{id}/subjects - Assign subject to teacher
     */
    @PostMapping("/{id}/subjects")
    public ResponseEntity<?> assignSubject(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String subject = body.get("subject");
            if (subject == null || subject.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Subject is required"));
            }
            Teacher teacher = teacherService.assignSubject(id, subject.trim());
            return ResponseEntity.ok(createSuccessResponse("Subject assigned successfully!", teacher));
        } catch (RuntimeException e) {
            logger.error("Failed to assign subject to teacher {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * DELETE /api/teachers/{id}/subjects/{subject} - Remove subject from teacher
     */
    @DeleteMapping("/{id}/subjects/{subject}")
    public ResponseEntity<?> removeSubject(@PathVariable Long id, @PathVariable String subject) {
        try {
            Teacher teacher = teacherService.removeSubject(id, subject);
            return ResponseEntity.ok(createSuccessResponse("Subject removed successfully!", teacher));
        } catch (RuntimeException e) {
            logger.error("Failed to remove subject from teacher {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * POST /api/teachers/{id}/classes - Assign class to teacher
     */
    @PostMapping("/{id}/classes")
    public ResponseEntity<?> assignClass(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String className = body.get("className");
            if (className == null || className.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Class name is required"));
            }
            Teacher teacher = teacherService.assignClass(id, className.trim());
            return ResponseEntity.ok(createSuccessResponse("Class assigned successfully!", teacher));
        } catch (RuntimeException e) {
            logger.error("Failed to assign class to teacher {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * DELETE /api/teachers/{id}/classes/{className} - Remove class from teacher
     */
    @DeleteMapping("/{id}/classes/{className}")
    public ResponseEntity<?> removeClass(@PathVariable Long id, @PathVariable String className) {
        try {
            Teacher teacher = teacherService.removeClass(id, className);
            return ResponseEntity.ok(createSuccessResponse("Class removed successfully!", teacher));
        } catch (RuntimeException e) {
            logger.error("Failed to remove class from teacher {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    // ==================== STATISTICS ENDPOINT ====================

    /**
     * GET /api/teachers/statistics - Get teacher statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getTeacherStatistics() {
        try {
            Map<String, Object> stats = teacherService.getTeacherStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Failed to get statistics: {}", e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    // ==================== HELPER METHODS ====================

    private Map<String, Object> createSuccessResponse(String message, Teacher teacher) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("teacher", createTeacherDetail(teacher));
        return response;
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", true);
        response.put("message", message);
        response.put("timestamp", LocalDateTime.now());
        return response;
    }

    private Map<String, Object> createTeacherSummary(Teacher teacher) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("id", teacher.getId());
        summary.put("teacherId", teacher.getTeacherId());
        summary.put("email", teacher.getEmail());
        summary.put("fullName", teacher.getFullName());
        summary.put("department", teacher.getDepartment());
        summary.put("primarySubject", teacher.getPrimarySubject());
        summary.put("employmentType", teacher.getEmploymentType());
        summary.put("employmentStatus", teacher.getEmploymentStatus());
        summary.put("isClassTeacher", teacher.getIsClassTeacher());
        summary.put("classResponsibility", teacher.getClassResponsibility());
        summary.put("isActive", teacher.getIsActive());
        return summary;
    }

    private Map<String, Object> createTeacherDetail(Teacher teacher) {
        Map<String, Object> detail = createTeacherSummary(teacher);
        detail.put("firstName", teacher.getFirstName());
        detail.put("lastName", teacher.getLastName());
        detail.put("otherNames", teacher.getOtherNames());
        detail.put("gender", teacher.getGender());
        detail.put("dateOfBirth", teacher.getDateOfBirth());
        detail.put("phoneNumber", teacher.getPhoneNumber());
        detail.put("registrationNumber", teacher.getRegistrationNumber());
        detail.put("dateJoined", teacher.getDateJoined());
        detail.put("contractEndDate", teacher.getContractEndDate());
        detail.put("qualifications", teacher.getQualifications());
        detail.put("specialization", teacher.getSpecialization());
        detail.put("yearsOfExperience", teacher.getYearsOfExperience());
        detail.put("subjects", teacher.getSubjects());
        detail.put("assignedClasses", teacher.getAssignedClasses());
        detail.put("isDepartmentHead", teacher.getIsDepartmentHead());
        detail.put("district", teacher.getDistrict());
        detail.put("county", teacher.getCounty());
        detail.put("subCounty", teacher.getSubCounty());
        detail.put("parish", teacher.getParish());
        detail.put("village", teacher.getVillage());
        detail.put("fullAddress", teacher.getFullAddress());
        detail.put("bankName", teacher.getBankName());
        detail.put("salaryGrade", teacher.getSalaryGrade());
        detail.put("emergencyContactName", teacher.getEmergencyContactName());
        detail.put("emergencyContactPhone", teacher.getEmergencyContactPhone());
        detail.put("emergencyContactRelationship", teacher.getEmergencyContactRelationship());
        detail.put("emailVerified", teacher.getEmailVerified());
        detail.put("createdAt", teacher.getCreatedAt());
        detail.put("updatedAt", teacher.getUpdatedAt());
        return detail;
    }
}
