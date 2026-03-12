package com.academix.server.repository;

import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.academix.server.model.Timetable;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {

    // Find by class
    List<Timetable> findByClassName(String className);

    List<Timetable> findByClassNameAndIsActiveTrue(String className);

    List<Timetable> findByClassNameAndAcademicYearAndTerm(String className, String academicYear, Integer term);

    // Find by class and day
    List<Timetable> findByClassNameAndDayOfWeek(String className, Timetable.DayOfWeek dayOfWeek);

    List<Timetable> findByClassNameAndDayOfWeekAndAcademicYearAndTerm(
        String className, Timetable.DayOfWeek dayOfWeek, String academicYear, Integer term);

    // Find by teacher
    List<Timetable> findByTeacherId(Long teacherId);

    List<Timetable> findByTeacherIdAndAcademicYearAndTerm(Long teacherId, String academicYear, Integer term);

    List<Timetable> findByTeacherIdAndDayOfWeek(Long teacherId, Timetable.DayOfWeek dayOfWeek);

    // Find by room
    List<Timetable> findByRoom(String room);

    List<Timetable> findByRoomAndDayOfWeek(String room, Timetable.DayOfWeek dayOfWeek);

    // Find by subject
    List<Timetable> findBySubjectCode(String subjectCode);

    List<Timetable> findBySubjectCodeAndAcademicYearAndTerm(String subjectCode, String academicYear, Integer term);

    // Find by academic period
    List<Timetable> findByAcademicYearAndTerm(String academicYear, Integer term);

    // Find by period type
    List<Timetable> findByPeriodType(Timetable.PeriodType periodType);

    // Check for conflicts - teacher already assigned at same time
    @Query("SELECT t FROM Timetable t WHERE t.teacherId = :teacherId " +
           "AND t.dayOfWeek = :dayOfWeek " +
           "AND t.academicYear = :academicYear AND t.term = :term " +
           "AND t.isActive = true " +
           "AND ((t.startTime <= :startTime AND t.endTime > :startTime) " +
           "OR (t.startTime < :endTime AND t.endTime >= :endTime) " +
           "OR (t.startTime >= :startTime AND t.endTime <= :endTime))")
    List<Timetable> findTeacherConflicts(
        @Param("teacherId") Long teacherId,
        @Param("dayOfWeek") Timetable.DayOfWeek dayOfWeek,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("academicYear") String academicYear,
        @Param("term") Integer term);

    // Check for conflicts - room already booked at same time
    @Query("SELECT t FROM Timetable t WHERE t.room = :room " +
           "AND t.dayOfWeek = :dayOfWeek " +
           "AND t.academicYear = :academicYear AND t.term = :term " +
           "AND t.isActive = true " +
           "AND ((t.startTime <= :startTime AND t.endTime > :startTime) " +
           "OR (t.startTime < :endTime AND t.endTime >= :endTime) " +
           "OR (t.startTime >= :startTime AND t.endTime <= :endTime))")
    List<Timetable> findRoomConflicts(
        @Param("room") String room,
        @Param("dayOfWeek") Timetable.DayOfWeek dayOfWeek,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("academicYear") String academicYear,
        @Param("term") Integer term);

    // Check for conflicts - class already has lesson at same time
    @Query("SELECT t FROM Timetable t WHERE t.className = :className " +
           "AND t.dayOfWeek = :dayOfWeek " +
           "AND t.academicYear = :academicYear AND t.term = :term " +
           "AND t.isActive = true " +
           "AND ((t.startTime <= :startTime AND t.endTime > :startTime) " +
           "OR (t.startTime < :endTime AND t.endTime >= :endTime) " +
           "OR (t.startTime >= :startTime AND t.endTime <= :endTime))")
    List<Timetable> findClassConflicts(
        @Param("className") String className,
        @Param("dayOfWeek") Timetable.DayOfWeek dayOfWeek,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("academicYear") String academicYear,
        @Param("term") Integer term);

    // Count periods per subject per class
    @Query("SELECT t.subjectCode, COUNT(t) FROM Timetable t " +
           "WHERE t.className = :className " +
           "AND t.academicYear = :academicYear AND t.term = :term " +
           "AND t.isActive = true " +
           "GROUP BY t.subjectCode")
    List<Object[]> countPeriodsPerSubject(
        @Param("className") String className,
        @Param("academicYear") String academicYear,
        @Param("term") Integer term);

    // Teacher workload
    @Query("SELECT t.teacherId, t.teacherName, COUNT(t) FROM Timetable t " +
           "WHERE t.academicYear = :academicYear AND t.term = :term " +
           "AND t.isActive = true AND t.periodType = 'LESSON' " +
           "GROUP BY t.teacherId, t.teacherName")
    List<Object[]> getTeacherWorkloads(
        @Param("academicYear") String academicYear,
        @Param("term") Integer term);

    // Search timetable
    @Query("SELECT t FROM Timetable t WHERE t.isActive = true AND " +
           "(LOWER(t.className) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(t.subjectCode) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(t.subjectName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(t.teacherName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(t.room) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Timetable> searchTimetable(@Param("searchTerm") String searchTerm);

    // Count by various criteria
    long countByClassName(String className);

    long countByTeacherId(Long teacherId);

    long countByAcademicYearAndTerm(String academicYear, Integer term);

    // Distinct counts for statistics
    @Query("SELECT COUNT(DISTINCT t.className) FROM Timetable t WHERE t.isActive = true")
    long countDistinctClasses();

    @Query("SELECT COUNT(DISTINCT t.teacherId) FROM Timetable t WHERE t.isActive = true AND t.teacherId IS NOT NULL")
    long countDistinctTeachers();

    @Query("SELECT COUNT(DISTINCT t.subjectCode) FROM Timetable t WHERE t.isActive = true AND t.subjectCode IS NOT NULL")
    long countDistinctSubjects();

    @Query("SELECT COUNT(t) FROM Timetable t WHERE t.isActive = true AND t.periodType = 'LESSON'")
    long countLessonEntries();
}
