package com.academix.server.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.academix.server.model.SchoolClass;
import com.academix.server.service.SchoolClassService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = "*")
public class SchoolClassController {

    @Autowired
    private SchoolClassService schoolClassService;

    /**
     * Create a new class
     * POST /api/classes
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> createClass(@Valid @RequestBody SchoolClass schoolClass) {
        try {
            SchoolClass created = schoolClassService.createClass(schoolClass);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all classes
     * GET /api/classes
     */
    @GetMapping
    public ResponseEntity<List<SchoolClass>> getAllClasses() {
        return ResponseEntity.ok(schoolClassService.getAllClasses());
    }

    /**
     * Get class by ID
     * GET /api/classes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getClassById(@PathVariable Long id) {
        return schoolClassService.getClassById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get class by name
     * GET /api/classes/name/{name}
     */
    @GetMapping("/name/{name}")
    public ResponseEntity<?> getClassByName(@PathVariable String name) {
        return schoolClassService.getClassByName(name)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get classes by academic year
     * GET /api/classes/year/{academicYear}
     */
    @GetMapping("/year/{academicYear}")
    public ResponseEntity<List<SchoolClass>> getClassesByAcademicYear(@PathVariable String academicYear) {
        return ResponseEntity.ok(schoolClassService.getClassesByAcademicYear(academicYear));
    }

    /**
     * Get O-Level classes
     * GET /api/classes/o-level?academicYear={year}
     */
    @GetMapping("/o-level")
    public ResponseEntity<List<SchoolClass>> getOLevelClasses(@RequestParam String academicYear) {
        return ResponseEntity.ok(schoolClassService.getOLevelClasses(academicYear));
    }

    /**
     * Get A-Level classes
     * GET /api/classes/a-level?academicYear={year}
     */
    @GetMapping("/a-level")
    public ResponseEntity<List<SchoolClass>> getALevelClasses(@RequestParam String academicYear) {
        return ResponseEntity.ok(schoolClassService.getALevelClasses(academicYear));
    }

    /**
     * Get classes by form level
     * GET /api/classes/form/{formLevel}?academicYear={year}
     */
    @GetMapping("/form/{formLevel}")
    public ResponseEntity<List<SchoolClass>> getClassesByFormLevel(
            @PathVariable Integer formLevel,
            @RequestParam String academicYear) {
        return ResponseEntity.ok(schoolClassService.getClassesByFormLevel(formLevel, academicYear));
    }

    /**
     * Update a class
     * PUT /api/classes/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> updateClass(@PathVariable Long id, @Valid @RequestBody SchoolClass schoolClass) {
        try {
            SchoolClass updated = schoolClassService.updateClass(id, schoolClass);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Assign class teacher
     * POST /api/classes/{classId}/teacher/{teacherId}
     */
    @PostMapping("/{classId}/teacher/{teacherId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> assignClassTeacher(
            @PathVariable Long classId,
            @PathVariable Long teacherId) {
        try {
            SchoolClass updated = schoolClassService.assignClassTeacher(classId, teacherId);
            return ResponseEntity.ok(Map.of(
                "message", "Class teacher assigned successfully",
                "class", updated
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Assign course to class (A-Level)
     * POST /api/classes/{classId}/course/{courseId}
     */
    @PostMapping("/{classId}/course/{courseId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> assignCourse(
            @PathVariable Long classId,
            @PathVariable Long courseId) {
        try {
            SchoolClass updated = schoolClassService.assignCourse(classId, courseId);
            return ResponseEntity.ok(Map.of(
                "message", "Course assigned to class successfully",
                "class", updated
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a class
     * DELETE /api/classes/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> deleteClass(@PathVariable Long id) {
        try {
            schoolClassService.deleteClass(id);
            return ResponseEntity.ok(Map.of("message", "Class deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Search classes
     * GET /api/classes/search?q={searchTerm}
     */
    @GetMapping("/search")
    public ResponseEntity<List<SchoolClass>> searchClasses(@RequestParam("q") String searchTerm) {
        return ResponseEntity.ok(schoolClassService.searchClasses(searchTerm));
    }

    /**
     * Get enrollment summary
     * GET /api/classes/enrollment-summary?academicYear={year}
     */
    @GetMapping("/enrollment-summary")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<List<Map<String, Object>>> getEnrollmentSummary(@RequestParam String academicYear) {
        return ResponseEntity.ok(schoolClassService.getEnrollmentSummary(academicYear));
    }

    /**
     * Initialize default classes
     * POST /api/classes/initialize?academicYear={year}
     */
    @PostMapping("/initialize")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> initializeDefaultClasses(@RequestParam String academicYear) {
        try {
            schoolClassService.initializeDefaultClasses(academicYear);
            return ResponseEntity.ok(Map.of("message", "Default classes initialized successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get class statistics
     * GET /api/classes/statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<Map<String, Object>> getClassStatistics() {
        return ResponseEntity.ok(schoolClassService.getClassStatistics());
    }
}
