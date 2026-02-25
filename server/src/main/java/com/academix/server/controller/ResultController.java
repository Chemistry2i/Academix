package com.academix.server.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.academix.server.model.Result;
import com.academix.server.service.ResultService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/results")
@CrossOrigin(origins = "*")
public class ResultController {

    @Autowired
    private ResultService resultService;

    /**
     * Create/Enter a result
     * POST /api/results
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<?> createResult(@Valid @RequestBody Result result) {
        try {
            Result created = resultService.createResult(result);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Bulk create/enter results
     * POST /api/results/bulk
     */
    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<?> createBulkResults(@Valid @RequestBody List<Result> results) {
        try {
            List<Result> created = resultService.createBulkResults(results);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Results entered successfully",
                "count", created.size(),
                "results", created
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all results
     * GET /api/results
     */
    @GetMapping
    public ResponseEntity<List<Result>> getAllResults() {
        return ResponseEntity.ok(resultService.getAllResults());
    }

    /**
     * Get result by ID
     * GET /api/results/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getResultById(@PathVariable Long id) {
        return resultService.getResultById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update a result
     * PUT /api/results/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<?> updateResult(@PathVariable Long id, @Valid @RequestBody Result result) {
        try {
            Result updated = resultService.updateResult(id, result);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a result
     * DELETE /api/results/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> deleteResult(@PathVariable Long id) {
        try {
            resultService.deleteResult(id);
            return ResponseEntity.ok(Map.of("message", "Result deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get results by student ID
     * GET /api/results/{student_id}
     * OR GET /api/results/student/{studentId}
     */
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('TEACHER') or hasRole('STUDENT') or hasRole('PARENT')")
    public ResponseEntity<List<Result>> getResultsByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(resultService.getResultsByStudentId(studentId));
    }

    /**
     * Get results by student and exam
     * GET /api/results/student/{studentId}/exam/{examId}
     */
    @GetMapping("/student/{studentId}/exam/{examId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('TEACHER') or hasRole('STUDENT') or hasRole('PARENT')")
    public ResponseEntity<List<Result>> getResultsByStudentAndExam(
            @PathVariable Long studentId, @PathVariable Long examId) {
        return ResponseEntity.ok(resultService.getResultsByStudentAndExam(studentId, examId));
    }

    /**
     * Get results by class
     * GET /api/results/class/{class_id}
     */
    @GetMapping("/class/{className}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<List<Result>> getResultsByClass(@PathVariable String className) {
        return ResponseEntity.ok(resultService.getResultsByClass(className));
    }

    /**
     * Get results by class and exam
     * GET /api/results/class/{className}/exam/{examId}
     */
    @GetMapping("/class/{className}/exam/{examId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<List<Result>> getResultsByClassAndExam(
            @PathVariable String className, @PathVariable Long examId) {
        return ResponseEntity.ok(resultService.getResultsByClassAndExam(className, examId));
    }

    /**
     * Get results by exam
     * GET /api/results/exam/{examId}
     */
    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<List<Result>> getResultsByExam(@PathVariable Long examId) {
        return ResponseEntity.ok(resultService.getResultsByExam(examId));
    }

    /**
     * Get student report card
     * GET /api/results/report-card/student/{studentId}/exam/{examId}
     */
    @GetMapping("/report-card/student/{studentId}/exam/{examId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('TEACHER') or hasRole('STUDENT') or hasRole('PARENT')")
    public ResponseEntity<?> getStudentReportCard(
            @PathVariable Long studentId, @PathVariable Long examId) {
        try {
            Map<String, Object> reportCard = resultService.getStudentReportCard(studentId, examId);
            return ResponseEntity.ok(reportCard);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get grade distribution
     * GET /api/results/distribution?examId={examId}&subjectCode={subjectCode}&className={className}
     */
    @GetMapping("/distribution")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<?> getGradeDistribution(
            @RequestParam Long examId,
            @RequestParam String subjectCode,
            @RequestParam String className) {
        try {
            Map<String, Object> distribution = resultService.getGradeDistribution(examId, subjectCode, className);
            return ResponseEntity.ok(distribution);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Calculate positions for a class
     * POST /api/results/calculate-positions
     */
    @PostMapping("/calculate-positions")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<?> calculatePositions(
            @RequestParam Long examId,
            @RequestParam String className) {
        try {
            resultService.calculatePositions(examId, className);
            return ResponseEntity.ok(Map.of(
                "message", "Positions calculated successfully",
                "examId", examId,
                "className", className
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
