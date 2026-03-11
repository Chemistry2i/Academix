package com.academix.server.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.academix.server.model.Department;
import com.academix.server.model.DepartmentStatus;
import com.academix.server.model.Teacher;
import com.academix.server.repository.DepartmentRepository;
import com.academix.server.repository.StudentRepository;
import com.academix.server.repository.SubjectRepository;
import com.academix.server.repository.TeacherRepository;

@Service
@Transactional
public class DepartmentService {
    
    private static final Logger logger = LoggerFactory.getLogger(DepartmentService.class);
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    @Autowired
    private TeacherRepository teacherRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    /**
     * Create a new department
     */
    public Department createDepartment(Department department) {
        logger.info("Creating new department: {}", department.getName());
        
        // Validate unique name
        if (departmentRepository.existsByNameIgnoreCaseAndIdNot(department.getName(), null)) {
            throw new IllegalArgumentException("Department with name '" + department.getName() + "' already exists");
        }
        
        // Set default values
        if (department.getStatus() == null) {
            department.setStatus(DepartmentStatus.ACTIVE);
        }
        
        department.setCreatedAt(LocalDateTime.now());
        department.setUpdatedAt(LocalDateTime.now());
        
        Department savedDepartment = departmentRepository.save(department);
        logger.info("Department created successfully with ID: {}", savedDepartment.getId());
        
        return savedDepartment;
    }
    
    /**
     * Get all departments
     */
    public List<Department> getAllDepartments() {
        logger.info("Retrieving all departments");
        return departmentRepository.findAll();
    }
    
    /**
     * Get all active departments
     */
    public List<Department> getActiveDepartments() {
        logger.info("Retrieving active departments");
        return departmentRepository.findByStatusOrderByNameAsc(DepartmentStatus.ACTIVE);
    }
    
    /**
     * Get department by ID
     */
    public Department getDepartmentById(Long id) {
        logger.info("Retrieving department with ID: {}", id);
        return departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + id));
    }
    
    /**
     * Get department by name
     */
    public Optional<Department> getDepartmentByName(String name) {
        logger.info("Retrieving department with name: {}", name);
        return departmentRepository.findByNameIgnoreCase(name);
    }
    
    /**
     * Update department
     */
    public Department updateDepartment(Long id, Department departmentDetails) {
        logger.info("Updating department with ID: {}", id);
        
        Department existingDepartment = getDepartmentById(id);
        
        // Validate unique name (excluding current department)
        if (!existingDepartment.getName().equalsIgnoreCase(departmentDetails.getName()) &&
            departmentRepository.existsByNameIgnoreCaseAndIdNot(departmentDetails.getName(), id)) {
            throw new IllegalArgumentException("Department with name '" + departmentDetails.getName() + "' already exists");
        }
        
        // Update fields
        existingDepartment.setName(departmentDetails.getName());
        existingDepartment.setDescription(departmentDetails.getDescription());
        existingDepartment.setEstablishedYear(departmentDetails.getEstablishedYear());
        existingDepartment.setStatus(departmentDetails.getStatus());
        existingDepartment.setBuilding(departmentDetails.getBuilding());
        existingDepartment.setFloor(departmentDetails.getFloor());
        existingDepartment.setOfficeRoom(departmentDetails.getOfficeRoom());
        existingDepartment.setPhoneNumber(departmentDetails.getPhoneNumber());
        existingDepartment.setEmail(departmentDetails.getEmail());
        existingDepartment.setUpdatedAt(LocalDateTime.now());
        
        Department updatedDepartment = departmentRepository.save(existingDepartment);
        logger.info("Department updated successfully");
        
        return updatedDepartment;
    }
    
    /**
     * Delete department
     */
    public void deleteDepartment(Long id) {
        logger.info("Deleting department with ID: {}", id);
        
        Department department = getDepartmentById(id);
        
        // Check if department has associated entities
        if (!department.getTeachers().isEmpty()) {
            throw new IllegalStateException("Cannot delete department with associated teachers, subjects, or staff. Please reassign them first.");
        }
        
        departmentRepository.delete(department);
        logger.info("Department deleted successfully");
    }
    
    /**
     * Get departments by status
     */
    public List<Department> getDepartmentsByStatus(DepartmentStatus status) {
        logger.info("Retrieving departments with status: {}", status);
        return departmentRepository.findByStatus(status);
    }
    
    /**
     * Search departments by name
     */
    public List<Department> searchDepartmentsByName(String name) {
        logger.info("Searching departments by name: {}", name);
        return departmentRepository.findByNameContainingIgnoreCase(name);
    }
    
    /**
     * Advanced search for departments
     */
    public List<Department> searchDepartments(String searchTerm, DepartmentStatus status) {
        logger.info("Advanced search - term: {}, status: {}", searchTerm, status);
        return departmentRepository.searchDepartments(searchTerm, status);
    }
    
    /**
     * Get department statistics for dashboard
     */
    public Map<String, Object> getDepartmentStatistics() {
        logger.info("Calculating department statistics");
        
        Map<String, Object> stats = new HashMap<>();
        
        // Basic counts
        long totalDepartments = departmentRepository.count();
        long activeDepartments = departmentRepository.countDepartmentsByStatus(DepartmentStatus.ACTIVE);
        long inactiveDepartments = departmentRepository.countDepartmentsByStatus(DepartmentStatus.INACTIVE);
        
        // Calculate percentage
        double activePercentage = totalDepartments > 0 ? (double) activeDepartments / totalDepartments * 100 : 0;
        
        // Get total teachers and subjects in active departments
        Long totalTeachers = departmentRepository.getTotalTeachersInActiveDepartments();
        Long totalSubjects = departmentRepository.getTotalSubjectsInActiveDepartments();
        
        // Calculate averages
        double avgTeachersPerDepartment = activeDepartments > 0 ? (double) (totalTeachers != null ? totalTeachers : 0) / activeDepartments : 0;
        double avgSubjectsPerDepartment = activeDepartments > 0 ? (double) (totalSubjects != null ? totalSubjects : 0) / activeDepartments : 0;
        
        stats.put("totalDepartments", totalDepartments);
        stats.put("activeDepartments", activeDepartments);
        stats.put("inactiveDepartments", inactiveDepartments);
        stats.put("activePercentage", Math.round(activePercentage * 100.0) / 100.0);
        stats.put("totalTeachers", totalTeachers != null ? totalTeachers : 0);
        stats.put("totalSubjects", totalSubjects != null ? totalSubjects : 0);
        stats.put("avgTeachersPerDepartment", Math.round(avgTeachersPerDepartment * 100.0) / 100.0);
        stats.put("avgSubjectsPerDepartment", Math.round(avgSubjectsPerDepartment * 100.0) / 100.0);
        
        logger.info("Department statistics calculated successfully");
        return stats;
    }
    
    /**
     * Get departments with enhanced data for frontend display
     */
    public List<Map<String, Object>> getDepartmentsWithCounts() {
        logger.info("Retrieving departments with enhanced data");
        
        List<Department> departments = departmentRepository.findAll();
        
        return departments.stream().map(department -> {
            Map<String, Object> deptData = new HashMap<>();
            deptData.put("id", department.getId());
            deptData.put("name", department.getName());
            deptData.put("description", department.getDescription());
            deptData.put("departmentCode", department.getDepartmentCode());
            deptData.put("head", department.getHeadTeacherName());
            deptData.put("headTeacherId", department.getHeadTeacherId());
            deptData.put("teachers", department.getTeacherCount());
            deptData.put("subjects", department.getSubjectCount());
            deptData.put("students", calculateStudentCount(department.getId()));
            deptData.put("staff", department.getStaffCount());
            deptData.put("established", department.getEstablishedYear() != null ? department.getEstablishedYear().toString() : "N/A");
            deptData.put("status", department.getStatus().getDisplayName());
            deptData.put("academicFocus", department.getAcademicFocus());
            deptData.put("visionStatement", department.getVisionStatement());
            deptData.put("missionStatement", department.getMissionStatement());
            deptData.put("targetEnrollment", department.getTargetEnrollment());
            deptData.put("isCoreDepartment", department.getIsCoreDepartment());
            deptData.put("building", department.getBuilding());
            deptData.put("floor", department.getFloor());
            deptData.put("officeRoom", department.getOfficeRoom());
            deptData.put("phoneNumber", department.getPhoneNumber());
            deptData.put("email", department.getEmail());
            deptData.put("createdAt", department.getCreatedAt());
            deptData.put("updatedAt", department.getUpdatedAt());
            
            return deptData;
        }).collect(Collectors.toList());
    }
    
    /**
     * Calculate student count for a department through subjects
     */
    private int calculateStudentCount(Long departmentId) {
        try {
            // Count students enrolled in subjects belonging to this department
            return subjectRepository.countStudentsInDepartmentSubjects(departmentId).intValue();
        } catch (Exception e) {
            logger.warn("Error calculating student count for department {}: {}", departmentId, e.getMessage());
            return 0;
        }
    }
    
    /**
     * Set department head
     */
    public Department setDepartmentHead(Long departmentId, Long teacherId) {
        logger.info("Setting department head - Department ID: {}, Teacher ID: {}", departmentId, teacherId);
        
        Department department = getDepartmentById(departmentId);
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found with ID: " + teacherId));
        
        // Update previous department head if exists
        if (department.getDepartmentHead() != null) {
            Teacher prevHead = department.getDepartmentHead();
            prevHead.setIsDepartmentHead(false);
            prevHead.setHeadedDepartment(null);
            teacherRepository.save(prevHead);
        }
        
        // Set new department head
        department.setDepartmentHead(teacher);
        department.setHeadAppointedDate(LocalDateTime.now());
        department.setHeadAppointmentDuration(24); // Default 2 years
        department.setUpdatedAt(LocalDateTime.now());
        
        teacher.setIsDepartmentHead(true);
        teacher.setHeadedDepartment(department);
        teacherRepository.save(teacher);
        
        Department updatedDepartment = departmentRepository.save(department);
        logger.info("Department head set successfully");
        
        return updatedDepartment;
    }
    
    /**
     * Remove department head
     */
    public Department removeDepartmentHead(Long departmentId) {
        logger.info("Removing department head for department ID: {}", departmentId);
        
        Department department = getDepartmentById(departmentId);
        
        if (department.getDepartmentHead() != null) {
            Teacher currentHead = department.getDepartmentHead();
            currentHead.setIsDepartmentHead(false);
            currentHead.setHeadedDepartment(null);
            teacherRepository.save(currentHead);
        }
        
        department.setDepartmentHead(null);
        department.setHeadAppointedDate(null);
        department.setHeadAppointmentDuration(null);
        department.setUpdatedAt(LocalDateTime.now());
        
        Department updatedDepartment = departmentRepository.save(department);
        logger.info("Department head removed successfully");
        
        return updatedDepartment;
    }
    
    /**
     * Get departments by criteria
     */
    public List<Department> getDepartmentsByCriteria(String name, DepartmentStatus status, 
                                                    String building, Integer establishedYear) {
        logger.info("Retrieving departments by criteria");
        return departmentRepository.findDepartmentsByCriteria(name, status, building, establishedYear);
    }
    
    /**
     * Get departments with no teachers
     */
    public List<Department> getDepartmentsWithNoTeachers() {
        logger.info("Retrieving departments with no teachers");
        return departmentRepository.findDepartmentsWithNoTeachers();
    }
    
    /**
     * Get departments with no subjects
     */
    public List<Department> getDepartmentsWithNoSubjects() {
        logger.info("Retrieving departments with no subjects");
        return departmentRepository.findDepartmentsWithNoSubjects();
    }
    
    /**
     * Validate department name uniqueness
     */
    public boolean isDepartmentNameUnique(String name, Long excludeId) {
        return !departmentRepository.existsByNameIgnoreCaseAndIdNot(name, excludeId);
    }
}