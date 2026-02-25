package com.academix.server.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.academix.server.model.Course;
import com.academix.server.service.CourseService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired
    private CourseService courseService;

    /**
     * Create a new course
     * POST /api/courses
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> createCourse(@Valid @RequestBody Course course) {
        try {
            Course created = courseService.createCourse(course);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all courses
     * GET /api/courses
     */
    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    /**
     * Get course by ID
     * GET /api/courses/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable Long id) {
        return courseService.getCourseById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get course by code
     * GET /api/courses/code/{code}
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<?> getCourseByCode(@PathVariable String code) {
        return courseService.getCourseByCode(code)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update a course
     * PUT /api/courses/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @Valid @RequestBody Course course) {
        try {
            Course updated = courseService.updateCourse(id, course);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a course
     * DELETE /api/courses/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok(Map.of("message", "Course deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get courses by type
     * GET /api/courses/type/{type}
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<?> getCoursesByType(@PathVariable String type) {
        try {
            Course.CourseType courseType = Course.CourseType.valueOf(type.toUpperCase());
            return ResponseEntity.ok(courseService.getCoursesByType(courseType));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid course type: " + type));
        }
    }

    /**
     * Get available (active) courses
     * GET /api/courses/available
     */
    @GetMapping("/available")
    public ResponseEntity<List<Course>> getAvailableCourses() {
        return ResponseEntity.ok(courseService.getAvailableCourses());
    }

    /**
     * Get science combinations
     * GET /api/courses/science
     */
    @GetMapping("/science")
    public ResponseEntity<List<Course>> getScienceCourses() {
        return ResponseEntity.ok(courseService.getCoursesByType(Course.CourseType.SCIENCES));
    }

    /**
     * Get arts combinations
     * GET /api/courses/arts
     */
    @GetMapping("/arts")
    public ResponseEntity<List<Course>> getArtsCourses() {
        return ResponseEntity.ok(courseService.getCoursesByType(Course.CourseType.ARTS));
    }

    /**
     * Search courses
     * GET /api/courses/search?q={searchTerm}
     */
    @GetMapping("/search")
    public ResponseEntity<List<Course>> searchCourses(@RequestParam("q") String searchTerm) {
        return ResponseEntity.ok(courseService.searchCourses(searchTerm));
    }

    /**
     * Enroll student in a course (increment enrollment count)
     * POST /api/courses/{id}/enroll
     */
    @PostMapping("/{id}/enroll")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('REGISTRAR')")
    public ResponseEntity<?> enrollStudent(@PathVariable Long id) {
        try {
            Course course = courseService.enrollStudent(id);
            return ResponseEntity.ok(Map.of("message", "Enrollment incremented successfully", "currentEnrollment", course.getCurrentEnrollment()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Withdraw student from a course (decrement enrollment count)
     * DELETE /api/courses/{id}/withdraw
     */
    @DeleteMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('REGISTRAR')")
    public ResponseEntity<?> withdrawStudent(@PathVariable Long id) {
        try {
            Course course = courseService.withdrawStudent(id);
            return ResponseEntity.ok(Map.of("message", "Withdrawal successful", "currentEnrollment", course.getCurrentEnrollment()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get course statistics
     * GET /api/courses/statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<Map<String, Object>> getCourseStatistics() {
        return ResponseEntity.ok(courseService.getCourseStatistics());
    }

    /**
     * Initialize default Ugandan A-Level courses
     * POST /api/courses/initialize
     */
    @PostMapping("/initialize")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> initializeDefaultCourses() {
        try {
            courseService.initializeDefaultCourses();
            return ResponseEntity.ok(Map.of("message", "Default courses initialized successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
