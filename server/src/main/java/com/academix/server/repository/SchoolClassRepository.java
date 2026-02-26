package com.academix.server.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.academix.server.model.SchoolClass;

@Repository
public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {

    // Find by name
    Optional<SchoolClass> findByName(String name);

    Optional<SchoolClass> findByNameAndAcademicYear(String name, String academicYear);

    // Find by form level
    List<SchoolClass> findByFormLevel(Integer formLevel);

    List<SchoolClass> findByFormLevelAndAcademicYear(Integer formLevel, String academicYear);

    // Find by level type
    List<SchoolClass> findByLevelType(SchoolClass.LevelType levelType);

    List<SchoolClass> findByLevelTypeAndAcademicYear(SchoolClass.LevelType levelType, String academicYear);

    // Find by academic year
    List<SchoolClass> findByAcademicYear(String academicYear);

    List<SchoolClass> findByAcademicYearAndIsActiveTrue(String academicYear);

    // Find by course (A-Level)
    List<SchoolClass> findByCourseId(Long courseId);

    List<SchoolClass> findByCourseIdAndAcademicYear(Long courseId, String academicYear);

    // Find by class teacher
    List<SchoolClass> findByClassTeacherId(Long teacherId);

    // Find active classes
    List<SchoolClass> findByIsActiveTrue();

    // Count students query
    @Query("SELECT c.name, c.currentCount, c.maxCapacity FROM SchoolClass c " +
           "WHERE c.academicYear = :academicYear AND c.isActive = true " +
           "ORDER BY c.formLevel, c.stream")
    List<Object[]> getClassEnrollmentSummary(@Param("academicYear") String academicYear);

    // Find O-Level classes
    @Query("SELECT c FROM SchoolClass c WHERE c.levelType = 'O_LEVEL' AND c.academicYear = :academicYear AND c.isActive = true")
    List<SchoolClass> findOLevelClasses(@Param("academicYear") String academicYear);

    // Find A-Level classes
    @Query("SELECT c FROM SchoolClass c WHERE c.levelType = 'A_LEVEL' AND c.academicYear = :academicYear AND c.isActive = true")
    List<SchoolClass> findALevelClasses(@Param("academicYear") String academicYear);

    // Search
    @Query("SELECT c FROM SchoolClass c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(c.stream) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(c.classroom) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<SchoolClass> searchClasses(@Param("searchTerm") String searchTerm);

    // Check if exists
    boolean existsByNameAndAcademicYear(String name, String academicYear);
}
