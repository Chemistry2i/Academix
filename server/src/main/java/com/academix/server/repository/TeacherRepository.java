package com.academix.server.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.academix.server.model.Teacher;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    // Find by email
    Optional<Teacher> findByEmail(String email);

    // Find by teacherId (e.g., "TCH2024001")
    Optional<Teacher> findByTeacherId(String teacherId);

    // Find by registration number
    Optional<Teacher> findByRegistrationNumber(String registrationNumber);

    // Check existence
    boolean existsByEmail(String email);
    boolean existsByTeacherId(String teacherId);
    boolean existsByRegistrationNumber(String registrationNumber);

    // Find by department name
    List<Teacher> findByDepartment_Name(String departmentName);

    // Find by primary subject
    List<Teacher> findByPrimarySubject(String primarySubject);

    // Find by employment type
    List<Teacher> findByEmploymentType(Teacher.EmploymentType employmentType);

    // Find by employment status
    List<Teacher> findByEmploymentStatus(Teacher.EmploymentStatus employmentStatus);

    // Find active teachers
    List<Teacher> findByIsActiveTrue();

    // Find class teachers
    List<Teacher> findByIsClassTeacherTrue();

    // Find department heads
    List<Teacher> findByIsDepartmentHeadTrue();

    // Find teacher by class responsibility
    Optional<Teacher> findByClassResponsibility(String className);

    // Search teachers by name
    @Query("SELECT t FROM Teacher t WHERE " +
           "LOWER(t.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.otherNames) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.teacherId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Teacher> searchTeachers(@Param("searchTerm") String searchTerm);

    // Find teachers by subject (within subjects list)
    @Query("SELECT t FROM Teacher t JOIN t.subjects s WHERE LOWER(s) = LOWER(:subject)")
    List<Teacher> findBySubject(@Param("subject") String subject);

    // Find teachers assigned to a class
    @Query("SELECT t FROM Teacher t JOIN t.assignedClasses c WHERE LOWER(c) = LOWER(:className)")
    List<Teacher> findByAssignedClass(@Param("className") String className);

    // Advanced search with filters
    @Query("SELECT t FROM Teacher t WHERE " +
           "(:department IS NULL OR t.department.name = :department) AND " +
           "(:employmentType IS NULL OR t.employmentType = :employmentType) AND " +
           "(:employmentStatus IS NULL OR t.employmentStatus = :employmentStatus) AND " +
           "(:isClassTeacher IS NULL OR t.isClassTeacher = :isClassTeacher) AND " +
           "(:isActive IS NULL OR t.isActive = :isActive)")
    List<Teacher> findByFilters(
        @Param("department") String department,
        @Param("employmentType") Teacher.EmploymentType employmentType,
        @Param("employmentStatus") Teacher.EmploymentStatus employmentStatus,
        @Param("isClassTeacher") Boolean isClassTeacher,
        @Param("isActive") Boolean isActive
    );

    // Count by department name
    long countByDepartment_Name(String departmentName);

    // Count active teachers
    long countByIsActiveTrue();

    // Count by employment type
    long countByEmploymentType(Teacher.EmploymentType employmentType);
}
