package com.academix.server.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.academix.server.model.Department;
import com.academix.server.model.DepartmentStatus;
import com.academix.server.service.DepartmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "*")
public class DepartmentController {
    
    private static final Logger logger = LoggerFactory.getLogger(DepartmentController.class);
    
    @Autowired
    private DepartmentService departmentService;
    
    /**
     * GET /api/departments - Get all departments with enhanced data
     */
    @GetMapping
    public ResponseEntity<?> getAllDepartments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        try {
            logger.info("GET /api/departments - search: {}, status: {}", search, status);
            
            List<Map<String, Object>> departments;
            
            if (search != null || status != null) {
                DepartmentStatus statusEnum = null;
                if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("all")) {
                    try {
                        statusEnum = DepartmentStatus.valueOf(status.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        logger.warn("Invalid status parameter: {}", status);
                    }
                }
                
                List<Department> filteredDepartments = departmentService.searchDepartments(search, statusEnum);
                departments = convertToEnhancedData(filteredDepartments);
            } else {
                departments = departmentService.getDepartmentsWithCounts();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", departments);
            response.put("total", departments.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to get departments: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to retrieve departments: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/departments/statistics - Get department statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getDepartmentStatistics() {
        try {
            logger.info("GET /api/departments/statistics");
            
            Map<String, Object> statistics = departmentService.getDepartmentStatistics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", statistics);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to get department statistics: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to retrieve department statistics: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/departments/active - Get active departments only
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveDepartments() {
        try {
            logger.info("GET /api/departments/active");
            
            List<Department> departments = departmentService.getActiveDepartments();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", departments);
            response.put("total", departments.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to get active departments: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to retrieve active departments: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/departments/{id} - Get department by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDepartmentById(@PathVariable Long id) {
        try {
            logger.info("GET /api/departments/{}", id);
            
            Department department = departmentService.getDepartmentById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", department);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            logger.error("Department not found with ID: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Department not found"));
        } catch (Exception e) {
            logger.error("Failed to get department: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to retrieve department: " + e.getMessage()));
        }
    }
    
    /**
     * POST /api/departments - Create new department
     */
    @PostMapping
    public ResponseEntity<?> createDepartment(@Valid @RequestBody Department department) {
        try {
            logger.info("POST /api/departments - Creating department: {}", department.getName());
            
            Department savedDepartment = departmentService.createDepartment(department);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", convertToEnhancedData(List.of(savedDepartment)).get(0));
            response.put("message", "Department created successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            logger.error("Validation error creating department: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to create department: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to create department: " + e.getMessage()));
        }
    }
    
    /**
     * PUT /api/departments/{id} - Update department
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDepartment(@PathVariable Long id, @Valid @RequestBody Department department) {
        try {
            logger.info("PUT /api/departments/{} - Updating department", id);
            
            Department updatedDepartment = departmentService.updateDepartment(id, department);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", convertToEnhancedData(List.of(updatedDepartment)).get(0));
            response.put("message", "Department updated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.error("Validation error updating department: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Error updating department: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to update department: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to update department: " + e.getMessage()));
        }
    }
    
    /**
     * DELETE /api/departments/{id} - Delete department
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id) {
        try {
            logger.info("DELETE /api/departments/{}", id);
            
            departmentService.deleteDepartment(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Department deleted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            logger.error("Cannot delete department: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(createErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Error deleting department: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to delete department: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to delete department: " + e.getMessage()));
        }
    }
    
    /**
     * POST /api/departments/{id}/head/{teacherId} - Set department head
     */
    @PostMapping("/{id}/head/{teacherId}")
    public ResponseEntity<?> setDepartmentHead(@PathVariable Long id, @PathVariable Long teacherId) {
        try {
            logger.info("POST /api/departments/{}/head/{}", id, teacherId);
            
            Department updatedDepartment = departmentService.setDepartmentHead(id, teacherId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", updatedDepartment);
            response.put("message", "Department head set successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            logger.error("Error setting department head: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to set department head: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to set department head: " + e.getMessage()));
        }
    }
    
    /**
     * DELETE /api/departments/{id}/head - Remove department head
     */
    @DeleteMapping("/{id}/head")
    public ResponseEntity<?> removeDepartmentHead(@PathVariable Long id) {
        try {
            logger.info("DELETE /api/departments/{}/head", id);
            
            Department updatedDepartment = departmentService.removeDepartmentHead(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", updatedDepartment);
            response.put("message", "Department head removed successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            logger.error("Error removing department head: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to remove department head: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to remove department head: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/departments/search - Advanced search
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchDepartments(
            @RequestParam(required = false) String term,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String building,
            @RequestParam(required = false) Integer establishedYear) {
        try {
            logger.info("GET /api/departments/search - term: {}, status: {}", term, status);
            
            DepartmentStatus statusEnum = null;
            if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("all")) {
                try {
                    statusEnum = DepartmentStatus.valueOf(status.toUpperCase());
                } catch (IllegalArgumentException e) {
                    logger.warn("Invalid status parameter: {}", status);
                }
            }
            
            List<Department> departments;
            if (building != null || establishedYear != null) {
                departments = departmentService.getDepartmentsByCriteria(term, statusEnum, building, establishedYear);
            } else {
                departments = departmentService.searchDepartments(term, statusEnum);
            }
            
            List<Map<String, Object>> enhancedData = convertToEnhancedData(departments);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", enhancedData);
            response.put("total", enhancedData.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to search departments: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to search departments: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/departments/validation/name - Check if department name is unique
     */
    @GetMapping("/validation/name")
    public ResponseEntity<?> validateDepartmentName(
            @RequestParam String name,
            @RequestParam(required = false) Long excludeId) {
        try {
            logger.info("GET /api/departments/validation/name - name: {}, excludeId: {}", name, excludeId);
            
            boolean isUnique = departmentService.isDepartmentNameUnique(name, excludeId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("isUnique", isUnique);
            response.put("message", isUnique ? "Name is available" : "Name is already taken");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to validate department name: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to validate department name: " + e.getMessage()));
        }
    }
    
    /**
     * Convert Department entities to enhanced data maps for frontend
     */
    private List<Map<String, Object>> convertToEnhancedData(List<Department> departments) {
        return departments.stream().map(department -> {
            Map<String, Object> deptData = new HashMap<>();
            deptData.put("id", department.getId());
            deptData.put("name", department.getName());
            deptData.put("description", department.getDescription());
            deptData.put("head", department.getHeadTeacherName() != null ? department.getHeadTeacherName() : "Not Assigned");
            deptData.put("headTeacherId", department.getHeadTeacherId());
            deptData.put("teachers", department.getTeacherCount());
            deptData.put("subjects", department.getSubjectCount());
            deptData.put("students", department.getStudentCount());
            deptData.put("staff", department.getStaffCount());
            deptData.put("established", department.getEstablishedYear() != null ? department.getEstablishedYear().toString() : "N/A");
            deptData.put("status", department.getStatus().getDisplayName());
            deptData.put("building", department.getBuilding());
            deptData.put("floor", department.getFloor());
            deptData.put("officeRoom", department.getOfficeRoom());
            deptData.put("phoneNumber", department.getPhoneNumber());
            deptData.put("email", department.getEmail());
            deptData.put("createdAt", department.getCreatedAt());
            deptData.put("updatedAt", department.getUpdatedAt());
            
            return deptData;
        }).toList();
    }
    
    /**
     * Create error response map
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", message);
        return response;
    }
}