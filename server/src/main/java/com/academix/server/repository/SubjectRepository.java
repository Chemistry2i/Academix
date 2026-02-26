package com.academix.server.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.academix.server.model.Subject;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    // Find by code
    Optional<Subject> findByCode(String code);

    // Find by name
    Optional<Subject> findByName(String name);

    // Check existence
    boolean existsByCode(String code);
    boolean existsByName(String name);

    // Find by category
    List<Subject> findByCategory(Subject.SubjectCategory category);

    // Find by level
    List<Subject> findByLevel(Subject.SubjectLevel level);

    // Find compulsory subjects
    List<Subject> findByIsCompulsoryTrue();

    // Find science subjects
    List<Subject> findByIsScienceTrue();

    // Find arts subjects
    List<Subject> findByIsArtsTrue();

    // Find active subjects
    List<Subject> findByIsActiveTrue();

    // Find by department
    List<Subject> findByDepartment(String department);

    // Find O-Level subjects
    @Query("SELECT s FROM Subject s WHERE s.level = 'O_LEVEL' OR s.level = 'BOTH'")
    List<Subject> findOLevelSubjects();

    // Find A-Level subjects
    @Query("SELECT s FROM Subject s WHERE s.level = 'A_LEVEL' OR s.level = 'BOTH'")
    List<Subject> findALevelSubjects();

    // Search subjects
    @Query("SELECT s FROM Subject s WHERE " +
           "LOWER(s.code) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Subject> searchSubjects(@Param("searchTerm") String searchTerm);

    // Count by category
    long countByCategory(Subject.SubjectCategory category);

    // Count active
    long countByIsActiveTrue();
}
