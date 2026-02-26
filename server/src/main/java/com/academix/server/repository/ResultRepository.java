package com.academix.server.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.academix.server.model.Result;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {

    // Find by student
    List<Result> findByStudentId(Long studentId);

    // Find by student number
    List<Result> findByStudentNumber(String studentNumber);

    // Find by exam
    List<Result> findByExamId(Long examId);

    // Find by exam code
    List<Result> findByExamCode(String examCode);

    // Find by class
    List<Result> findByClassName(String className);

    // Find by class and stream
    List<Result> findByClassNameAndStream(String className, String stream);

    // Find by subject
    List<Result> findBySubjectCode(String subjectCode);

    // Find by student and exam
    List<Result> findByStudentIdAndExamId(Long studentId, Long examId);

    // Find by student, exam, and subject
    Result findByStudentIdAndExamIdAndSubjectCode(Long studentId, Long examId, String subjectCode);

    // Find by class and exam
    List<Result> findByClassNameAndExamId(String className, Long examId);

    // Find by class, exam, and subject
    List<Result> findByClassNameAndExamIdAndSubjectCode(String className, Long examId, String subjectCode);

    // Find by academic year
    List<Result> findByAcademicYear(String academicYear);

    // Find by academic year and term
    List<Result> findByAcademicYearAndTerm(String academicYear, Integer term);

    // Get student's results for an academic year
    List<Result> findByStudentIdAndAcademicYear(Long studentId, String academicYear);

    // Get student's results for a term
    List<Result> findByStudentIdAndAcademicYearAndTerm(Long studentId, String academicYear, Integer term);

    // Calculate class average for a subject in an exam
    @Query("SELECT AVG(r.percentage) FROM Result r WHERE r.examId = :examId AND r.subjectCode = :subjectCode AND r.className = :className")
    Double getClassAverageForSubject(@Param("examId") Long examId, @Param("subjectCode") String subjectCode, @Param("className") String className);

    // Calculate student's overall average for an exam
    @Query("SELECT AVG(r.percentage) FROM Result r WHERE r.examId = :examId AND r.studentId = :studentId")
    Double getStudentAverageForExam(@Param("examId") Long examId, @Param("studentId") Long studentId);

    // Get aggregate points for O-Level (sum of best 8)
    @Query("SELECT SUM(r.gradePoints) FROM Result r WHERE r.studentId = :studentId AND r.examId = :examId ORDER BY r.gradePoints ASC")
    Integer getStudentAggregatePoints(@Param("studentId") Long studentId, @Param("examId") Long examId);

    // Count distinctions (D1, D2) for a student in an exam
    @Query("SELECT COUNT(r) FROM Result r WHERE r.studentId = :studentId AND r.examId = :examId AND r.grade IN ('D1', 'D2')")
    Long countDistinctions(@Param("studentId") Long studentId, @Param("examId") Long examId);

    // Count credits (C3-C6) for a student in an exam
    @Query("SELECT COUNT(r) FROM Result r WHERE r.studentId = :studentId AND r.examId = :examId AND r.grade IN ('C3', 'C4', 'C5', 'C6')")
    Long countCredits(@Param("studentId") Long studentId, @Param("examId") Long examId);

    // Count passes (P7, P8) for a student in an exam
    @Query("SELECT COUNT(r) FROM Result r WHERE r.studentId = :studentId AND r.examId = :examId AND r.grade IN ('P7', 'P8')")
    Long countPasses(@Param("studentId") Long studentId, @Param("examId") Long examId);

    // Count failures (F9) for a student in an exam
    @Query("SELECT COUNT(r) FROM Result r WHERE r.studentId = :studentId AND r.examId = :examId AND r.grade = 'F9'")
    Long countFailures(@Param("studentId") Long studentId, @Param("examId") Long examId);

    // Get top performers in a class for an exam
    @Query("SELECT r.studentId, AVG(r.percentage) as avg FROM Result r WHERE r.examId = :examId AND r.className = :className GROUP BY r.studentId ORDER BY avg DESC")
    List<Object[]> getTopPerformersInClass(@Param("examId") Long examId, @Param("className") String className);

    // Get subject performance analysis
    @Query("SELECT r.subjectCode, AVG(r.percentage), MIN(r.percentage), MAX(r.percentage), COUNT(r) FROM Result r WHERE r.examId = :examId AND r.className = :className GROUP BY r.subjectCode")
    List<Object[]> getSubjectPerformanceAnalysis(@Param("examId") Long examId, @Param("className") String className);

    // Grade distribution for a subject
    @Query("SELECT r.grade, COUNT(r) FROM Result r WHERE r.examId = :examId AND r.subjectCode = :subjectCode AND r.className = :className GROUP BY r.grade")
    List<Object[]> getGradeDistribution(@Param("examId") Long examId, @Param("subjectCode") String subjectCode, @Param("className") String className);

    // Check if result exists
    boolean existsByStudentIdAndExamIdAndSubjectCode(Long studentId, Long examId, String subjectCode);

    // Count by exam
    long countByExamId(Long examId);

    // Count by class and exam
    long countByClassNameAndExamId(String className, Long examId);
}
