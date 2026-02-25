package com.academix.server.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
        // return ResponseEntity.ok(courseService.getCoursesByType(Course.CourseType.SCIENCE));
        // Commented out due to missing SCIENCE enum or method
        return ResponseEntity.status(501).body(null); // Not Implemented
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
     * Enroll student in a course
     * POST /api/courses/{id}/enroll/{studentId}
     */
    @PostMapping("/{id}/enroll/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('REGISTRAR')")
    public ResponseEntity<?> enrollStudent(@PathVariable Long id, @PathVariable Long studentId) {
        // try {
        //     courseService.enrollStudent(id, studentId);
        //     return ResponseEntity.ok(Map.of("message", "Student enrolled successfully"));
        // } catch (RuntimeException e) {
        //     return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        // }
        // Commented out due to missing enrollStudent method
        return ResponseEntity.status(501).body(Map.of("error", "Not Implemented"));
    }

    /**
     * Remove student from a course
     * DELETE /api/courses/{id}/enroll/{studentId}
     */
    @DeleteMapping("/{id}/enroll/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('REGISTRAR')")
    public ResponseEntity<?> removeStudent(@PathVariable Long id, @PathVariable Long studentId) {
        // try {
        //     courseService.removeStudent(id, studentId);
        //     return ResponseEntity.ok(Map.of("message", "Student removed from course successfully"));
        // } catch (RuntimeException e) {
        //     return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        // }
        // Commented out due to missing removeStudent method
        return ResponseEntity.status(501).body(Map.of("error", "Not Implemented"));
    }

    /**
     * Get students enrolled in a course
     * GET /api/courses/{id}/students
     */
    @GetMapping("/{id}/students")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('TEACHER')")
    public ResponseEntity<?> getEnrolledStudents(@PathVariable Long id) {
        // try {
        //     return ResponseEntity.ok(courseService.getEnrolledStudents(id));
        // } catch (RuntimeException e) {
        //     return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        // }
        // Commented out due to missing getEnrolledStudents method
        return ResponseEntity.status(501).body(Map.of("error", "Not Implemented"));
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
