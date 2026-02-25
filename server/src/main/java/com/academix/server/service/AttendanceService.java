package com.academix.server.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.academix.server.model.Attendance;
import com.academix.server.model.Student;
import com.academix.server.repository.AttendanceRepository;
import com.academix.server.repository.StudentRepository;

@Service
@Transactional
public class AttendanceService {

    private static final Logger logger = LoggerFactory.getLogger(AttendanceService.class);

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private StudentRepository studentRepository;

    /**
     * Mark attendance for a student
     * POST /api/attendance/mark
     */
    public Attendance markAttendance(Attendance attendance) {
        // Validate student exists
        Student student = studentRepository.findById(attendance.getStudentId())
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + attendance.getStudentId()));

        // Check if already marked
        if (attendanceRepository.existsByStudentIdAndDateAndSessionType(
                attendance.getStudentId(), attendance.getDate(), attendance.getSessionType())) {
            throw new RuntimeException("Attendance already marked for this student on this date and session");
        }

        // Set student details
        attendance.setStudentNumber(student.getStudentId());
        attendance.setStudentName(student.getFullName());
        attendance.setClassName(student.getCurrentClass());
        attendance.setStream(student.getStream());

        // Set date to today if not provided
        if (attendance.getDate() == null) {
            attendance.setDate(LocalDate.now());
        }

        // Set check-in time for present students
        if (attendance.getStatus() == Attendance.AttendanceStatus.PRESENT ||
            attendance.getStatus() == Attendance.AttendanceStatus.LATE) {
            if (attendance.getCheckInTime() == null) {
                attendance.setCheckInTime(LocalTime.now());
            }
        }

        // Default session type
        if (attendance.getSessionType() == null) {
            attendance.setSessionType(Attendance.SessionType.FULL_DAY);
        }

        Attendance saved = attendanceRepository.save(attendance);
        logger.info("Attendance marked: {} - {} - {}", 
            student.getStudentId(), attendance.getDate(), attendance.getStatus());

        return saved;
    }

    /**
     * Bulk mark attendance
     * POST /api/attendance/bulk
     */
    public Map<String, Object> markBulkAttendance(List<Attendance> attendanceList) {
        List<Attendance> successful = new ArrayList<>();
        List<Map<String, String>> errors = new ArrayList<>();

        for (Attendance attendance : attendanceList) {
            try {
                successful.add(markAttendance(attendance));
            } catch (Exception e) {
                Map<String, String> error = new HashMap<>();
                error.put("studentId", String.valueOf(attendance.getStudentId()));
                error.put("error", e.getMessage());
                errors.add(error);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("successful", successful.size());
        result.put("failed", errors.size());
        result.put("successfulRecords", successful);
        result.put("errors", errors);

        logger.info("Bulk attendance marked: {} successful, {} failed", successful.size(), errors.size());
        return result;
    }

    /**
     * Update attendance record
     */
    public Attendance updateAttendance(Long id, Attendance details) {
        Attendance attendance = attendanceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Attendance record not found with id: " + id));

        if (details.getStatus() != null) {
            attendance.setStatus(details.getStatus());
        }
        if (details.getCheckInTime() != null) {
            attendance.setCheckInTime(details.getCheckInTime());
        }
        if (details.getCheckOutTime() != null) {
            attendance.setCheckOutTime(details.getCheckOutTime());
        }
        if (details.getAbsenceReason() != null) {
            attendance.setAbsenceReason(details.getAbsenceReason());
        }
        if (details.getAbsenceNote() != null) {
            attendance.setAbsenceNote(details.getAbsenceNote());
        }
        if (details.getIsExcused() != null) {
            attendance.setIsExcused(details.getIsExcused());
        }
        if (details.getModifiedBy() != null) {
            attendance.setModifiedBy(details.getModifiedBy());
        }

        logger.info("Attendance updated: {} - {}", attendance.getStudentId(), attendance.getDate());
        return attendanceRepository.save(attendance);
    }

    /**
     * Delete attendance record
     */
    public void deleteAttendance(Long id) {
        if (!attendanceRepository.existsById(id)) {
            throw new RuntimeException("Attendance record not found with id: " + id);
        }
        attendanceRepository.deleteById(id);
        logger.info("Attendance deleted: {}", id);
    }

    /**
     * Get attendance by ID
     */
    @Transactional(readOnly = true)
    public Optional<Attendance> getAttendanceById(Long id) {
        return attendanceRepository.findById(id);
    }

    /**
     * Get attendance by class (class_id)
     * GET /api/attendance/class/{class_id}
     */
    @Transactional(readOnly = true)
    public List<Attendance> getAttendanceByClass(String className) {
        return attendanceRepository.findByClassName(className);
    }

    /**
     * Get attendance by class and date
     */
    @Transactional(readOnly = true)
    public List<Attendance> getAttendanceByClassAndDate(String className, LocalDate date) {
        return attendanceRepository.findByClassNameAndDate(className, date);
    }

    /**
     * Get attendance by class for date range
     */
    @Transactional(readOnly = true)
    public List<Attendance> getAttendanceByClassAndDateRange(String className, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByClassNameAndDateBetween(className, startDate, endDate);
    }

    /**
     * Get attendance by student (student_id)
     * GET /api/attendance/student/{student_id}
     */
    @Transactional(readOnly = true)
    public List<Attendance> getAttendanceByStudent(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    /**
     * Get attendance by student for academic period
     */
    @Transactional(readOnly = true)
    public List<Attendance> getAttendanceByStudentAndPeriod(Long studentId, String academicYear, Integer term) {
        return attendanceRepository.findByStudentIdAndAcademicYearAndTerm(studentId, academicYear, term);
    }

    /**
     * Get attendance by student for date range
     */
    @Transactional(readOnly = true)
    public List<Attendance> getAttendanceByStudentAndDateRange(Long studentId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByStudentIdAndDateBetween(studentId, startDate, endDate);
    }

    /**
     * Get today's attendance for a class
     */
    @Transactional(readOnly = true)
    public List<Attendance> getTodayAttendanceByClass(String className) {
        return attendanceRepository.findByClassNameAndDate(className, LocalDate.now());
    }

    /**
     * Get absentees for today
     */
    @Transactional(readOnly = true)
    public List<Attendance> getTodayAbsentees() {
        return attendanceRepository.getAbsenteesForDate(LocalDate.now());
    }

    /**
     * Get latecomers for today
     */
    @Transactional(readOnly = true)
    public List<Attendance> getTodayLatecomers() {
        return attendanceRepository.getLatecomersForDate(LocalDate.now());
    }

    /**
     * Get student attendance statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStudentAttendanceStats(Long studentId, String academicYear, Integer term) {
        Map<String, Object> stats = new HashMap<>();
        
        long totalDays = attendanceRepository.countTotalDaysForStudent(studentId, academicYear, term);
        long presentDays = attendanceRepository.countPresentDaysForStudent(studentId, academicYear, term);
        
        stats.put("studentId", studentId);
        stats.put("academicYear", academicYear);
        stats.put("term", term);
        stats.put("totalDays", totalDays);
        stats.put("presentDays", presentDays);
        stats.put("absentDays", totalDays - presentDays);
        stats.put("attendancePercentage", totalDays > 0 ? (presentDays * 100.0 / totalDays) : 0);

        // Breakdown by status
        List<Object[]> statusBreakdown = attendanceRepository.getStudentAttendanceStats(studentId, academicYear, term);
        Map<String, Long> byStatus = new HashMap<>();
        for (Object[] row : statusBreakdown) {
            byStatus.put(row[0].toString(), (Long) row[1]);
        }
        stats.put("byStatus", byStatus);

        return stats;
    }

    /**
     * Get class attendance statistics for a date
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getClassAttendanceStats(String className, LocalDate date) {
        Map<String, Object> stats = new HashMap<>();
        
        long totalStudents = attendanceRepository.countByClassNameAndDate(className, date);
        long presentCount = attendanceRepository.countByClassNameAndDateAndStatus(
            className, date, Attendance.AttendanceStatus.PRESENT);
        long absentCount = attendanceRepository.countByClassNameAndDateAndStatus(
            className, date, Attendance.AttendanceStatus.ABSENT);
        long lateCount = attendanceRepository.countByClassNameAndDateAndStatus(
            className, date, Attendance.AttendanceStatus.LATE);

        stats.put("className", className);
        stats.put("date", date);
        stats.put("totalStudents", totalStudents);
        stats.put("present", presentCount);
        stats.put("absent", absentCount);
        stats.put("late", lateCount);
        stats.put("attendancePercentage", totalStudents > 0 ? (presentCount * 100.0 / totalStudents) : 0);

        return stats;
    }

    /**
     * Get daily attendance summary for all classes
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDailyAttendanceSummary(LocalDate date) {
        List<Object[]> summary = attendanceRepository.getDailyAttendanceSummary(date);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] row : summary) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("className", row[0]);
            entry.put("present", row[1]);
            entry.put("absent", row[2]);
            entry.put("late", row[3]);
            entry.put("total", row[4]);
            result.add(entry);
        }

        return result;
    }

    /**
     * Get students with high absences
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentsWithHighAbsences(String academicYear, Integer term, Long threshold) {
        List<Object[]> data = attendanceRepository.getStudentsWithHighAbsences(academicYear, term, threshold);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] row : data) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("studentId", row[0]);
            entry.put("studentName", row[1]);
            entry.put("className", row[2]);
            entry.put("absences", row[3]);
            result.add(entry);
        }

        return result;
    }

    /**
     * Mark parent as notified
     */
    public Attendance notifyParent(Long attendanceId) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
            .orElseThrow(() -> new RuntimeException("Attendance record not found"));

        attendance.setParentNotified(true);
        attendance.setParentNotifiedAt(LocalDateTime.now());

        logger.info("Parent notified for attendance: {}", attendanceId);
        return attendanceRepository.save(attendance);
    }

    /**
     * Search attendance records
     */
    @Transactional(readOnly = true)
    public List<Attendance> searchAttendance(String searchTerm) {
        return attendanceRepository.searchAttendance(searchTerm);
    }

    /**
     * Get attendance statistics overview
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAttendanceStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> todaySummary = getDailyAttendanceSummary(today);
        
        long totalPresent = todaySummary.stream()
            .mapToLong(m -> ((Number) m.get("present")).longValue())
            .sum();
        long totalAbsent = todaySummary.stream()
            .mapToLong(m -> ((Number) m.get("absent")).longValue())
            .sum();
        long totalLate = todaySummary.stream()
            .mapToLong(m -> ((Number) m.get("late")).longValue())
            .sum();
        long total = todaySummary.stream()
            .mapToLong(m -> ((Number) m.get("total")).longValue())
            .sum();
        
        stats.put("date", today);
        stats.put("totalRecords", attendanceRepository.count());
        stats.put("todayPresent", totalPresent);
        stats.put("todayAbsent", totalAbsent);
        stats.put("todayLate", totalLate);
        stats.put("todayTotal", total);
        stats.put("todayAttendanceRate", total > 0 ? (totalPresent * 100.0 / total) : 0);
        stats.put("classSummary", todaySummary);

        return stats;
    }
}
