package com.academix.server.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.academix.server.model.Department;
import com.academix.server.model.DepartmentStatus;
import com.academix.server.model.Teacher;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    
    // Find by name (for uniqueness validation)
    Optional<Department> findByName(String name);
    
    // Find by name ignoring case
    Optional<Department> findByNameIgnoreCase(String name);
    
    // Find by status
    List<Department> findByStatus(DepartmentStatus status);
    
    // Find active departments
    List<Department> findByStatusOrderByNameAsc(DepartmentStatus status);
    
    // Find departments by head teacher
    List<Department> findByDepartmentHead(Teacher teacher);
    
    // Find departments by head teacher ID
    List<Department> findByDepartmentHeadId(Long teacherId);
    
    // Find departments by established year
    List<Department> findByEstablishedYear(Integer year);
    
    // Find departments established after a year
    List<Department> findByEstablishedYearGreaterThanEqual(Integer year);
    
    // Find departments by building
    List<Department> findByBuilding(String building);
    
    // Search departments by name (partial match)
    List<Department> findByNameContainingIgnoreCase(String name);
    
    // Custom query to get departments with teacher count
    @Query("SELECT d FROM Department d LEFT JOIN d.teachers t GROUP BY d ORDER BY d.name")
    List<Department> findAllDepartmentsWithTeachers();
    
    // Get departments with subject count
    @Query("SELECT d FROM Department d LEFT JOIN d.subjects s GROUP BY d ORDER BY d.name")
    List<Department> findAllDepartmentsWithSubjects();
    
    // Get department statistics query
    @Query("SELECT COUNT(d) FROM Department d WHERE d.status = :status")
    Long countDepartmentsByStatus(@Param("status") DepartmentStatus status);
    
    // Get total number of teachers across all departments
    @Query("SELECT COUNT(t) FROM Department d JOIN d.teachers t WHERE d.status = 'ACTIVE'")
    Long getTotalTeachersInActiveDepartments();
    
    // Get total number of subjects across all departments
    @Query("SELECT COUNT(s) FROM Department d JOIN d.subjects s WHERE d.status = 'ACTIVE'")
    Long getTotalSubjectsInActiveDepartments();
    
    // Find departments with no teachers
    @Query("SELECT d FROM Department d WHERE d.teachers IS EMPTY")
    List<Department> findDepartmentsWithNoTeachers();
    
    // Find departments with no subjects
    @Query("SELECT d FROM Department d WHERE d.subjects IS EMPTY")
    List<Department> findDepartmentsWithNoSubjects();
    
    // Get departments with teacher count greater than specified
    @Query("SELECT d FROM Department d WHERE SIZE(d.teachers) > :count")
    List<Department> findDepartmentsWithTeacherCountGreaterThan(@Param("count") Integer count);
    
    // Get departments with subject count greater than specified
    @Query("SELECT d FROM Department d WHERE SIZE(d.subjects) > :count")
    List<Department> findDepartmentsWithSubjectCountGreaterThan(@Param("count") Integer count);
    
    // Find departments by multiple criteria
    @Query("SELECT d FROM Department d WHERE " +
           "(:name IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:status IS NULL OR d.status = :status) AND " +
           "(:building IS NULL OR LOWER(d.building) LIKE LOWER(CONCAT('%', :building, '%'))) AND " +
           "(:establishedYear IS NULL OR d.establishedYear = :establishedYear)")
    List<Department> findDepartmentsByCriteria(
            @Param("name") String name,
            @Param("status") DepartmentStatus status,
            @Param("building") String building,
            @Param("establishedYear") Integer establishedYear
    );
    
    // Get department summary with counts
    @Query("SELECT d.id, d.name, d.departmentCode, " +
           "CASE WHEN d.departmentHead IS NULL THEN 'Not Assigned' ELSE CONCAT(d.departmentHead.firstName, ' ', d.departmentHead.lastName) END, " +
           "d.status, d.establishedYear, " +
           "COUNT(DISTINCT t.id) as teacherCount, " +
           "COUNT(DISTINCT s.id) as subjectCount " +
           "FROM Department d " +
           "LEFT JOIN d.teachers t " +
           "LEFT JOIN d.subjects s " +
           "GROUP BY d.id, d.name, d.departmentCode, d.departmentHead.firstName, d.departmentHead.lastName, d.status, d.establishedYear " +
           "ORDER BY d.name")
    List<Object[]> getDepartmentSummary();
    
    // Check if department name exists (excluding specific ID)
    @Query("SELECT COUNT(d) > 0 FROM Department d WHERE LOWER(d.name) = LOWER(:name) AND (:id IS NULL OR d.id != :id)")
    boolean existsByNameIgnoreCaseAndIdNot(@Param("name") String name, @Param("id") Long id);
    
    // Get departments established in a range
    @Query("SELECT d FROM Department d WHERE d.establishedYear BETWEEN :startYear AND :endYear ORDER BY d.establishedYear DESC")
    List<Department> findDepartmentsEstablishedBetween(@Param("startYear") Integer startYear, @Param("endYear") Integer endYear);
    
    // Advanced search with all possible filters
    @Query("SELECT DISTINCT d FROM Department d " +
           "LEFT JOIN d.teachers t " +
           "LEFT JOIN d.subjects s " +
           "LEFT JOIN d.departmentHead h " +
           "WHERE (:searchTerm IS NULL OR " +
           "       LOWER(d.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "       LOWER(d.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "       LOWER(d.departmentCode) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "       (h IS NOT NULL AND (LOWER(h.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(h.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))))) " +
           "AND (:status IS NULL OR d.status = :status) " +
           "ORDER BY d.name")
    List<Department> searchDepartments(@Param("searchTerm") String searchTerm, @Param("status") DepartmentStatus status);
}