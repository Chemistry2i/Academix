package com.academix.server.controller;

import java.time.LocalDateTime;
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

import com.academix.server.model.Staff;
import com.academix.server.service.StaffService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
public class StaffController {

    private static final Logger logger = LoggerFactory.getLogger(StaffController.class);

    @Autowired
    private StaffService staffService;

    // ==================== CRUD ENDPOINTS ====================

    /**
     * POST /api/staff - Create a new staff member
     */
    @PostMapping
    public ResponseEntity<?> createStaff(@Valid @RequestBody Staff staff) {
        try {
            Staff createdStaff = staffService.createStaff(staff);
            Map<String, Object> response = createSuccessResponse(
                "Staff member created successfully! Login credentials have been sent to email.",
                createdStaff
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Failed to create staff: {}", e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/staff - Get all staff members
     */
    @GetMapping
    public ResponseEntity<?> getAllStaff(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        try {
            List<Staff> staffList;
            
            if (search != null && !search.trim().isEmpty()) {
                staffList = staffService.searchStaff(search);
            } else if (department != null && !department.isEmpty()) {
                staffList = staffService.getStaffByDepartment(department);
            } else if (status != null && !status.isEmpty()) {
                Staff.StaffStatus staffStatus = Staff.StaffStatus.valueOf(status.toUpperCase());
                staffList = staffService.getStaffByStatus(staffStatus);
            } else {
                staffList = staffService.getAllStaff();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("totalStaff", staffList.size());
            response.put("staff", staffList.stream().map(this::createStaffSummary).toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to get staff: {}", e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/staff/{id} - Get staff by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getStaffById(@PathVariable Long id) {
        try {
            Staff staff = staffService.getStaffById(id);
            return ResponseEntity.ok(createStaffDetail(staff));
        } catch (Exception e) {
            logger.error("Failed to get staff {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * PUT /api/staff/{id} - Update staff
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable Long id, @RequestBody Staff staffDetails) {
        try {
            Staff updatedStaff = staffService.updateStaff(id, staffDetails);
            Map<String, Object> response = createSuccessResponse(
                "Staff member updated successfully!",
                updatedStaff
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to update staff {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * DELETE /api/staff/{id} - Delete staff
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
        try {
            staffService.deleteStaff(id);
            Map<String, Object> response = createSuccessResponse(
                "Staff member deleted successfully!",
                null
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to delete staff {}: {}", id, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    // ==================== SPECIFIC ENDPOINTS ====================

    /**
     * GET /api/staff/departments - Get all departments
     */
    @GetMapping("/departments")
    public ResponseEntity<?> getDepartments() {
        try {
            List<String> departments = staffService.getDistinctDepartments();
            Map<String, Object> response = new HashMap<>();
            response.put("departments", departments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to get departments: {}", e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/staff/statistics - Get staff statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getStaffStatistics() {
        try {
            Map<String, Object> stats = staffService.getStaffStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Failed to get staff statistics: {}", e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * PUT /api/staff/{id}/status - Update staff status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStaffStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String statusStr = request.get("status");
            Staff.StaffStatus status = Staff.StaffStatus.valueOf(statusStr.toUpperCase());
            Staff updatedStaff = staffService.updateStaffStatus(id, status);
            Map<String, Object> response = createSuccessResponse(
                "Staff status updated successfully!",
                updatedStaff
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to update staff status {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * GET /api/staff/search - Search staff
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchStaff(@RequestParam String query) {
        try {
            List<Staff> staffList = staffService.searchStaff(query);
            Map<String, Object> response = new HashMap<>();
            response.put("total", staffList.size());
            response.put("staff", staffList.stream().map(this::createStaffSummary).toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to search staff: {}", e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        }
    }

    // ==================== HELPER METHODS ====================

    private Map<String, Object> createStaffSummary(Staff staff) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("id", staff.getId());
        summary.put("staffId", staff.getStaffId());
        summary.put("fullName", staff.getFullName());
        summary.put("firstName", staff.getFirstName());
        summary.put("lastName", staff.getLastName());
        summary.put("email", staff.getEmail());
        summary.put("department", staff.getDepartment());
        summary.put("position", staff.getPosition());
        summary.put("phoneNumber", staff.getPhoneNumber());
        summary.put("status", staff.getStatus());
        summary.put("joinDate", staff.getJoinDate());
        summary.put("contractType", staff.getContractType());
        return summary;
    }

    private Map<String, Object> createStaffDetail(Staff staff) {
        Map<String, Object> detail = createStaffSummary(staff);
        detail.put("otherNames", staff.getOtherNames());
        detail.put("gender", staff.getGender());
        detail.put("dateOfBirth", staff.getDateOfBirth());
        detail.put("nationality", staff.getNationality());
        detail.put("nin", staff.getNin());
        detail.put("disabilityStatus", staff.getDisabilityStatus());
        detail.put("salary", staff.getSalary());
        detail.put("emergencyContactName", staff.getEmergencyContactName());
        detail.put("emergencyContactNumber", staff.getEmergencyContactNumber());
        detail.put("address", staff.getAddress());
        detail.put("qualification", staff.getQualification());
        detail.put("experience", staff.getExperience());
        return detail;
    }

    private Map<String, Object> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("timestamp", LocalDateTime.now());
        if (data != null) {
            if (data instanceof Staff) {
                response.put("data", createStaffDetail((Staff) data));
            } else {
                response.put("data", data);
            }
        }
        return response;
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("timestamp", LocalDateTime.now());
        return response;
    }
}