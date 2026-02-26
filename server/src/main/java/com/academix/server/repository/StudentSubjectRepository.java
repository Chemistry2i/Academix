package com.academix.server.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.academix.server.model.StudentSubject;

@Repository
public interface StudentSubjectRepository extends JpaRepository<StudentSubject, Long> {

    // Find by student
    List<StudentSubject> findByStudentId(Long studentId);

    List<StudentSubject> findByStudentIdAndStatus(Long studentId, StudentSubject.EnrollmentStatus status);

    List<StudentSubject> findByStudentIdAndAcademicYear(Long studentId, String academicYear);

    // Find by subject
    List<StudentSubject> findBySubjectId(Long subjectId);

    List<StudentSubject> findBySubjectIdAndStatus(Long subjectId, StudentSubject.EnrollmentStatus status);

    // Find specific enrollment
    Optional<StudentSubject> findByStudentIdAndSubjectId(Long studentId, Long subjectId);

    boolean existsByStudentIdAndSubjectId(Long studentId, Long subjectId);

    // Count students in a subject
    long countBySubjectIdAndStatus(Long subjectId, StudentSubject.EnrollmentStatus status);

    // Find principal/subsidiary subjects
    List<StudentSubject> findByStudentIdAndIsPrincipalTrue(Long studentId);

    List<StudentSubject> findByStudentIdAndIsSubsidiaryTrue(Long studentId);

    // Get all active enrollments for a student
    @Query("SELECT ss FROM StudentSubject ss " +
           "JOIN FETCH ss.subject " +
           "WHERE ss.student.id = :studentId AND ss.status = 'ACTIVE'")
    List<StudentSubject> findActiveEnrollmentsWithSubject(@Param("studentId") Long studentId);

    // Get students enrolled in a subject
    @Query("SELECT ss FROM StudentSubject ss " +
           "JOIN FETCH ss.student " +
           "WHERE ss.subject.id = :subjectId AND ss.status = 'ACTIVE'")
    List<StudentSubject> findStudentsEnrolledInSubject(@Param("subjectId") Long subjectId);

    // Count by student
    long countByStudentIdAndStatus(Long studentId, StudentSubject.EnrollmentStatus status);
}
