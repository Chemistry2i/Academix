package com.academix.server.controller;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.academix.server.service.StudentService;
import com.academix.server.service.TeacherService;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportsController {

    private static final Logger logger = LoggerFactory.getLogger(ReportsController.class);

    @Autowired
    private StudentService studentService;

    @Autowired
    private TeacherService teacherService;

    /**
     * GET /api/reports/stats - Get reports statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getReportsStats() {
        try {
            Map<String, Object> reportStats = new HashMap<>();
            
            // Basic report statistics (in a real app, you'd track actual reports generated)
            reportStats.put("reportsGenerated", 12);
            reportStats.put("pendingReports", 2);
            reportStats.put("dataCoverage", 95);
            reportStats.put("downloadRate", 78);
            
            // Data freshness indicators
            reportStats.put("lastStudentSync", System.currentTimeMillis() - 3600000); // 1 hour ago
            reportStats.put("lastTeacherSync", System.currentTimeMillis() - 7200000); // 2 hours ago
            reportStats.put("lastAttendanceSync", System.currentTimeMillis() - 1800000); // 30 min ago
            
            // Available report types
            Map<String, Object> availableReports = new HashMap<>();
            availableReports.put("student", "Student Reports");
            availableReports.put("teacher", "Teacher Reports");
            availableReports.put("attendance", "Attendance Reports");
            availableReports.put("finance", "Financial Reports");
            availableReports.put("academic", "Academic Reports");
            
            reportStats.put("availableReportTypes", availableReports);
            reportStats.put("lastUpdated", System.currentTimeMillis());
            
            return ResponseEntity.ok(reportStats);
            
        } catch (Exception e) {
            logger.error("Failed to get reports statistics: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to fetch reports statistics: " + e.getMessage()));
        }
    }

    /**
     * GET /api/reports/available - Get list of available reports
     */
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableReports() {
        try {
            Map<String, Object> reports = new HashMap<>();
            
            // Student-related reports
            Map<String, Object> studentReports = new HashMap<>();
            studentReports.put("enrollment", "Student Enrollment Report");
            studentReports.put("demographics", "Student Demographics Report");
            studentReports.put("performance", "Academic Performance Report");
            
            // Teacher-related reports
            Map<String, Object> teacherReports = new HashMap<>();
            teacherReports.put("staff", "Staff Overview Report");
            teacherReports.put("workload", "Teacher Workload Report");
            teacherReports.put("qualifications", "Staff Qualifications Report");
            
            // Attendance reports
            Map<String, Object> attendanceReports = new HashMap<>();
            attendanceReports.put("daily", "Daily Attendance Report");
            attendanceReports.put("monthly", "Monthly Attendance Summary");
            attendanceReports.put("trends", "Attendance Trends Report");
            
            reports.put("student", studentReports);
            reports.put("teacher", teacherReports);
            reports.put("attendance", attendanceReports);
            
            return ResponseEntity.ok(reports);
            
        } catch (Exception e) {
            logger.error("Failed to get available reports: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to fetch available reports"));
        }
    }
}