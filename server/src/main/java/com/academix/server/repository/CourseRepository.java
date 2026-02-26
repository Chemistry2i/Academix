package com.academix.server.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.academix.server.model.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    // Find by code
    Optional<Course> findByCode(String code);

    // Find by name
    Optional<Course> findByName(String name);

    // Check existence
    boolean existsByCode(String code);
    boolean existsByName(String name);

    // Find by type
    List<Course> findByType(Course.CourseType type);

    // Find by level
    List<Course> findByLevel(Course.CourseLevel level);

    // Find active courses
    List<Course> findByIsActiveTrue();

    // Find courses with available slots
    @Query("SELECT c FROM Course c WHERE c.maxStudents = 0 OR c.currentEnrollment < c.maxStudents")
    List<Course> findAvailableCourses();

    // Search courses
    @Query("SELECT c FROM Course c WHERE " +
           "LOWER(c.code) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Course> searchCourses(@Param("searchTerm") String searchTerm);

    // Find A-Level courses
    List<Course> findByLevelAndIsActiveTrue(Course.CourseLevel level);

    // Count by type
    long countByType(Course.CourseType type);

    // Count active
    long countByIsActiveTrue();
}
