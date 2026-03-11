package com.academix.server.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.academix.server.model.Staff;

@Repository  
public interface StaffRepository extends JpaRepository<Staff, Long> {

    // Find by email
    Optional<Staff> findByEmail(String email);

    // Find by staffId (e.g., "STF001")
    Optional<Staff> findByStaffId(String staffId);

    // Check existence
    boolean existsByEmail(String email);
    boolean existsByStaffId(String staffId);

    // Find by department
    List<Staff> findByDepartment(String department);
    
    // Find distinct departments
    @Query("SELECT DISTINCT s.department FROM Staff s ORDER BY s.department")
    List<String> findDistinctDepartments();

    // Find by position
    List<Staff> findByPosition(String position);

    // Find by status
    List<Staff> findByStatus(Staff.StaffStatus status);

    // Find by contract type
    List<Staff> findByContractType(Staff.ContractType contractType);

    // Custom queries
    @Query("SELECT s FROM Staff s WHERE s.department = :department AND s.status = :status")
    List<Staff> findByDepartmentAndStatus(@Param("department") String department, 
                                         @Param("status") Staff.StaffStatus status);

    @Query("SELECT s FROM Staff s WHERE s.position LIKE %:position% ORDER BY s.staffId")
    List<Staff> findByPositionContainingIgnoreCase(@Param("position") String position);

    @Query("SELECT s FROM Staff s WHERE s.firstName LIKE %:name% OR s.lastName LIKE %:name% OR s.otherNames LIKE %:name%")
    List<Staff> findByNameContainingIgnoreCase(@Param("name") String name);

    // Count by department
    @Query("SELECT COUNT(s) FROM Staff s WHERE s.department = :department")
    long countByDepartment(@Param("department") String department);

    // Count by status
    @Query("SELECT COUNT(s) FROM Staff s WHERE s.status = :status")
    long countByStatus(@Param("status") Staff.StaffStatus status);

    // Find by experience range
    @Query("SELECT s FROM Staff s WHERE s.experience >= :minExperience AND s.experience <= :maxExperience")
    List<Staff> findByExperienceBetween(@Param("minExperience") Integer minExperience, 
                                       @Param("maxExperience") Integer maxExperience);

    // Find by qualification
    List<Staff> findByQualificationContainingIgnoreCase(String qualification);

    // Search functionality
    @Query("SELECT s FROM Staff s WHERE " +
           "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.otherNames) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.staffId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.department) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.position) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Staff> searchStaff(@Param("searchTerm") String searchTerm);
}