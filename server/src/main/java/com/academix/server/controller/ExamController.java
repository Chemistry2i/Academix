package com.academix.server.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.academix.server.model.Exam;
import com.academix.server.service.ExamService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*")
public class ExamController {

    @Autowired
    private ExamService examService;

    /**
     * Create a new exam
     * POST /api/exams
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<?> createExam(@Valid @RequestBody Exam exam) {
        try {
            Exam created = examService.createExam(exam);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all exams
     * GET /api/exams
     */
    @GetMapping
    public ResponseEntity<List<Exam>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    /**
     * Get exam by ID
     * GET /api/exams/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getExamById(@PathVariable Long id) {
        return examService.getExamById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update an exam
     * PUT /api/exams/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<?> updateExam(@PathVariable Long id, @Valid @RequestBody Exam exam) {
        try {
            Exam updated = examService.updateExam(id, exam);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete an exam
     * DELETE /api/exams/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> deleteExam(@PathVariable Long id) {
        try {
            examService.deleteExam(id);
            return ResponseEntity.ok(Map.of("message", "Exam deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Lock an exam (prevent marks entry)
     * POST /api/exams/{id}/lock
     */
    @PostMapping("/{id}/lock")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<?> lockExam(@PathVariable Long id) {
        try {
            Exam locked = examService.lockExam(id);
            return ResponseEntity.ok(Map.of(
                "message", "Exam locked successfully",
                "exam", locked
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Unlock an exam (allow marks entry)
     * POST /api/exams/{id}/unlock
     */
    @PostMapping("/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> unlockExam(@PathVariable Long id) {
        try {
            Exam unlocked = examService.unlockExam(id);
            return ResponseEntity.ok(Map.of(
                "message", "Exam unlocked successfully",
                "exam", unlocked
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Publish exam results
     * POST /api/exams/{id}/publish
     */
    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> publishExam(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // TODO: Get actual user ID from userDetails
            Long publishedBy = 1L; // Placeholder
            Exam published = examService.publishExam(id, publishedBy);
            return ResponseEntity.ok(Map.of(
                "message", "Exam results published successfully",
                "exam", published
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get student transcript
     * GET /api/exams/student/{id}/transcript
     */
    @GetMapping("/student/{id}/transcript")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('TEACHER') or hasRole('STUDENT')")
    public ResponseEntity<?> getStudentTranscript(@PathVariable Long id) {
        try {
            Map<String, Object> transcript = examService.getStudentTranscript(id);
            return ResponseEntity.ok(transcript);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get exam analytics
     * GET /api/exams/analytics
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('DIRECTOR_OF_STUDIES') or hasRole('TEACHER')")
    public ResponseEntity<Map<String, Object>> getOverallAnalytics() {
        return ResponseEntity.ok(examService.getOverallAnalytics());
    }

    /**
     * Get analytics for a specific exam
     * GET /api/exams/{id}/analytics
     */
    @GetMapping("/{id}/analytics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('DIRECTOR_OF_STUDIES') or hasRole('TEACHER')")
    public ResponseEntity<?> getExamAnalytics(@PathVariable Long id) {
        try {
            Map<String, Object> analytics = examService.getExamAnalytics(id);
            return ResponseEntity.ok(analytics);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get exams by academic year
     * GET /api/exams/year/{academicYear}
     */
    @GetMapping("/year/{academicYear}")
    public ResponseEntity<List<Exam>> getExamsByAcademicYear(@PathVariable String academicYear) {
        return ResponseEntity.ok(examService.getExamsByAcademicYear(academicYear));
    }

    /**
     * Get exams by academic year and term
     * GET /api/exams/year/{academicYear}/term/{term}
     */
    @GetMapping("/year/{academicYear}/term/{term}")
    public ResponseEntity<List<Exam>> getExamsByAcademicYearAndTerm(
            @PathVariable String academicYear, @PathVariable Integer term) {
        return ResponseEntity.ok(examService.getExamsByAcademicYearAndTerm(academicYear, term));
    }

    /**
     * Get exams by type
     * GET /api/exams/type/{type}
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<?> getExamsByType(@PathVariable String type) {
        try {
            Exam.ExamType examType = Exam.ExamType.valueOf(type.toUpperCase());
            return ResponseEntity.ok(examService.getExamsByType(examType));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid exam type: " + type));
        }
    }

    /**
     * Get exams by status
     * GET /api/exams/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getExamsByStatus(@PathVariable String status) {
        try {
            Exam.ExamStatus examStatus = Exam.ExamStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(examService.getExamsByStatus(examStatus));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid exam status: " + status));
        }
    }

    /**
     * Get upcoming exams
     * GET /api/exams/upcoming
     */
    @GetMapping("/upcoming")
    public ResponseEntity<List<Exam>> getUpcomingExams() {
        return ResponseEntity.ok(examService.getUpcomingExams());
    }

    /**
     * Get ongoing exams
     * GET /api/exams/ongoing
     */
    @GetMapping("/ongoing")
    public ResponseEntity<List<Exam>> getOngoingExams() {
        return ResponseEntity.ok(examService.getOngoingExams());
    }

    /**
     * Get exams for a class
     * GET /api/exams/class/{className}
     */
    @GetMapping("/class/{className}")
    public ResponseEntity<List<Exam>> getExamsForClass(@PathVariable String className) {
        return ResponseEntity.ok(examService.getExamsForClass(className));
    }

    /**
     * Search exams
     * GET /api/exams/search?q={searchTerm}
     */
    @GetMapping("/search")
    public ResponseEntity<List<Exam>> searchExams(@RequestParam("q") String searchTerm) {
        return ResponseEntity.ok(examService.searchExams(searchTerm));
    }

    /**
     * Get exam statistics
     * GET /api/exams/statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<Map<String, Object>> getExamStatistics() {
        return ResponseEntity.ok(examService.getExamStatistics());
    }
}
