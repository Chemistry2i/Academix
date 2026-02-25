package com.academix.server.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.academix.server.model.Attendance;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // Find by student
    List<Attendance> findByStudentId(Long studentId);

    List<Attendance> findByStudentIdAndAcademicYearAndTerm(Long studentId, String academicYear, Integer term);

    List<Attendance> findByStudentIdAndDateBetween(Long studentId, LocalDate startDate, LocalDate endDate);

    // Find by class
    List<Attendance> findByClassName(String className);

    List<Attendance> findByClassNameAndDate(String className, LocalDate date);

    List<Attendance> findByClassNameAndAcademicYearAndTerm(String className, String academicYear, Integer term);

    List<Attendance> findByClassNameAndDateBetween(String className, LocalDate startDate, LocalDate endDate);

    // Find by date
    List<Attendance> findByDate(LocalDate date);

    List<Attendance> findByDateAndStatus(LocalDate date, Attendance.AttendanceStatus status);

    // Find by status
    List<Attendance> findByStatus(Attendance.AttendanceStatus status);

    List<Attendance> findByClassNameAndStatus(String className, Attendance.AttendanceStatus status);

    List<Attendance> findByClassNameAndDateAndStatus(String className, LocalDate date, Attendance.AttendanceStatus status);

    // Check existence
    boolean existsByStudentIdAndDateAndSessionType(Long studentId, LocalDate date, Attendance.SessionType sessionType);

    Optional<Attendance> findByStudentIdAndDateAndSessionType(Long studentId, LocalDate date, Attendance.SessionType sessionType);

    // Find with subject (period-specific)
    List<Attendance> findByClassNameAndDateAndPeriodNumber(String className, LocalDate date, Integer periodNumber);

    List<Attendance> findByStudentIdAndSubjectCode(Long studentId, String subjectCode);

    // Count queries
    long countByStudentIdAndStatus(Long studentId, Attendance.AttendanceStatus status);

    long countByStudentIdAndStatusAndAcademicYearAndTerm(
        Long studentId, Attendance.AttendanceStatus status, String academicYear, Integer term);

    long countByClassNameAndDateAndStatus(String className, LocalDate date, Attendance.AttendanceStatus status);

    long countByClassNameAndDate(String className, LocalDate date);

    // Attendance statistics
    @Query("SELECT a.status, COUNT(a) FROM Attendance a " +
           "WHERE a.studentId = :studentId AND a.academicYear = :academicYear AND a.term = :term " +
           "GROUP BY a.status")
    List<Object[]> getStudentAttendanceStats(
        @Param("studentId") Long studentId,
        @Param("academicYear") String academicYear,
        @Param("term") Integer term);

    @Query("SELECT a.status, COUNT(a) FROM Attendance a " +
           "WHERE a.className = :className AND a.date = :date " +
           "GROUP BY a.status")
    List<Object[]> getClassAttendanceStats(
        @Param("className") String className,
        @Param("date") LocalDate date);

    // Attendance percentage
    @Query("SELECT COUNT(a) FROM Attendance a " +
           "WHERE a.studentId = :studentId " +
           "AND a.academicYear = :academicYear AND a.term = :term")
    long countTotalDaysForStudent(
        @Param("studentId") Long studentId,
        @Param("academicYear") String academicYear,
        @Param("term") Integer term);

    @Query("SELECT COUNT(a) FROM Attendance a " +
           "WHERE a.studentId = :studentId " +
           "AND a.academicYear = :academicYear AND a.term = :term " +
           "AND a.status IN ('PRESENT', 'LATE', 'EARLY_DEPARTURE', 'HALF_DAY')")
    long countPresentDaysForStudent(
        @Param("studentId") Long studentId,
        @Param("academicYear") String academicYear,
        @Param("term") Integer term);

    // Students with low attendance
    @Query("SELECT a.studentId, a.studentName, a.className, COUNT(a) as absences " +
           "FROM Attendance a " +
           "WHERE a.academicYear = :academicYear AND a.term = :term " +
           "AND a.status = 'ABSENT' " +
           "GROUP BY a.studentId, a.studentName, a.className " +
           "HAVING COUNT(a) >= :threshold " +
           "ORDER BY absences DESC")
    List<Object[]> getStudentsWithHighAbsences(
        @Param("academicYear") String academicYear,
        @Param("term") Integer term,
        @Param("threshold") Long threshold);

    // Daily attendance summary
    @Query("SELECT a.className, " +
           "SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN a.status = 'ABSENT' THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN a.status = 'LATE' THEN 1 ELSE 0 END), " +
           "COUNT(a) " +
           "FROM Attendance a " +
           "WHERE a.date = :date " +
           "GROUP BY a.className")
    List<Object[]> getDailyAttendanceSummary(@Param("date") LocalDate date);

    // Weekly report
    @Query("SELECT a.date, a.status, COUNT(a) FROM Attendance a " +
           "WHERE a.className = :className " +
           "AND a.date BETWEEN :startDate AND :endDate " +
           "GROUP BY a.date, a.status " +
           "ORDER BY a.date")
    List<Object[]> getWeeklyClassReport(
        @Param("className") String className,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Absentees for a specific date
    @Query("SELECT a FROM Attendance a WHERE a.date = :date AND a.status = 'ABSENT' ORDER BY a.className, a.studentName")
    List<Attendance> getAbsenteesForDate(@Param("date") LocalDate date);

    // Latecomers for a specific date
    @Query("SELECT a FROM Attendance a WHERE a.date = :date AND a.status = 'LATE' ORDER BY a.className, a.checkInTime")
    List<Attendance> getLatecomersForDate(@Param("date") LocalDate date);

    // Search
    @Query("SELECT a FROM Attendance a WHERE " +
           "LOWER(a.studentName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(a.studentNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(a.className) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Attendance> searchAttendance(@Param("searchTerm") String searchTerm);
}
