package com.academix.server.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.academix.server.model.Attendance;
import com.academix.server.service.AttendanceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    /**
     * Mark attendance for a student
     * POST /api/attendance/mark
     */
    @PostMapping("/mark")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('CLASS_TEACHER')")
    public ResponseEntity<?> markAttendance(@Valid @RequestBody Attendance attendance) {
        try {
            Attendance marked = attendanceService.markAttendance(attendance);
            return ResponseEntity.status(HttpStatus.CREATED).body(marked);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Bulk mark attendance
     * POST /api/attendance/bulk
     */
    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('CLASS_TEACHER')")
    public ResponseEntity<?> markBulkAttendance(@Valid @RequestBody List<Attendance> attendanceList) {
        try {
            Map<String, Object> result = attendanceService.markBulkAttendance(attendanceList);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get attendance by ID
     * GET /api/attendance/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAttendanceById(@PathVariable Long id) {
        return attendanceService.getAttendanceById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update attendance record
     * PUT /api/attendance/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('CLASS_TEACHER')")
    public ResponseEntity<?> updateAttendance(@PathVariable Long id, @Valid @RequestBody Attendance attendance) {
        try {
            Attendance updated = attendanceService.updateAttendance(id, attendance);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete attendance record
     * DELETE /api/attendance/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAttendance(@PathVariable Long id) {
        try {
            attendanceService.deleteAttendance(id);
            return ResponseEntity.ok(Map.of("message", "Attendance record deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get attendance by class (class_id)
     * GET /api/attendance/class/{class_id}
     */
    @GetMapping("/class/{className}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('CLASS_TEACHER') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<List<Attendance>> getAttendanceByClass(@PathVariable String className) {
        return ResponseEntity.ok(attendanceService.getAttendanceByClass(className));
    }

    /**
     * Get attendance by class and date
     * GET /api/attendance/class/{className}/date/{date}
     */
    @GetMapping("/class/{className}/date/{date}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('CLASS_TEACHER') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<List<Attendance>> getAttendanceByClassAndDate(
            @PathVariable String className,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByClassAndDate(className, date));
    }

    /**
     * Get attendance by class for date range
     * GET /api/attendance/class/{className}/range?startDate={date}&endDate={date}
     */
    @GetMapping("/class/{className}/range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('CLASS_TEACHER') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<List<Attendance>> getAttendanceByClassAndDateRange(
            @PathVariable String className,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getAttendanceByClassAndDateRange(className, startDate, endDate));
    }

    /**
     * Get attendance by student (student_id)
     * GET /api/attendance/student/{student_id}
     */
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('CLASS_TEACHER') or hasRole('STUDENT') or hasRole('PARENT')")
    public ResponseEntity<List<Attendance>> getAttendanceByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudent(studentId));
    }

    /**
     * Get attendance by student for academic period
     * GET /api/attendance/student/{studentId}/period?academicYear={year}&term={term}
     */
    @GetMapping("/student/{studentId}/period")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('CLASS_TEACHER') or hasRole('STUDENT') or hasRole('PARENT')")
    public ResponseEntity<List<Attendance>> getAttendanceByStudentAndPeriod(
            @PathVariable Long studentId,
            @RequestParam String academicYear,
            @RequestParam Integer term) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudentAndPeriod(studentId, academicYear, term));
    }

    /**
     * Get attendance by student for date range
     * GET /api/attendance/student/{studentId}/range?startDate={date}&endDate={date}
     */
    @GetMapping("/student/{studentId}/range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('CLASS_TEACHER') or hasRole('STUDENT') or hasRole('PARENT')")
    public ResponseEntity<List<Attendance>> getAttendanceByStudentAndDateRange(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudentAndDateRange(studentId, startDate, endDate));
    }

    /**
     * Get today's attendance for a class
     * GET /api/attendance/class/{className}/today
     */
    @GetMapping("/class/{className}/today")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('CLASS_TEACHER')")
    public ResponseEntity<List<Attendance>> getTodayAttendanceByClass(@PathVariable String className) {
        return ResponseEntity.ok(attendanceService.getTodayAttendanceByClass(className));
    }

    /**
     * Get today's absentees
     * GET /api/attendance/today/absentees
     */
    @GetMapping("/today/absentees")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('TEACHER')")
    public ResponseEntity<List<Attendance>> getTodayAbsentees() {
        return ResponseEntity.ok(attendanceService.getTodayAbsentees());
    }

    /**
     * Get today's latecomers
     * GET /api/attendance/today/latecomers
     */
    @GetMapping("/today/latecomers")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('TEACHER')")
    public ResponseEntity<List<Attendance>> getTodayLatecomers() {
        return ResponseEntity.ok(attendanceService.getTodayLatecomers());
    }

    /**
     * Get student attendance statistics
     * GET /api/attendance/student/{studentId}/stats?academicYear={year}&term={term}
     */
    @GetMapping("/student/{studentId}/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('CLASS_TEACHER') or hasRole('STUDENT') or hasRole('PARENT')")
    public ResponseEntity<Map<String, Object>> getStudentAttendanceStats(
            @PathVariable Long studentId,
            @RequestParam String academicYear,
            @RequestParam Integer term) {
        return ResponseEntity.ok(attendanceService.getStudentAttendanceStats(studentId, academicYear, term));
    }

    /**
     * Get class attendance statistics for a date
     * GET /api/attendance/class/{className}/stats?date={date}
     */
    @GetMapping("/class/{className}/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('CLASS_TEACHER') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<Map<String, Object>> getClassAttendanceStats(
            @PathVariable String className,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getClassAttendanceStats(className, date));
    }

    /**
     * Get daily attendance summary
     * GET /api/attendance/summary?date={date}
     */
    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<List<Map<String, Object>>> getDailyAttendanceSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        return ResponseEntity.ok(attendanceService.getDailyAttendanceSummary(date));
    }

    /**
     * Get students with high absences
     * GET /api/attendance/high-absences?academicYear={year}&term={term}&threshold={count}
     */
    @GetMapping("/high-absences")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('CLASS_TEACHER')")
    public ResponseEntity<List<Map<String, Object>>> getStudentsWithHighAbsences(
            @RequestParam String academicYear,
            @RequestParam Integer term,
            @RequestParam(defaultValue = "5") Long threshold) {
        return ResponseEntity.ok(attendanceService.getStudentsWithHighAbsences(academicYear, term, threshold));
    }

    /**
     * Mark parent as notified
     * POST /api/attendance/{id}/notify-parent
     */
    @PostMapping("/{id}/notify-parent")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLASS_TEACHER')")
    public ResponseEntity<?> notifyParent(@PathVariable Long id) {
        try {
            Attendance updated = attendanceService.notifyParent(id);
            return ResponseEntity.ok(Map.of(
                "message", "Parent notification recorded",
                "attendance", updated
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Search attendance records
     * GET /api/attendance/search?q={searchTerm}
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<List<Attendance>> searchAttendance(@RequestParam("q") String searchTerm) {
        return ResponseEntity.ok(attendanceService.searchAttendance(searchTerm));
    }

    /**
     * Get attendance statistics overview
     * GET /api/attendance/statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER')")
    public ResponseEntity<Map<String, Object>> getAttendanceStatistics() {
        return ResponseEntity.ok(attendanceService.getAttendanceStatistics());
    }
}
