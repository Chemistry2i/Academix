package com.academix.server.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.academix.server.model.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    
    // Find by email
    Optional<Student> findByEmail(String email);
    
    // Find by studentId (unique identifier like "S12024001")
    Optional<Student> findByStudentId(String studentId);
    
    // Find by LINN (Learner Identification Number)
    Optional<Student> findByLinn(String linn);
    
    // Check existence
    boolean existsByEmail(String email);
    boolean existsByStudentId(String studentId);
    boolean existsByLinn(String linn);
    
    // Find students by class
    List<Student> findByCurrentClass(String currentClass);
    
    // Find students by class and stream
    List<Student> findByCurrentClassAndStream(String currentClass, String stream);
    
    // Find students by residence status
    List<Student> findByResidenceStatus(Student.ResidenceStatus residenceStatus);
    
    // Find students by house
    List<Student> findByHouse(String house);
    
    // Find active students
    List<Student> findByIsActiveTrue();
    
    // Find active students by class
    List<Student> findByCurrentClassAndIsActiveTrue(String currentClass);
    
    // Search students by name (first name, last name, or other names)
    @Query("SELECT s FROM Student s WHERE " +
           "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.otherNames) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.studentId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Student> searchStudents(@Param("searchTerm") String searchTerm);
    
    // Advanced search with multiple criteria
    @Query("SELECT s FROM Student s WHERE " +
           "(:currentClass IS NULL OR s.currentClass = :currentClass) AND " +
           "(:stream IS NULL OR s.stream = :stream) AND " +
           "(:house IS NULL OR s.house = :house) AND " +
           "(:residenceStatus IS NULL OR s.residenceStatus = :residenceStatus) AND " +
           "(:isActive IS NULL OR s.isActive = :isActive)")
    List<Student> findByFilters(
        @Param("currentClass") String currentClass,
        @Param("stream") String stream,
        @Param("house") String house,
        @Param("residenceStatus") Student.ResidenceStatus residenceStatus,
        @Param("isActive") Boolean isActive
    );
    
    // Count students by class
    long countByCurrentClass(String currentClass);
    
    // Count active students
    long countByIsActiveTrue();
    
    // Find students by district
    List<Student> findByDistrict(String district);
}
