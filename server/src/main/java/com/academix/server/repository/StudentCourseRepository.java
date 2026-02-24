package com.academix.server.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.academix.server.model.StudentCourse;

@Repository
public interface StudentCourseRepository extends JpaRepository<StudentCourse, Long> {

    // Find by student
    List<StudentCourse> findByStudentId(Long studentId);

    List<StudentCourse> findByStudentIdAndStatus(Long studentId, StudentCourse.EnrollmentStatus status);

    Optional<StudentCourse> findByStudentIdAndAcademicYear(Long studentId, String academicYear);

    // Find by course
    List<StudentCourse> findByCourseId(Long courseId);

    List<StudentCourse> findByCourseIdAndStatus(Long courseId, StudentCourse.EnrollmentStatus status);

    List<StudentCourse> findByCourseIdAndAcademicYear(Long courseId, String academicYear);

    // Find specific enrollment
    Optional<StudentCourse> findByStudentIdAndCourseIdAndAcademicYear(Long studentId, Long courseId, String academicYear);

    boolean existsByStudentIdAndCourseIdAndAcademicYear(Long studentId, Long courseId, String academicYear);

    // Count students in a course
    long countByCourseIdAndStatus(Long courseId, StudentCourse.EnrollmentStatus status);

    long countByCourseIdAndAcademicYearAndStatus(Long courseId, String academicYear, StudentCourse.EnrollmentStatus status);

    // Get students in a course with details
    @Query("SELECT sc FROM StudentCourse sc " +
           "JOIN FETCH sc.student " +
           "WHERE sc.course.id = :courseId AND sc.status = 'ACTIVE'")
    List<StudentCourse> findActiveStudentsInCourse(@Param("courseId") Long courseId);

    // Get course enrollment for a student
    @Query("SELECT sc FROM StudentCourse sc " +
           "JOIN FETCH sc.course " +
           "WHERE sc.student.id = :studentId AND sc.status = 'ACTIVE'")
    Optional<StudentCourse> findActiveEnrollmentForStudent(@Param("studentId") Long studentId);

    // Find by class level
    List<StudentCourse> findByClassLevelAndAcademicYear(String classLevel, String academicYear);
}
