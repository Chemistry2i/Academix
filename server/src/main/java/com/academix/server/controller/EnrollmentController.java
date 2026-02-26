package com.academix.server.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.academix.server.model.Student;
import com.academix.server.model.Subject;
import com.academix.server.model.Teacher;
import com.academix.server.service.EnrollmentService;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "*")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    // ============ STUDENT-SUBJECT ENROLLMENT ============

    /**
     * Enroll a student in a subject
     * POST /api/enrollments/student/{studentId}/subject/{subjectId}
     */
    @PostMapping("/student/{studentId}/subject/{subjectId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('REGISTRAR') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> enrollStudentInSubject(
            @PathVariable Long studentId,
            @PathVariable Long subjectId,
            @RequestParam(required = false) Boolean isPrincipal,
            @RequestParam(required = false) Boolean isSubsidiary,
            @RequestParam String academicYear,
            @RequestParam Integer term) {
        try {
            var enrollment = enrollmentService.enrollStudentInSubject(
                studentId, subjectId, isPrincipal, isSubsidiary, academicYear, term);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Student enrolled in subject successfully",
                "enrollment", enrollment
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Bulk enroll a student in multiple subjects
     * POST /api/enrollments/student/{studentId}/subjects/bulk
     */
    @PostMapping("/student/{studentId}/subjects/bulk")
    @PreAuthorize("hasRole('ADMIN') or hasRole('REGISTRAR') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> enrollStudentInSubjectsBulk(
            @PathVariable Long studentId,
            @RequestBody List<Long> subjectIds,
            @RequestParam String academicYear,
            @RequestParam Integer term) {
        try {
            var enrollments = enrollmentService.enrollStudentInSubjects(
                studentId, subjectIds, academicYear, term);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Student enrolled in subjects successfully",
                "count", enrollments.size(),
                "enrollments", enrollments
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Drop a student from a subject
     * DELETE /api/enrollments/student/{studentId}/subject/{subjectId}
     */
    @DeleteMapping("/student/{studentId}/subject/{subjectId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('REGISTRAR') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> dropStudentFromSubject(
            @PathVariable Long studentId,
            @PathVariable Long subjectId,
            @RequestParam(required = false) String reason) {
        try {
            var enrollment = enrollmentService.dropStudentFromSubject(studentId, subjectId, reason);
            return ResponseEntity.ok(Map.of(
                "message", "Student dropped from subject successfully",
                "enrollment", enrollment
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get subjects for a student
     * GET /api/enrollments/student/{studentId}/subjects
     */
    @GetMapping("/student/{studentId}/subjects")
    public ResponseEntity<List<Subject>> getStudentSubjects(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getStudentSubjects(studentId));
    }

    /**
     * Get students enrolled in a subject
     * GET /api/enrollments/subject/{subjectId}/students
     */
    @GetMapping("/subject/{subjectId}/students")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<List<Student>> getStudentsInSubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(enrollmentService.getStudentsInSubject(subjectId));
    }

    // ============ STUDENT-COURSE ENROLLMENT ============

    /**
     * Enroll a student in a course (A-Level combination)
     * POST /api/enrollments/student/{studentId}/course/{courseId}
     */
    @PostMapping("/student/{studentId}/course/{courseId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('REGISTRAR') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> enrollStudentInCourse(
            @PathVariable Long studentId,
            @PathVariable Long courseId,
            @RequestParam String academicYear,
            @RequestParam(required = false) String classLevel) {
        try {
            var enrollment = enrollmentService.enrollStudentInCourse(
                studentId, courseId, academicYear, classLevel);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Student enrolled in course successfully",
                "enrollment", enrollment
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get course enrollment for a student
     * GET /api/enrollments/student/{studentId}/course
     */
    @GetMapping("/student/{studentId}/course")
    public ResponseEntity<?> getStudentCourse(@PathVariable Long studentId) {
        return enrollmentService.getStudentCourse(studentId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get students in a course
     * GET /api/enrollments/course/{courseId}/students
     */
    @GetMapping("/course/{courseId}/students")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<List<Student>> getStudentsInCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.getStudentsInCourse(courseId));
    }

    // ============ TEACHER-SUBJECT ASSIGNMENT ============

    /**
     * Assign a teacher to a subject
     * POST /api/enrollments/teacher/{teacherId}/subject/{subjectId}
     */
    @PostMapping("/teacher/{teacherId}/subject/{subjectId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> assignTeacherToSubject(
            @PathVariable Long teacherId,
            @PathVariable Long subjectId,
            @RequestParam(required = false) Boolean isPrimary,
            @RequestParam(required = false) String assignedClasses,
            @RequestParam String academicYear) {
        try {
            var assignment = enrollmentService.assignTeacherToSubject(
                teacherId, subjectId, isPrimary, assignedClasses, academicYear);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Teacher assigned to subject successfully",
                "assignment", assignment
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Remove a teacher from a subject
     * DELETE /api/enrollments/teacher/{teacherId}/subject/{subjectId}
     */
    @DeleteMapping("/teacher/{teacherId}/subject/{subjectId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> removeTeacherFromSubject(
            @PathVariable Long teacherId,
            @PathVariable Long subjectId) {
        try {
            enrollmentService.removeTeacherFromSubject(teacherId, subjectId);
            return ResponseEntity.ok(Map.of("message", "Teacher removed from subject successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get subjects taught by a teacher
     * GET /api/enrollments/teacher/{teacherId}/subjects
     */
    @GetMapping("/teacher/{teacherId}/subjects")
    public ResponseEntity<List<Subject>> getTeacherSubjects(@PathVariable Long teacherId) {
        return ResponseEntity.ok(enrollmentService.getTeacherSubjects(teacherId));
    }

    /**
     * Get teachers for a subject
     * GET /api/enrollments/subject/{subjectId}/teachers
     */
    @GetMapping("/subject/{subjectId}/teachers")
    public ResponseEntity<List<Teacher>> getSubjectTeachers(@PathVariable Long subjectId) {
        return ResponseEntity.ok(enrollmentService.getSubjectTeachers(subjectId));
    }

    // ============ STATISTICS ============

    /**
     * Get enrollment statistics
     * GET /api/enrollments/statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<Map<String, Object>> getEnrollmentStatistics() {
        return ResponseEntity.ok(enrollmentService.getEnrollmentStatistics());
    }

    /**
     * Get student enrollment summary
     * GET /api/enrollments/student/{studentId}/summary
     */
    @GetMapping("/student/{studentId}/summary")
    public ResponseEntity<Map<String, Object>> getStudentEnrollmentSummary(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getStudentEnrollmentSummary(studentId));
    }
}
