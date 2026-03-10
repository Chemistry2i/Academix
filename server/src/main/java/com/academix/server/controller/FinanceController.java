package com.academix.server.controller;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.academix.server.service.StudentService;

@RestController
@RequestMapping("/api/finance")
@CrossOrigin(origins = "*")
public class FinanceController {

    private static final Logger logger = LoggerFactory.getLogger(FinanceController.class);

    @Autowired
    private StudentService studentService;

    /**
     * GET /api/finance/stats - Get financial statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getFinanceStats() {
        try {
            Map<String, Object> financeStats = new HashMap<>();
            
            // Get student data to calculate financial metrics
            Map<String, Object> studentStats = studentService.getStudentStatistics();
            
            // Calculate basic financial metrics based on student data
            int totalStudents = (Integer) studentStats.getOrDefault("total", 0);
            int activeStudents = (Integer) studentStats.getOrDefault("active", 0);
            
            // Basic fee calculation (in a real app, you'd have fee records)
            double termFee = 500.0; // Base term fee per student
            double totalExpectedRevenue = activeStudents * termFee;
            double collectedRevenue = totalExpectedRevenue * 0.85; // Assume 85% collection rate
            double pendingFees = totalExpectedRevenue - collectedRevenue;
            
            // Basic expense calculation
            int totalTeachers = 15; // In a real app, get from teacher service
            double teacherSalaries = totalTeachers * 800.0; // Average monthly salary
            double otherExpenses = 5000.0; // Utilities, maintenance, etc.
            double totalExpenses = teacherSalaries + otherExpenses;
            
            double netIncome = collectedRevenue - totalExpenses;
            
            financeStats.put("totalRevenue", Math.round(collectedRevenue));
            financeStats.put("expectedRevenue", Math.round(totalExpectedRevenue));
            financeStats.put("pendingFees", Math.round(pendingFees));
            financeStats.put("totalExpenses", Math.round(totalExpenses));
            financeStats.put("teacherSalaries", Math.round(teacherSalaries));
            financeStats.put("otherExpenses", Math.round(otherExpenses));
            financeStats.put("netIncome", Math.round(netIncome));
            financeStats.put("collectionRate", Math.round((collectedRevenue / totalExpectedRevenue) * 100));
            financeStats.put("totalStudents", totalStudents);
            financeStats.put("activeStudents", activeStudents);
            financeStats.put("termFee", termFee);
            financeStats.put("lastUpdated", System.currentTimeMillis());
            
            return ResponseEntity.ok(financeStats);
            
        } catch (Exception e) {
            logger.error("Failed to get finance statistics: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to fetch finance statistics: " + e.getMessage()));
        }
    }

    /**
     * GET /api/finance/revenue - Get revenue breakdown
     */
    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueBreakdown() {
        try {
            Map<String, Object> revenue = new HashMap<>();
            
            // Mock revenue data - in a real app, this would come from payment records
            revenue.put("tuitionFees", 45000);
            revenue.put("examFees", 8000);
            revenue.put("libraryFees", 2000);
            revenue.put("sportsFees", 3500);
            revenue.put("transportFees", 12000);
            revenue.put("other", 1500);
            
            return ResponseEntity.ok(revenue);
            
        } catch (Exception e) {
            logger.error("Failed to get revenue breakdown: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to fetch revenue breakdown"));
        }
    }

    /**
     * GET /api/finance/expenses - Get expense breakdown
     */
    @GetMapping("/expenses")
    public ResponseEntity<?> getExpenseBreakdown() {
        try {
            Map<String, Object> expenses = new HashMap<>();
            
            // Mock expense data - in a real app, this would come from expense records
            expenses.put("salaries", 35000);
            expenses.put("utilities", 5000);
            expenses.put("maintenance", 3000);
            expenses.put("supplies", 4000);
            expenses.put("transport", 2000);
            expenses.put("other", 2000);
            
            return ResponseEntity.ok(expenses);
            
        } catch (Exception e) {
            logger.error("Failed to get expense breakdown: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to fetch expense breakdown"));
        }
    }
}