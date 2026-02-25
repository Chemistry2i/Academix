package com.academix.server.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.academix.server.model.TeacherSubject;

@Repository
public interface TeacherSubjectRepository extends JpaRepository<TeacherSubject, Long> {

    // Find by teacher
    List<TeacherSubject> findByTeacherId(Long teacherId);

    List<TeacherSubject> findByTeacherIdAndStatus(Long teacherId, TeacherSubject.AssignmentStatus status);

    List<TeacherSubject> findByTeacherIdAndAcademicYear(Long teacherId, String academicYear);

    // Find by subject
    List<TeacherSubject> findBySubjectId(Long subjectId);

    List<TeacherSubject> findBySubjectIdAndStatus(Long subjectId, TeacherSubject.AssignmentStatus status);

    // Find specific assignment
    Optional<TeacherSubject> findByTeacherIdAndSubjectId(Long teacherId, Long subjectId);

    boolean existsByTeacherIdAndSubjectId(Long teacherId, Long subjectId);

    // Find primary assignments
    List<TeacherSubject> findByTeacherIdAndIsPrimaryTrue(Long teacherId);

    // Get teachers for a subject
    @Query("SELECT ts FROM TeacherSubject ts " +
           "JOIN FETCH ts.teacher " +
           "WHERE ts.subject.id = :subjectId AND ts.status = 'ACTIVE'")
    List<TeacherSubject> findTeachersForSubject(@Param("subjectId") Long subjectId);

    // Get subjects taught by a teacher with details
    @Query("SELECT ts FROM TeacherSubject ts " +
           "JOIN FETCH ts.subject " +
           "WHERE ts.teacher.id = :teacherId AND ts.status = 'ACTIVE'")
    List<TeacherSubject> findSubjectsTaughtByTeacher(@Param("teacherId") Long teacherId);

    // Count teachers for a subject
    long countBySubjectIdAndStatus(Long subjectId, TeacherSubject.AssignmentStatus status);

    // Count subjects for a teacher
    long countByTeacherIdAndStatus(Long teacherId, TeacherSubject.AssignmentStatus status);
}
