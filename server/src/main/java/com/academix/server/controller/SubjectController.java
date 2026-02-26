package com.academix.server.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.academix.server.model.Subject;
import com.academix.server.service.SubjectService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = "*")
public class SubjectController {

    @Autowired
    private SubjectService subjectService;

    /**
     * Create a new subject
     * POST /api/subjects
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> createSubject(@Valid @RequestBody Subject subject) {
        try {
            Subject created = subjectService.createSubject(subject);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all subjects
     * GET /api/subjects
     */
    @GetMapping
    public ResponseEntity<List<Subject>> getAllSubjects() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    /**
     * Get subject by ID
     * GET /api/subjects/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getSubjectById(@PathVariable Long id) {
        return subjectService.getSubjectById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get subject by code
     * GET /api/subjects/code/{code}
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<?> getSubjectByCode(@PathVariable String code) {
        return subjectService.getSubjectByCode(code)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update a subject
     * PUT /api/subjects/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> updateSubject(@PathVariable Long id, @Valid @RequestBody Subject subject) {
        try {
            Subject updated = subjectService.updateSubject(id, subject);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a subject
     * DELETE /api/subjects/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
        try {
            subjectService.deleteSubject(id);
            return ResponseEntity.ok(Map.of("message", "Subject deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get subjects by category
     * GET /api/subjects/category/{category}
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<?> getSubjectsByCategory(@PathVariable String category) {
        try {
            Subject.SubjectCategory cat = Subject.SubjectCategory.valueOf(category.toUpperCase());
            return ResponseEntity.ok(subjectService.getSubjectsByCategory(cat));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid category: " + category));
        }
    }

    /**
     * Get subjects by level
     * GET /api/subjects/level/{level}
     */
    @GetMapping("/level/{level}")
    public ResponseEntity<?> getSubjectsByLevel(@PathVariable String level) {
        try {
            Subject.SubjectLevel lvl = Subject.SubjectLevel.valueOf(level.toUpperCase());
            return ResponseEntity.ok(subjectService.getSubjectsByLevel(lvl));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid level: " + level));
        }
    }

    /**
     * Get O-Level subjects
     * GET /api/subjects/o-level
     */
    @GetMapping("/o-level")
    public ResponseEntity<List<Subject>> getOLevelSubjects() {
        return ResponseEntity.ok(subjectService.getOLevelSubjects());
    }

    /**
     * Get A-Level subjects
     * GET /api/subjects/a-level
     */
    @GetMapping("/a-level")
    public ResponseEntity<List<Subject>> getALevelSubjects() {
        return ResponseEntity.ok(subjectService.getALevelSubjects());
    }

    /**
     * Get compulsory subjects
     * GET /api/subjects/compulsory
     */
    @GetMapping("/compulsory")
    public ResponseEntity<List<Subject>> getCompulsorySubjects() {
        return ResponseEntity.ok(subjectService.getCompulsorySubjects());
    }

    /**
     * Get active subjects
     * GET /api/subjects/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<Subject>> getActiveSubjects() {
        return ResponseEntity.ok(subjectService.getActiveSubjects());
    }

    /**
     * Search subjects
     * GET /api/subjects/search?q={searchTerm}
     */
    @GetMapping("/search")
    public ResponseEntity<List<Subject>> searchSubjects(@RequestParam("q") String searchTerm) {
        return ResponseEntity.ok(subjectService.searchSubjects(searchTerm));
    }

    /**
     * Get subject statistics
     * GET /api/subjects/statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('TEACHER')")
    public ResponseEntity<Map<String, Object>> getSubjectStatistics() {
        return ResponseEntity.ok(subjectService.getSubjectStatistics());
    }

    /**
     * Initialize default Ugandan subjects
     * POST /api/subjects/initialize
     */
    @PostMapping("/initialize")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> initializeDefaultSubjects() {
        try {
            subjectService.initializeDefaultSubjects();
            return ResponseEntity.ok(Map.of("message", "Default subjects initialized successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
