package com.academix.server.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.academix.server.model.Exam;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    // Find by code
    Optional<Exam> findByCode(String code);

    // Check existence
    boolean existsByCode(String code);

    // Find by academic year
    List<Exam> findByAcademicYear(String academicYear);

    // Find by term
    List<Exam> findByTerm(Integer term);

    // Find by academic year and term
    List<Exam> findByAcademicYearAndTerm(String academicYear, Integer term);

    // Find by type
    List<Exam> findByType(Exam.ExamType type);

    // Find by level
    List<Exam> findByLevel(Exam.ExamLevel level);

    // Find by status
    List<Exam> findByStatus(Exam.ExamStatus status);

    // Find published exams
    List<Exam> findByIsPublishedTrue();

    // Find locked exams
    List<Exam> findByIsLockedTrue();

    // Find exams by date range
    List<Exam> findByStartDateBetween(LocalDate start, LocalDate end);

    // Find upcoming exams
    @Query("SELECT e FROM Exam e WHERE e.startDate > :today ORDER BY e.startDate ASC")
    List<Exam> findUpcomingExams(@Param("today") LocalDate today);

    // Find ongoing exams
    @Query("SELECT e FROM Exam e WHERE e.startDate <= :today AND e.endDate >= :today")
    List<Exam> findOngoingExams(@Param("today") LocalDate today);

    // Find exams for a specific class
    @Query("SELECT e FROM Exam e JOIN e.targetClasses c WHERE c = :className")
    List<Exam> findByTargetClass(@Param("className") String className);

    // Find exams with marks entry deadline approaching
    @Query("SELECT e FROM Exam e WHERE e.marksEntryDeadline > :now AND e.marksEntryDeadline <= :deadline AND e.isLocked = false")
    List<Exam> findExamsWithDeadlineApproaching(@Param("now") java.time.LocalDateTime now, @Param("deadline") java.time.LocalDateTime deadline);

    // Search exams
    @Query("SELECT e FROM Exam e WHERE " +
           "LOWER(e.code) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Exam> searchExams(@Param("searchTerm") String searchTerm);

    // Count by status
    long countByStatus(Exam.ExamStatus status);

    // Count by type
    long countByType(Exam.ExamType type);

    // Count by academic year
    long countByAcademicYear(String academicYear);
}
