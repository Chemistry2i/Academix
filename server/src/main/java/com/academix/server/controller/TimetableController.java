package com.academix.server.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.academix.server.model.Timetable;
import com.academix.server.service.TimetableService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/timetable")
@CrossOrigin(origins = "*")
public class TimetableController {

    @Autowired
    private TimetableService timetableService;

    /**
     * Create a new timetable entry
     * POST /api/timetable
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<?> createTimetableEntry(@Valid @RequestBody Timetable timetable) {
        try {
            Timetable created = timetableService.createTimetableEntry(timetable);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Bulk create timetable entries
     * POST /api/timetable/bulk
     */
    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<?> createBulkTimetableEntries(@Valid @RequestBody List<Timetable> entries) {
        try {
            List<Timetable> created = timetableService.createBulkTimetableEntries(entries);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Timetable entries created successfully",
                "count", created.size(),
                "entries", created
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all timetable entries
     * GET /api/timetable
     */
    @GetMapping
    public ResponseEntity<List<Timetable>> getAllTimetableEntries() {
        return ResponseEntity.ok(timetableService.getAllTimetableEntries());
    }

    /**
     * Get timetable by ID
     * GET /api/timetable/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTimetableById(@PathVariable Long id) {
        return timetableService.getTimetableById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get timetable by class (class_id)
     * GET /api/timetable/class/{className}
     */
    @GetMapping("/class/{className}")
    public ResponseEntity<List<Timetable>> getTimetableByClass(@PathVariable String className) {
        return ResponseEntity.ok(timetableService.getTimetableByClass(className));
    }

    /**
     * Get timetable by class, academic year, and term
     * GET /api/timetable/class/{className}/year/{academicYear}/term/{term}
     */
    @GetMapping("/class/{className}/year/{academicYear}/term/{term}")
    public ResponseEntity<List<Timetable>> getTimetableByClassAndPeriod(
            @PathVariable String className,
            @PathVariable String academicYear,
            @PathVariable Integer term) {
        return ResponseEntity.ok(timetableService.getTimetableByClassAndPeriod(className, academicYear, term));
    }

    /**
     * Get timetable by class and day
     * GET /api/timetable/class/{className}/day/{day}
     */
    @GetMapping("/class/{className}/day/{day}")
    public ResponseEntity<?> getTimetableByClassAndDay(
            @PathVariable String className,
            @PathVariable String day) {
        try {
            Timetable.DayOfWeek dayOfWeek = Timetable.DayOfWeek.valueOf(day.toUpperCase());
            return ResponseEntity.ok(timetableService.getTimetableByClassAndDay(className, dayOfWeek));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid day: " + day));
        }
    }

    /**
     * Update a timetable entry
     * PUT /api/timetable/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<?> updateTimetableEntry(@PathVariable Long id, @Valid @RequestBody Timetable timetable) {
        try {
            Timetable updated = timetableService.updateTimetableEntry(id, timetable);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a timetable entry
     * DELETE /api/timetable/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<?> deleteTimetableEntry(@PathVariable Long id) {
        try {
            timetableService.deleteTimetableEntry(id);
            return ResponseEntity.ok(Map.of("message", "Timetable entry deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Deactivate a timetable entry (soft delete)
     * POST /api/timetable/{id}/deactivate
     */
    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<?> deactivateTimetableEntry(@PathVariable Long id) {
        try {
            Timetable deactivated = timetableService.deactivateTimetableEntry(id);
            return ResponseEntity.ok(Map.of(
                "message", "Timetable entry deactivated successfully",
                "entry", deactivated
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get teacher's timetable
     * GET /api/timetable/teacher/{teacherId}
     */
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Timetable>> getTeacherTimetable(@PathVariable Long teacherId) {
        return ResponseEntity.ok(timetableService.getTeacherTimetable(teacherId));
    }

    /**
     * Get teacher's timetable by academic year and term
     * GET /api/timetable/teacher/{teacherId}/year/{academicYear}/term/{term}
     */
    @GetMapping("/teacher/{teacherId}/year/{academicYear}/term/{term}")
    public ResponseEntity<List<Timetable>> getTeacherTimetableByPeriod(
            @PathVariable Long teacherId,
            @PathVariable String academicYear,
            @PathVariable Integer term) {
        return ResponseEntity.ok(timetableService.getTeacherTimetableByPeriod(teacherId, academicYear, term));
    }

    /**
     * Get room schedule
     * GET /api/timetable/room/{room}
     */
    @GetMapping("/room/{room}")
    public ResponseEntity<List<Timetable>> getRoomSchedule(@PathVariable String room) {
        return ResponseEntity.ok(timetableService.getRoomSchedule(room));
    }

    /**
     * Get timetable by academic year and term
     * GET /api/timetable/year/{academicYear}/term/{term}
     */
    @GetMapping("/year/{academicYear}/term/{term}")
    public ResponseEntity<List<Timetable>> getTimetableByAcademicPeriod(
            @PathVariable String academicYear,
            @PathVariable Integer term) {
        return ResponseEntity.ok(timetableService.getTimetableByAcademicPeriod(academicYear, term));
    }

    /**
     * Search timetable
     * GET /api/timetable/search?q={searchTerm}
     */
    @GetMapping("/search")
    public ResponseEntity<List<Timetable>> searchTimetable(@RequestParam("q") String searchTerm) {
        return ResponseEntity.ok(timetableService.searchTimetable(searchTerm));
    }

    /**
     * Get teacher workloads
     * GET /api/timetable/workloads?academicYear={year}&term={term}
     */
    @GetMapping("/workloads")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<List<Map<String, Object>>> getTeacherWorkloads(
            @RequestParam String academicYear,
            @RequestParam Integer term) {
        return ResponseEntity.ok(timetableService.getTeacherWorkloads(academicYear, term));
    }

    /**
     * Get periods per subject for a class
     * GET /api/timetable/periods-per-subject?className={className}&academicYear={year}&term={term}
     */
    @GetMapping("/periods-per-subject")
    public ResponseEntity<Map<String, Long>> getPeriodsPerSubject(
            @RequestParam String className,
            @RequestParam String academicYear,
            @RequestParam Integer term) {
        return ResponseEntity.ok(timetableService.getPeriodsPerSubject(className, academicYear, term));
    }

    /**
     * Get standard Ugandan secondary school period template
     * GET /api/timetable/template
     */
    @GetMapping("/template")
    public ResponseEntity<List<Map<String, Object>>> getStandardPeriodTemplate() {
        return ResponseEntity.ok(timetableService.getStandardPeriodTemplate());
    }

    /**
     * Get timetable statistics
     * GET /api/timetable/statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<Map<String, Object>> getTimetableStatistics() {
        return ResponseEntity.ok(timetableService.getTimetableStatistics());
    }
}
