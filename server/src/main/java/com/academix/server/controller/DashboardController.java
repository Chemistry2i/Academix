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

import com.academix.server.service.AttendanceService;
import com.academix.server.service.ExamService;
import com.academix.server.service.SchoolClassService;
import com.academix.server.service.StudentService;
import com.academix.server.service.SubjectService;
import com.academix.server.service.TeacherService;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);

    @Autowired
    private StudentService studentService;

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private SchoolClassService schoolClassService;

    @Autowired
    private SubjectService subjectService;

    @Autowired
    private ExamService examService;

    @Autowired
    private AttendanceService attendanceService;

    /**
     * GET /api/dashboard/stats - Get comprehensive dashboard statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> dashboardStats = new HashMap<>();
            
            // Get individual service statistics
            Map<String, Object> studentStats = studentService.getStudentStatistics();
            Map<String, Object> teacherStats = teacherService.getTeacherStatistics();
            Map<String, Object> subjectStats = subjectService.getSubjectStatistics();
            Map<String, Object> examStats = examService.getExamStatistics();
            Map<String, Object> classStats = schoolClassService.getClassStatistics();
            
            // Extract key metrics for dashboard overview
            dashboardStats.put("totalStudents", studentStats.get("totalStudents"));
            dashboardStats.put("totalTeachers", teacherStats.get("totalTeachers"));
            dashboardStats.put("totalSubjects", subjectStats.get("totalSubjects"));
            dashboardStats.put("totalClasses", classStats.get("totalClasses"));
            
            // Student breakdown
            dashboardStats.put("activeStudents", studentStats.get("activeStudents"));
            dashboardStats.put("inactiveStudents", studentStats.get("inactiveStudents"));
            dashboardStats.put("maleStudents", studentStats.get("maleStudents"));
            dashboardStats.put("femaleStudents", studentStats.get("femaleStudents"));
            
            // Teacher breakdown
            dashboardStats.put("activeTeachers", teacherStats.get("activeTeachers"));
            dashboardStats.put("permanentTeachers", teacherStats.get("permanentTeachers"));
            dashboardStats.put("contractTeachers", teacherStats.get("contractTeachers"));
            dashboardStats.put("classTeachers", teacherStats.get("classTeachers"));
            
            // Academic breakdown
            dashboardStats.put("activeSubjects", subjectStats.get("activeSubjects"));
            dashboardStats.put("compulsorySubjects", subjectStats.get("compulsorySubjects"));
            dashboardStats.put("electiveSubjects", subjectStats.get("electiveSubjects"));
            
            // Recent activity counts
            dashboardStats.put("totalExams", examStats.get("totalExams"));
            dashboardStats.put("ongoingExams", examStats.get("ongoingExams"));
            dashboardStats.put("upcomingExams", examStats.get("upcomingExams"));
            
            // Attendance summary (if available)
            try {
                Map<String, Object> attendanceStats = attendanceService.getAttendanceStatistics();
                if (attendanceStats != null) {
                    dashboardStats.put("todayAttendance", attendanceStats.get("todayPresent"));
                    dashboardStats.put("averageAttendance", attendanceStats.get("todayAttendanceRate"));
                }
            } catch (Exception e) {
                logger.warn("Could not fetch attendance statistics: {}", e.getMessage());
                // Set defaults if attendance stats are not available
                dashboardStats.put("todayAttendance", 0);
                dashboardStats.put("averageAttendance", 0.0);
            }
            
            // Add metadata
            dashboardStats.put("lastUpdated", System.currentTimeMillis());
            dashboardStats.put("academicYear", "2024"); // You might want to make this dynamic
            dashboardStats.put("currentTerm", 1); // You might want to make this dynamic
            
            return ResponseEntity.ok(dashboardStats);
            
        } catch (Exception e) {
            logger.error("Failed to get dashboard statistics: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to fetch dashboard statistics: " + e.getMessage()));
        }
    }

    /**
     * GET /api/dashboard/recent-activity - Get recent activity summary
     */
    @GetMapping("/recent-activity")
    public ResponseEntity<?> getRecentActivity() {
        try {
            Map<String, Object> recentActivity = new HashMap<>();
            
            // This would typically fetch recent activities from various services
            // For now, returning basic structure
            recentActivity.put("recentStudentRegistrations", 5);
            recentActivity.put("recentTeacherRegistrations", 2);
            recentActivity.put("recentExams", 3);
            recentActivity.put("lastUpdated", System.currentTimeMillis());
            
            return ResponseEntity.ok(recentActivity);
            
        } catch (Exception e) {
            logger.error("Failed to get recent activity: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to fetch recent activity"));
        }
    }
}